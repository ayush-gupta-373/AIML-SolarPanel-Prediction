import { useEffect, useRef, useState } from "react";
import { AlertTriangle, LoaderCircle, RotateCcw, UploadCloud } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const CONDITION_GUIDANCE = {
  BakimGereken: {
    title: "Maintenance may be needed",
    summary: "The model sees a region that may need attention; this label does not identify a specific fault.",
    measure: "Ask a qualified solar technician to inspect the marked area and check system performance.",
    precaution: "Do not touch panel wiring, connectors, or damaged surfaces. Do not climb onto the roof.",
  },
  Cracked: {
    title: "Possible panel crack",
    summary: "The marked area resembles a crack in the training labels.",
    measure: "Arrange an inspection by a qualified solar technician; avoid using the panel until it has been assessed.",
    precaution: "Keep away from cracked glass and exposed wiring. Do not attempt a repair yourself.",
  },
  Dirty: {
    title: "Surface dirt or soiling",
    summary: "This label can include visible dust or residue. The model was not trained to distinguish bird droppings from other dirt.",
    measure: "If soiling is visible, follow the panel manufacturer's cleaning guidance or arrange professional cleaning.",
    precaution: "Avoid abrasive tools and chemicals. Do not clean hot panels, climb on the roof, or touch electrical parts.",
  },
  Good: {
    title: "Matched the dataset's “Good” label",
    summary: "This is a visual label match, not proof that the panel is operating safely or efficiently.",
    measure: "No cleaning or repair is indicated by this label alone; continue routine visual and system-performance checks.",
    precaution: "Do not treat this screening as a substitute for an inspection.",
  },
  Saglam: {
    title: "Matched the dataset's “Saglam” label",
    summary: "“Saglam” means healthy in the dataset; this visual match is not a condition guarantee.",
    measure: "No cleaning or repair is indicated by this label alone; continue routine visual and system-performance checks.",
    precaution: "Do not treat this screening as a substitute for an inspection.",
  },
};

function conditionTitle(className) {
  return CONDITION_GUIDANCE[className]?.title || className;
}

function FaultPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef(null);
  const findings = result
    ? [
        ...result.detections.map((detection) => ({ ...detection, reviewOnly: false })),
        ...(result.review_candidates || []).map((detection) => ({ ...detection, reviewOnly: true })),
      ]
    : [];
  const guidance = [...new Set(findings.map((finding) => finding.class_name))];

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

  function resetAnalysis() {
    if (analyzing) return;
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#07885D]">AI visual screening</p>
          <h2 className="mt-2 text-2xl font-bold text-[#172B3A]">Solar Panel Fault Detection</h2>
        </div>
        <button
          type="button"
          onClick={resetAnalysis}
          disabled={analyzing || (!file && !result && !error)}
          className="btn btn-sm shrink-0 gap-2 border-[#DCE7E1] bg-white text-[#315344] hover:bg-[#F0FAF4] disabled:opacity-50"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#718096]">
        Upload a clear panel photo to screen for visible conditions represented by the model.
        Results are suggestions, not a diagnosis. Bird droppings are not a separate model class.
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
            ref={fileInputRef}
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
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">
                  {result.detections.length
                    ? "Possible visual condition"
                    : findings.length
                      ? "Low-confidence area to review"
                      : "No confident condition detected"}
                </p>
                <p className="mt-1">{result.message}</p>
                {!findings.length && (
                  <p className="mt-1">
                    If you can see dust or bird droppings, the model may still miss them. Check the panel visually and follow safe cleaning guidance.
                  </p>
                )}
              </div>
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
                {findings.map((detection, index) => {
                  const [x1, y1, x2, y2] = detection.bbox_xyxy;
                  const label = `${detection.reviewOnly ? "Review" : conditionTitle(detection.class_name)} ${Math.round(detection.confidence * 100)}%`;
                  return (
                    <g key={`${detection.class_id}-${index}`}>
                      <rect
                        x={x1}
                        y={y1}
                        width={Math.max(0, x2 - x1)}
                        height={Math.max(0, y2 - y1)}
                        fill="none"
                        stroke={detection.reviewOnly ? "#FBBF24" : "#21D391"}
                        strokeDasharray={detection.reviewOnly ? "10 6" : undefined}
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

            {findings.length > 0 && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {findings.map((detection, index) => (
                  <li
                    key={`${detection.class_id}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E5EBF0] bg-[#FAFCFB] p-3"
                  >
                    <span className="text-xs font-semibold text-[#263B49]">
                      {conditionTitle(detection.class_name)}
                      {detection.reviewOnly && <span className="ml-1 font-normal text-amber-700">· review suggestion</span>}
                    </span>
                    <span className={`shrink-0 text-xs ${detection.reviewOnly ? "text-amber-700" : "text-[#07885D]"}`}>
                      {Math.round(detection.confidence * 100)}% score
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {guidance.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {guidance.map((className) => {
                  const advice = CONDITION_GUIDANCE[className];
                  if (!advice) return null;
                  return (
                    <article key={className} className="rounded-xl border border-[#E5EBF0] bg-[#FAFCFB] p-4 text-xs leading-5">
                      <h3 className="font-bold text-[#263B49]">{advice.title}</h3>
                      <p className="mt-2 text-[#526574]">{advice.summary}</p>
                      <p className="mt-2"><strong>Suggested measure:</strong> {advice.measure}</p>
                      <p className="mt-2 text-amber-800"><strong>Precaution:</strong> {advice.precaution}</p>
                    </article>
                  );
                })}
              </div>
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
