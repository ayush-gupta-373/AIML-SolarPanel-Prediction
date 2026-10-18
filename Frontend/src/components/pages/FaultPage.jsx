import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, LoaderCircle, UploadCloud } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function FaultPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function chooseFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setFile(null);
      setPreview("");
      setResult(null);
      setError("Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFile(null);
      setPreview("");
      setResult(null);
      setError("The image must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError("");
  }

  async function analyzeImage() {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("image_file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/fault-detection/analyze`, {
        method: "POST",
        body: formData,
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail || "The image could not be analyzed.");
      }
      setResult(body);
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to the fault detection service.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#07885D]">AI visual screening</p>
      <h2 className="mt-2 text-2xl font-bold text-[#172B3A]">Solar Panel Fault Detection</h2>
      <p className="mt-2 text-sm leading-6 text-[#718096]">
        Upload a clear panel photo to screen for visible conditions represented by the model.
        This tool cannot diagnose internal electrical faults.
      </p>

      <section className="mt-5 rounded-2xl border border-[#E5EBF0] bg-white p-5 shadow-sm sm:p-7">
        <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBDCD2] bg-[#F7FBF8] p-5 text-center transition hover:bg-[#EEF8F1]">
          {preview ? (
            <img src={preview} alt="Selected solar panel" className="block h-auto w-full rounded-lg" />
          ) : (
            <>
              <UploadCloud size={42} className="text-[#07885D]" />
              <p className="mt-4 text-sm font-bold text-[#263B49]">Upload a solar panel photo</p>
              <p className="mt-2 text-xs text-[#718096]">JPEG, PNG, or WebP · 10 MB maximum</p>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={chooseFile}
          />
        </label>

        {file && <p className="mt-3 break-all text-xs text-[#718096]">Selected: {file.name}</p>}
        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          disabled={!file || analyzing}
          onClick={analyzeImage}
          className="btn mt-4 w-full border-0 bg-[#079B6A] text-white hover:bg-[#087D59] disabled:bg-gray-300"
        >
          {analyzing ? (
            <><LoaderCircle size={16} className="animate-spin" /> Analyzing photo...</>
          ) : "Analyze photo"}
        </button>

        {result && (
          <section className="mt-6 space-y-4" aria-live="polite">
            <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${
              result.detections.length
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-[#CFE8D9] bg-[#F0FAF4] text-[#256348]"
            }`}>
              {result.detections.length
                ? <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
              <span>{result.message}</span>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-[#172B3A]">
              <img src={preview} alt="Panel photo with detected conditions" className="block h-auto w-full" />
              <svg
                viewBox={`0 0 ${result.image_width} ${result.image_height}`}
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
                role="img"
                aria-label="Detection boxes"
              >
                {result.detections.map((detection, index) => {
                  const [x1, y1, x2, y2] = detection.bbox_xyxy;
                  const label = `${detection.class_name} ${Math.round(detection.confidence * 100)}%`;
                  return (
                    <g key={`${detection.class_id}-${index}`}>
                      <rect
                        x={x1}
                        y={y1}
                        width={Math.max(0, x2 - x1)}
                        height={Math.max(0, y2 - y1)}
                        fill="none"
                        stroke="#21D391"
                        strokeWidth={Math.max(2, result.image_width / 300)}
                      />
                      <text
                        x={x1}
                        y={Math.max(18, y1 - 5)}
                        fill="#FFFFFF"
                        fontSize={Math.max(14, result.image_width / 45)}
                        fontWeight="700"
                        paintOrder="stroke"
                        stroke="#075E43"
                        strokeWidth={Math.max(3, result.image_width / 180)}
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {result.detections.length > 0 && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {result.detections.map((detection, index) => (
                  <li
                    key={`${detection.class_id}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E5EBF0] bg-[#FAFCFB] p-3"
                  >
                    <span className="text-xs font-semibold text-[#263B49]">{detection.class_name}</span>
                    <span className="shrink-0 text-xs text-[#07885D]">
                      {Math.round(detection.confidence * 100)}% confidence
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </section>

      <p className="mt-4 text-[10px] leading-5 text-[#718096]">
        Dataset: <a className="underline" href="https://universe.roboflow.com/solarvision-gwljt/solar-panel-fault-detection" target="_blank" rel="noreferrer">Solar Panel Fault Detection v2</a>,
        provided by its Roboflow contributor under <a className="underline" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.
        This screening result is not a safety inspection or repair diagnosis.
      </p>
    </div>
  );
}

export default FaultPage;
