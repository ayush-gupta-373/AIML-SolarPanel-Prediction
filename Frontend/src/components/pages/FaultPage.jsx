import { useState } from "react";
import { CheckCircle2, UploadCloud } from "lucide-react";

function FaultPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  function chooseFile(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setMessage("");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#07885D]">AI inspection</p>
      <h2 className="mt-2 text-2xl font-bold text-[#172B3A]">Solar Panel Fault Detection</h2>
      <p className="mt-2 text-sm text-[#718096]">Upload a panel image for preview; real analysis will connect to a trained model later.</p>
      <div className="mt-5 rounded-xl border border-[#E5EBF0] bg-white p-5 sm:p-7">
        <label className="flex min-h-60 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBDCD2] bg-[#F7FBF8] p-5 text-center transition hover:bg-[#EEF8F1]">
          {preview ? (
            <img src={preview} alt="Selected solar panel" className="max-h-64 rounded-lg object-contain" />
          ) : (
            <>
              <UploadCloud size={42} className="text-[#07885D]" />
              <p className="mt-4 text-sm font-bold text-[#263B49]">Upload a solar panel image</p>
              <p className="mt-2 text-xs text-[#718096]">Choose an image from your device</p>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={chooseFile} />
        </label>
        {file && <p className="mt-3 text-xs text-[#718096]">Selected: {file.name}</p>}
        {message && <p className="mt-3 text-xs text-red-600">{message}</p>}
        <button
          disabled={!file}
          onClick={() => setMessage("Image preview is ready. Connect the FastAPI image model to run real fault detection.")}
          className="btn mt-4 w-full border-0 bg-[#079B6A] text-white hover:bg-[#087D59] disabled:bg-gray-300"
        >
          Analyze Image
        </button>
        {message && file && (
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#526B5E]">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#07885D]" />
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default FaultPage;
