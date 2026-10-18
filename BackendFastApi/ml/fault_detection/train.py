import argparse
import json
import shutil
from pathlib import Path

import yaml
from ultralytics import YOLO

FAULT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = FAULT_DIR.parents[1]
DATASET_DIR = BACKEND_DIR / "data" / "fault_dataset"
SOURCE_DATASET_YAML = DATASET_DIR / "data.yaml"
RUNS_DIR = FAULT_DIR / "runs"
ARTIFACTS_DIR = FAULT_DIR / "artifacts"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train and export the SolarAI YOLOv8n visual condition detector."
    )
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=8)
    parser.add_argument("--device", default=None, help="Use cpu, 0, or leave automatic.")
    args = parser.parse_args()

    if not SOURCE_DATASET_YAML.exists():
        raise FileNotFoundError(
            f"Fault dataset config was not found at {SOURCE_DATASET_YAML}."
        )
    with SOURCE_DATASET_YAML.open(encoding="utf-8") as dataset_file:
        dataset_config = yaml.safe_load(dataset_file)
    class_names = dataset_config.get("names")
    if not isinstance(class_names, list) or not class_names:
        raise ValueError("Dataset config must provide an ordered 'names' list.")

    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    dataset_config["path"] = str(DATASET_DIR.resolve())
    dataset_config["train"] = "train/images"
    dataset_config["val"] = "valid/images"
    dataset_config["test"] = "test/images"
    training_dataset_yaml = RUNS_DIR / "dataset.yaml"
    with training_dataset_yaml.open("w", encoding="utf-8") as dataset_file:
        yaml.safe_dump(dataset_config, dataset_file, sort_keys=False)

    model = YOLO("yolov8n.pt")
    training_args = {
        "data": str(training_dataset_yaml),
        "epochs": args.epochs,
        "imgsz": args.imgsz,
        "batch": args.batch,
        "workers": 0,
        "project": str(RUNS_DIR),
        "name": "yolov8n",
        "exist_ok": True,
        "patience": 12,
        "seed": 42,
        "verbose": True,
    }
    if args.device:
        training_args["device"] = args.device
    training_result = model.train(**training_args)

    best_weights = Path(training_result.save_dir) / "weights" / "best.pt"
    if not best_weights.exists():
        raise FileNotFoundError(f"Training did not produce best weights at {best_weights}.")

    best_model = YOLO(str(best_weights))
    test_args = {
        "data": str(training_dataset_yaml),
        "split": "test",
        "imgsz": args.imgsz,
        "batch": args.batch,
        "workers": 0,
    }
    if args.device:
        test_args["device"] = args.device
    test_metrics = best_model.val(
        **test_args,
    )
    exported_model = best_model.export(
        format="onnx",
        imgsz=args.imgsz,
        opset=12,
        nms=True,
        max_det=50,
        device=args.device or "cpu",
    )

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(exported_model, ARTIFACTS_DIR / "fault_detector.onnx")
    with (ARTIFACTS_DIR / "class_names.json").open("w", encoding="utf-8") as class_file:
        json.dump(
            {"names": class_names, "image_size": args.imgsz},
            class_file,
            ensure_ascii=False,
            indent=2,
        )

    results = {
        "model": "YOLOv8n",
        "dataset": str(SOURCE_DATASET_YAML),
        "classes": class_names,
        "test_metrics": {
            "map50": float(test_metrics.box.map50),
            "map50_95": float(test_metrics.box.map),
            "precision": float(test_metrics.box.mp),
            "recall": float(test_metrics.box.mr),
        },
    }
    with (ARTIFACTS_DIR / "test_metrics.json").open("w", encoding="utf-8") as metrics_file:
        json.dump(results, metrics_file, ensure_ascii=False, indent=2)
    print(json.dumps(results, ensure_ascii=False, indent=2))
    print(f"ONNX model saved to: {ARTIFACTS_DIR / 'fault_detector.onnx'}")


if __name__ == "__main__":
    main()
