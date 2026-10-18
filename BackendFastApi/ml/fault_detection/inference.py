import json
from functools import lru_cache
from pathlib import Path

import numpy as np
import onnxruntime
from PIL import Image

FAULT_MODEL_DIR = Path(__file__).resolve().parent / "artifacts"
FAULT_MODEL_FILE = FAULT_MODEL_DIR / "fault_detector.onnx"
CLASS_NAMES_FILE = FAULT_MODEL_DIR / "class_names.json"
MODEL_IMAGE_SIZE = 640
MAX_DETECTIONS = 50


@lru_cache(maxsize=1)
def load_fault_model() -> tuple[onnxruntime.InferenceSession, list[str], int]:
    if not FAULT_MODEL_FILE.exists() or not CLASS_NAMES_FILE.exists():
        raise FileNotFoundError(
            "Fault detection model is not trained. Run "
            "BackendFastApi/ml/fault_detection/train.py first."
        )

    with CLASS_NAMES_FILE.open(encoding="utf-8") as class_file:
        model_metadata = json.load(class_file)
    if isinstance(model_metadata, list):
        class_names = model_metadata
        image_size = MODEL_IMAGE_SIZE
    elif isinstance(model_metadata, dict):
        class_names = model_metadata.get("names")
        image_size = model_metadata.get("image_size", MODEL_IMAGE_SIZE)
    else:
        raise ValueError("Fault detection class metadata is invalid.")
    if not isinstance(class_names, list) or not class_names:
        raise ValueError("Fault detection class metadata is invalid.")
    if not isinstance(image_size, int) or image_size <= 0:
        raise ValueError("Fault detection image size metadata is invalid.")

    session = onnxruntime.InferenceSession(
        str(FAULT_MODEL_FILE),
        providers=["CPUExecutionProvider"],
    )
    return session, class_names, image_size


def prepare_image(image: Image.Image, image_size: int) -> tuple[np.ndarray, float, int, int]:
    image_width, image_height = image.size
    scale = min(
        image_size / image_width,
        image_size / image_height,
    )
    resized_width = round(image_width * scale)
    resized_height = round(image_height * scale)
    resized = image.resize((resized_width, resized_height), Image.Resampling.BILINEAR)
    canvas = Image.new("RGB", (image_size, image_size), (114, 114, 114))
    pad_x = round((image_size - resized_width) / 2 - 0.1)
    pad_y = round((image_size - resized_height) / 2 - 0.1)
    canvas.paste(resized, (pad_x, pad_y))
    image_array = np.asarray(canvas, dtype=np.float32) / 255.0
    input_tensor = np.transpose(image_array, (2, 0, 1))[np.newaxis, ...]
    return input_tensor, scale, pad_x, pad_y


def predict_faults(image: Image.Image, confidence_threshold: float = 0.25) -> dict:
    session, class_names, image_size = load_fault_model()
    image = image.convert("RGB")
    image_width, image_height = image.size
    input_tensor, scale, pad_x, pad_y = prepare_image(image, image_size)
    input_name = session.get_inputs()[0].name
    output = session.run(None, {input_name: input_tensor})[0]
    predictions = np.asarray(output)

    if predictions.ndim == 3:
        predictions = predictions[0]
    if predictions.ndim != 2 or predictions.shape[1] < 6:
        raise ValueError("Fault detection model returned an unsupported output shape.")

    detections = []
    for prediction in predictions:
        x1, y1, x2, y2, confidence, class_id = prediction[:6]
        if confidence < confidence_threshold:
            continue
        class_index = int(class_id)
        if class_index < 0 or class_index >= len(class_names):
            continue

        x1 = float(np.clip((x1 - pad_x) / scale, 0, image_width))
        y1 = float(np.clip((y1 - pad_y) / scale, 0, image_height))
        x2 = float(np.clip((x2 - pad_x) / scale, 0, image_width))
        y2 = float(np.clip((y2 - pad_y) / scale, 0, image_height))
        detections.append({
            "class_id": class_index,
            "class_name": class_names[class_index],
            "confidence": round(float(confidence), 4),
            "bbox_xyxy": [
                round(x1, 1),
                round(y1, 1),
                round(x2, 1),
                round(y2, 1),
            ],
        })
        if len(detections) >= MAX_DETECTIONS:
            break

    return {
        "image_width": image_width,
        "image_height": image_height,
        "confidence_threshold": confidence_threshold,
        "detections": detections,
    }
