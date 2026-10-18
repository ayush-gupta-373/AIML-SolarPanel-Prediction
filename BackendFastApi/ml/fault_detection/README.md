# SolarAI visual fault screening

The detector is a YOLOv8n object detector trained on the Roboflow solar-panel
fault dataset. It screens phone-style RGB photos for the dataset's labeled
visible classes; it cannot diagnose internal electrical faults.

## Train and export

From `BackendFastApi` in PowerShell:

```powershell
.\.venv\Scripts\python.exe -m pip install -r ml\fault_detection\requirements-train.txt
.\.venv\Scripts\python.exe ml\fault_detection\train.py --epochs 50 --batch 8
```

The script trains from the dataset's train and validation splits, evaluates on
its test split, and exports an ONNX model plus class metadata and test metrics
to `ml/fault_detection/artifacts/`. The ONNX file is used for CPU inference and
does not require PyTorch in the deployed API. The dataset and intermediate
training runs are excluded from Git; deploy the trained `artifacts` files
alongside the backend.

Training is substantially faster on a CUDA GPU; on a GPU machine, pass
`--device 0`. For a CPU-only environment, expect training to take much longer.
Train locally or in a GPU notebook, then deploy only the exported artifacts.

Download the permitted dataset version from the linked Roboflow source into
`data/fault_dataset/` before training. Do not commit or redistribute the
downloaded images unless the source terms allow it.

## Run the API

Install `Requirements.txt` from `BackendFastApi`, then start FastAPI:

```powershell
.\.venv\Scripts\python.exe -m pip install -r Requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Configure `VITE_API_BASE_URL` in the frontend with the backend URL. In the
backend deployment, set `FRONTEND_ORIGINS` to the frontend origin(s), separated
by commas. The endpoint `POST /api/fault-detection/analyze` accepts a multipart
`image_file` upload (JPEG, PNG, or WebP; maximum 10 MB).

For Render, set the service root directory to `BackendFastApi`, use
`pip install -r Requirements.txt` as the build command, and
`python -m uvicorn main:app --host 0.0.0.0 --port $PORT` as the start command.
Include the generated files from `ml/fault_detection/artifacts/` in the
deployment; without them the endpoint intentionally responds with HTTP 503.

## Data and attribution

Dataset source: [Solar Panel Fault Detection v2 on Roboflow
Universe](https://universe.roboflow.com/solarvision-gwljt/solar-panel-fault-detection/dataset/2),
provided under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Retain attribution to the dataset contributor and note modifications when
redistributing the dataset or a derivative.

The source labels include both `Good` and `Saglam`; verify that those labels
have distinct meanings before interpreting those predictions as separate
conditions. The test split is small, so independently evaluate on new photos
from the intended phones and deployment conditions before relying on results.
