import { useState } from "react";
import { IndianRupee, Sun, Zap } from "lucide-react";
import MetricCard from "../common/MetricCard";

function CalculatorPage() {
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [consumption, setConsumption] = useState("");
  const [result, setResult] = useState(null);

  function calculate(e) {
    e.preventDefault();
    const units = Number(consumption);
    if (!state || !city || !Number.isFinite(units) || units <= 0) return;

    const capacity = Math.max(1, Math.ceil(units / 120));
    setResult({
      capacity,
      generation: capacity * 120,
      savings: Math.min(units, capacity * 120) * 7,
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#07885D]">Solar calculator</p>
        <h2 className="mt-2 text-2xl font-bold text-[#172B3A]">Find Your Ideal Solar System</h2>
        <p className="mt-2 text-sm text-[#718096]">Enter your location and electricity consumption to see an illustrative estimate.</p>
      </div>

      <form onSubmit={calculate} className="grid gap-5 rounded-xl border border-[#E5EBF0] bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7">
        <label className="form-control gap-2">
          <span className="label-text text-xs font-semibold">State</span>
          <select className="select select-bordered w-full bg-white" value={state} onChange={(e) => { setState(e.target.value); setCity(""); }} required>
            <option value="">Select state</option>
            <option>Uttar Pradesh</option>
            <option>Maharashtra</option>
            <option>Delhi</option>
            <option>Rajasthan</option>
            <option>Karnataka</option>
            <option>Gujarat</option>
            <option>Tamil Nadu</option>
            <option>Madhya Pradesh</option>
          </select>
        </label>

        <label className="form-control gap-2">
          <span className="label-text text-xs font-semibold">City</span>
          <input className="input input-bordered w-full bg-white" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter your city" required />
        </label>

        <label className="form-control gap-2 sm:col-span-2">
          <span className="label-text text-xs font-semibold">Monthly electricity consumption (kWh)</span>
          <input className="input input-bordered w-full bg-white" type="number" min="1" value={consumption} onChange={(e) => setConsumption(e.target.value)} placeholder="e.g. 350" required />
        </label>

        <button type="submit" className="btn border-0 bg-[#079B6A] text-white hover:bg-[#087D59] sm:col-span-2">
          Calculate solar needs
        </button>
      </form>

      {result && (
        <div className="mt-5 rounded-xl border border-[#D9EDE1] bg-white p-5">
          <h3 className="font-bold text-[#172B3A]">Illustrative result</h3>
          <p className="mt-2 text-sm text-[#718096]">{city}, {state}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MetricCard title="Suggested capacity" value={`${result.capacity} kW`} note="Rough rule-of-thumb estimate" icon={Zap} iconColor="text-[#07885D]" iconBg="bg-[#E4F5EB]" />
            <MetricCard title="Monthly generation" value={`~${result.generation} kWh`} note="Not yet location-adjusted" icon={Sun} iconColor="text-[#D6A01C]" iconBg="bg-[#FFF4D9]" />
            <MetricCard title="Potential monthly value" value={`₹${result.savings.toLocaleString("en-IN")}`} note="Assumes ₹7 per offset unit" icon={IndianRupee} iconColor="text-[#7164C2]" iconBg="bg-[#EFECFF]" />
          </div>
          <p className="mt-4 text-xs leading-5 text-[#718096]">
            This is a placeholder estimate, not an engineering recommendation. We will replace the rule-of-thumb with your location-specific PVGIS dataset and tariff assumptions.
          </p>
        </div>
      )}
    </div>
  );
}

export default CalculatorPage;
