import { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CircleAlert,
  IndianRupee,
  MapPin,
  Sun,
  Zap,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const fixedChargeOptions = [0, 100, 200, 300, 500, 750, 1000, 1500, 2000];
const CALCULATOR_STORAGE_KEY = "solarai-calculator-state";
const defaultTariffSlabs = [
  { up_to_kwh: "100", rate_per_kwh: "4" },
  { up_to_kwh: "300", rate_per_kwh: "6" },
  { up_to_kwh: "", rate_per_kwh: "8" },
];
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function loadSavedCalculatorState() {
  try {
    const saved = localStorage.getItem(CALCULATOR_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (storageError) {
    console.error("Could not restore the saved solar calculator state.", storageError);
    return {};
  }
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: "index" },
  plugins: {
    legend: {
      position: "bottom",
      labels: { usePointStyle: true, boxWidth: 7, padding: 18, color: "#52657B", font: { size: 10 } },
    },
    tooltip: {
      backgroundColor: "#102D37",
      padding: 11,
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: "#718096", maxRotation: 0, font: { size: 9 } },
    },
    y: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: "#EDF1F4" },
      ticks: { color: "#718096", font: { size: 9 } },
    },
  },
};

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-[#E5EBF0] bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-sm font-bold text-[#172B3A]">{title}</h3>
      <p className="mt-1 text-[10px] leading-4 text-[#718096]">{subtitle}</p>
      <div className="mt-4 h-64">{children}</div>
    </section>
  );
}

function CalculatorPage() {
  const [savedState] = useState(loadSavedCalculatorState);
  const [locations, setLocations] = useState([]);
  const [selectedState, setSelectedState] = useState(savedState.selectedState || "");
  const [selectedCityId, setSelectedCityId] = useState(savedState.selectedCityId || "");
  const [consumption, setConsumption] = useState(savedState.consumption || "");
  const [tariffSlabs, setTariffSlabs] = useState(savedState.tariffSlabs || defaultTariffSlabs);
  const [fixedCharge, setFixedCharge] = useState(savedState.fixedCharge || "");
  const [result, setResult] = useState(savedState.result || null);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify({
        selectedState,
        selectedCityId,
        consumption,
        tariffSlabs,
        fixedCharge,
        result,
      }));
    } catch (storageError) {
      console.error("Could not save the solar calculator state.", storageError);
    }
  }, [selectedState, selectedCityId, consumption, tariffSlabs, fixedCharge, result]);

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      setLoadingLocations(true);
      setLocationError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/solar/locations`);
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.detail || "Unable to load the city list.");
        }
        if (!cancelled) setLocations(body.cities);
      } catch (requestError) {
        if (!cancelled) {
          setLocationError(requestError.message || "Unable to connect to the solar service.");
        }
      } finally {
        if (!cancelled) setLoadingLocations(false);
      }
    }

    loadLocations();
    return () => {
      cancelled = true;
    };
  }, []);

  const states = useMemo(
    () => [...new Set(locations.map((location) => location.state))].sort((a, b) => a.localeCompare(b)),
    [locations],
  );
  const cities = useMemo(
    () => locations.filter((location) => location.state === selectedState),
    [locations, selectedState],
  );

  async function calculate(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/solar/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city_id: selectedCityId,
          monthly_consumption_kwh: Number(consumption),
          fixed_monthly_charge_inr: Number(fixedCharge),
          tariff_slabs: tariffSlabs.map((slab, index) => ({
            up_to_kwh: index === tariffSlabs.length - 1 ? null : Number(slab.up_to_kwh),
            rate_per_kwh: Number(slab.rate_per_kwh),
          })),
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail || "The solar estimate could not be calculated.");
      }
      setResult(body);
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to the solar service.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetCalculator() {
    setSelectedState("");
    setSelectedCityId("");
    setConsumption("");
    setTariffSlabs([{ up_to_kwh: "", rate_per_kwh: "" }]);
    setFixedCharge("");
    setResult(null);
    setError("");
  }

  const monthlyGenerationData = result && {
    labels: result.monthly_estimates.map((item) => item.month.slice(0, 3)),
    datasets: [
      {
        label: "Solar production",
        data: result.monthly_estimates.map((item) => item.generation_kwh),
        backgroundColor: "#0B9A6A",
        borderRadius: 5,
        maxBarThickness: 25,
      },
      {
        label: "Household use",
        data: result.monthly_estimates.map((item) => item.consumption_kwh),
        backgroundColor: "#E6B93F",
        borderRadius: 5,
        maxBarThickness: 25,
      },
    ],
  };

  const monthlySavingsData = result && {
    labels: result.monthly_estimates.map((item) => item.month.slice(0, 3)),
    datasets: [
      {
        label: "Bill before solar",
        data: result.monthly_estimates.map((item) => item.bill_before_solar_inr),
        backgroundColor: "#E9B94A",
        borderRadius: 5,
        maxBarThickness: 25,
      },
      {
        label: "Bill after solar credits",
        data: result.monthly_estimates.map((item) => item.bill_after_solar_inr),
        backgroundColor: "rgba(96, 103, 191, 0.78)",
        borderRadius: 5,
        maxBarThickness: 25,
      },
    ],
  };

  const capacityData = result && {
    labels: result.capacity_comparison.map((item) => `${item.capacity_kw} kW`),
    datasets: [
      {
        label: "Annual solar production (kWh)",
        data: result.capacity_comparison.map((item) => item.annual_generation_kwh),
        backgroundColor: result.capacity_comparison.map((item) =>
          item.capacity_kw === result.recommended_capacity_kw ? "#0B9A6A" : "#BBDCCB",
        ),
        borderRadius: 5,
        maxBarThickness: 42,
      },
    ],
  };

  const projectionGenerationData = result && {
    labels: result.yearly_projection.map((item) => item.year),
    datasets: [
      {
        label: "Projected annual production (kWh)",
        data: result.yearly_projection.map((item) => item.generation_kwh),
        borderColor: "#0B9A6A",
        backgroundColor: "rgba(11, 154, 106, 0.12)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 8,
      },
    ],
  };

  const projectionSavingsData = result && {
    labels: result.yearly_projection.map((item) => item.year),
    datasets: [
      {
        label: "Cumulative estimated savings (₹)",
        data: result.yearly_projection.map((item) => item.cumulative_savings_inr),
        borderColor: "#7063BC",
        backgroundColor: "rgba(112, 99, 188, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 8,
      },
    ],
  };

  const yearlyProjectionOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        ticks: { ...chartOptions.scales.x.ticks, maxTicksLimit: 9 },
      },
    },
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B3C31] via-[#087654] to-[#0B9A6A] p-6 text-white shadow-sm sm:p-8">
        <div className="absolute -right-12 -top-16 h-60 w-60 rounded-full border-[28px] border-white/[0.07]" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BDEBD2]">PVGIS-trained prediction</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Plan your solar savings</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Choose your location and usage to estimate monthly production, system size, and potential bill savings.
          </p>
        </div>
      </section>

      <form onSubmit={calculate} className="rounded-2xl border border-[#E5EBF0] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF6F0] text-[#07885D]">
              <MapPin size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#172B3A]">Your location and electricity use</h3>
              <p className="text-[10px] text-[#718096]">All location choices come from the India city coordinates dataset.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetCalculator}
            disabled={submitting}
            className="btn btn-sm shrink-0 border border-[#E5EBF0] bg-white text-[#52657B] hover:bg-[#F5FAF7]"
          >
            Reset details
          </button>
        </div>

        {locationError && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {locationError} Start the FastAPI backend and try again.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="form-control gap-2">
            <span className="label-text text-xs font-semibold">State / territory</span>
            <select
              className="select select-bordered w-full bg-white"
              value={selectedState}
              onChange={(event) => {
                setSelectedState(event.target.value);
                setSelectedCityId("");
                setResult(null);
              }}
              required
              disabled={loadingLocations || Boolean(locationError)}
            >
              <option value="">{loadingLocations ? "Loading locations..." : "Select state"}</option>
              {states.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>

          <label className="form-control gap-2">
            <span className="label-text text-xs font-semibold">City</span>
            <select
              className="select select-bordered w-full bg-white"
              value={selectedCityId}
              onChange={(event) => {
                setSelectedCityId(event.target.value);
                setResult(null);
              }}
              required
              disabled={!selectedState || loadingLocations || Boolean(locationError)}
            >
              <option value="">Select city</option>
              {cities.map((city) => (
                <option key={city.city_id} value={city.city_id}>{city.city}</option>
              ))}
            </select>
          </label>

          <label className="form-control gap-2">
            <span className="label-text text-xs font-semibold">Monthly electricity use (kWh)</span>
            <input
              type="number"
              min="1"
              max="10000"
              step="1"
              className="select select-bordered w-full bg-white"
              value={consumption}
              onChange={(event) => {
                setConsumption(event.target.value);
                setResult(null);
              }}
              placeholder="Enter monthly usage in kWh"
              required
            />
          </label>

          <label className="form-control gap-2">
            <span className="label-text text-xs font-semibold">Monthly fixed charge</span>
            <select
              className="select select-bordered w-full bg-white"
              value={fixedCharge}
              onChange={(event) => {
                setFixedCharge(event.target.value);
                setResult(null);
              }}
              required
            >
              <option value="">Select fixed charge</option>
              {fixedChargeOptions.map((value) => (
                <option key={value} value={value}>
                  {value === 0 ? "₹0 / month" : `${currency.format(value)} / month`}
                </option>
              ))}
            </select>
          </label>
        </div>
        <section className="mt-5 rounded-xl border border-[#E5EBF0] bg-[#FAFCFB] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-[#172B3A]">Monthly electricity rate slabs</h4>
              <p className="mt-1 text-[10px] text-[#718096]">Example starting rates—edit them to match your electricity bill and enter each cumulative kWh limit.</p>
            </div>
            <button
              type="button"
              className="btn btn-xs border-[#BBDCCB] bg-white text-[#087D59] hover:bg-[#EAF6F0]"
              disabled={tariffSlabs.length >= 10}
              onClick={() => {
                setTariffSlabs((current) => {
                  const lastLimit = Number(current[current.length - 2]?.up_to_kwh || 0);
                  const nextLimit = lastLimit + 100;
                  return [
                    ...current.slice(0, -1),
                    { up_to_kwh: String(nextLimit), rate_per_kwh: "" },
                    current[current.length - 1],
                  ];
                });
                setResult(null);
              }}
            >
              Add rate range
            </button>
          </div>
          <div className="space-y-2">
            {tariffSlabs.map((slab, index) => {
              const isLast = index === tariffSlabs.length - 1;
              const lowerLimit = index === 0 ? 0 : Number(tariffSlabs[index - 1].up_to_kwh || 0);
              return (
                <div key={`tariff-slab-${index}`} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <label className="form-control gap-1">
                    <span className="label-text text-[10px] font-semibold">
                      {isLast ? `Above ${number.format(lowerLimit)} kWh` : `Range ${number.format(lowerLimit + 1)}–`}
                    </span>
                    {isLast ? (
                      <div className="input input-bordered flex w-full items-center bg-white text-xs text-[#52657B]">
                        All remaining monthly kWh
                      </div>
                    ) : (
                      <input
                        type="number"
                        min={lowerLimit + 1}
                        step="1"
                        className="input input-bordered w-full bg-white"
                        value={slab.up_to_kwh}
                        onChange={(event) => {
                          const value = event.target.value;
                          setTariffSlabs((current) => current.map((item, itemIndex) => (
                            itemIndex === index ? { ...item, up_to_kwh: value } : item
                          )));
                          setResult(null);
                        }}
                        placeholder="Upper limit (kWh)"
                        required
                      />
                    )}
                  </label>
                  <label className="form-control gap-1">
                    <span className="label-text text-[10px] font-semibold">Rate (₹ / kWh)</span>
                    <input
                      type="number"
                      min="0.01"
                      max="1000"
                      step="0.01"
                      className="input input-bordered w-full bg-white"
                      value={slab.rate_per_kwh}
                      onChange={(event) => {
                        const value = event.target.value;
                        setTariffSlabs((current) => current.map((item, itemIndex) => (
                          itemIndex === index ? { ...item, rate_per_kwh: value } : item
                        )));
                        setResult(null);
                      }}
                      placeholder="Rate per kWh"
                      required
                    />
                  </label>
                  {!isLast && index > 0 ? (
                    <button
                      type="button"
                      className="btn btn-sm border-[#E5EBF0] bg-white text-[#718096]"
                      onClick={() => {
                        setTariffSlabs((current) => current.filter((_, itemIndex) => itemIndex !== index));
                        setResult(null);
                      }}
                      aria-label={`Remove rate range ${index + 1}`}
                    >
                      Remove
                    </button>
                  ) : <span className="hidden sm:block" />}
                </div>
              );
            })}
          </div>
        </section>
        <p className="mt-3 text-[10px] leading-4 text-[#718096]">
          Choose the fixed monthly charge shown on your electricity bill. Fixed charges remain payable; other taxes and demand charges are not included.
        </p>

        <div className="mt-5">
          <button
            type="submit"
            disabled={submitting || loadingLocations || Boolean(locationError) || !cities.length}
            className="btn w-full border-0 bg-[#079B6A] text-white hover:bg-[#087D59] disabled:bg-gray-300 sm:w-auto"
          >
            {submitting ? "Estimating your solar potential..." : "Predict my solar potential"}
            {!submitting && <ArrowUpRight size={16} />}
          </button>
        </div>
      </form>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <CircleAlert size={17} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {result && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <div className="rounded-2xl border border-[#CFE8D9] bg-gradient-to-br from-white to-[#F0FAF4] p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#07885D]"><Zap size={17} /><span className="text-[10px] font-semibold uppercase tracking-wide">Recommended capacity</span></div>
              <p className="mt-3 text-3xl font-bold text-[#172B3A]">{result.recommended_capacity_kw} kW</p>
              <p className="mt-1 text-[10px] leading-4 text-[#718096]">{result.recommendation_note}</p>
            </div>
            <div className="rounded-2xl border border-[#E5EBF0] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#D1A11E]"><Sun size={17} /><span className="text-[10px] font-semibold uppercase tracking-wide">Annual production</span></div>
              <p className="mt-3 text-2xl font-bold text-[#172B3A]">{number.format(result.annual_generation_kwh)} <span className="text-sm font-semibold">kWh</span></p>
              <p className="mt-1 text-[10px] text-[#718096]">Model estimate for the first year</p>
            </div>
            <div className="rounded-2xl border border-[#E5EBF0] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#7063BC]"><IndianRupee size={17} /><span className="text-[10px] font-semibold uppercase tracking-wide">Estimated annual savings</span></div>
              <p className="mt-3 text-2xl font-bold text-[#172B3A]">{currency.format(result.estimated_annual_savings_inr)}</p>
              <p className="mt-1 text-[10px] text-[#718096]">Includes monthly offsets and year-end settlement</p>
            </div>
            <div className="rounded-2xl border border-[#E5EBF0] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#07885D]"><IndianRupee size={17} /><span className="text-[10px] font-semibold uppercase tracking-wide">Annual electricity bill</span></div>
              <p className="mt-3 text-sm font-semibold text-[#718096]">Before solar: {currency.format(result.annual_bill_before_solar_inr)}</p>
              <p className="mt-1 text-xl font-bold text-[#172B3A]">After solar: {currency.format(result.annual_bill_after_solar_inr)}</p>
              <p className="mt-1 text-[10px] text-[#718096]">Fixed charges remain payable</p>
            </div>
            <div className="rounded-2xl border border-[#CFE8D9] bg-gradient-to-br from-white to-[#F0FAF4] p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#07885D]"><IndianRupee size={17} /><span className="text-[10px] font-semibold uppercase tracking-wide">Year-end credit settlement</span></div>
              <p className="mt-3 text-xl font-bold text-[#172B3A]">{currency.format(result.credit_settlement_inr)}</p>
              <p className="mt-1 text-[10px] leading-4 text-[#718096]">
                {number.format(result.settled_credit_kwh)} kWh × ₹{result.credit_settlement_rate_inr_per_kwh}/kWh
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5EBF0] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#07885D]"><Building2 size={17} /><span className="text-[10px] font-semibold uppercase tracking-wide">Prediction location</span></div>
              <p className="mt-3 text-base font-bold text-[#172B3A]">{result.prediction_city.city}</p>
              <p className="mt-1 text-[10px] text-[#718096]">
                {result.prediction_city.state}
                {result.prediction_city.basis === "nearest_city"
                  ? ` · nearest dataset city, ${result.prediction_city.distance_km} km away`
                  : " · exact dataset city"}
              </p>
            </div>
          </section>

          {result.prediction_city.basis === "nearest_city" && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              <ArrowDownRight size={15} className="mt-0.5 shrink-0" />
              The selected city has no PVGIS training records. This estimate uses the nearest city with solar data ({result.prediction_city.distance_km} km away).
            </div>
          )}

          <section className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Monthly solar production vs. usage" subtitle={`Predicted output for the recommended ${result.recommended_capacity_kw} kW system`}>
              <Bar data={monthlyGenerationData} options={chartOptions} />
            </ChartCard>
            <ChartCard title="Monthly bill before and after solar" subtitle="April–March financial year; progressive slabs and fixed charges included">
              <Bar
                data={monthlySavingsData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: { label: (context) => ` ${currency.format(context.parsed.y)}` },
                    },
                  },
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      ticks: {
                        ...chartOptions.scales.y.ticks,
                        callback: (value) => currency.format(value),
                      },
                    },
                  },
                }}
              />
            </ChartCard>
            <ChartCard title="Monthly bill savings" subtitle="Monthly savings plus solar-credit settlement at financial-year end">
              <Bar
                data={{
                  labels: result.monthly_estimates.map((item) => item.month.slice(0, 3)),
                  datasets: [{
                    label: "Estimated savings",
                    data: result.monthly_estimates.map(
                      (item) => item.estimated_savings_inr + item.credit_settlement_inr,
                    ),
                    backgroundColor: "rgba(96, 103, 191, 0.78)",
                    borderRadius: 5,
                    maxBarThickness: 25,
                  }],
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: { label: (context) => ` ${currency.format(context.parsed.y)}` },
                    },
                  },
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      ticks: {
                        ...chartOptions.scales.y.ticks,
                        callback: (value) => currency.format(value),
                      },
                    },
                  },
                }}
              />
            </ChartCard>
            <ChartCard title="Annual production by system size" subtitle="The recommended capacity is highlighted in green">
              <Bar data={capacityData} options={chartOptions} />
            </ChartCard>
            <ChartCard title="25-year production projection" subtitle="Illustrative output with 0.5% annual panel degradation">
              <Line data={projectionGenerationData} options={yearlyProjectionOptions} />
            </ChartCard>
            <div className="xl:col-span-2">
              <ChartCard title="Cumulative estimated savings" subtitle="Illustrative 25-year savings; tariff is held constant and panel degradation is applied">
                <Line
                  data={projectionSavingsData}
                  options={{
                    ...yearlyProjectionOptions,
                    plugins: {
                      ...yearlyProjectionOptions.plugins,
                      tooltip: {
                        ...chartOptions.plugins.tooltip,
                        callbacks: { label: (context) => ` ${currency.format(context.parsed.y)}` },
                      },
                    },
                    scales: {
                      ...yearlyProjectionOptions.scales,
                      y: {
                        ...yearlyProjectionOptions.scales.y,
                        ticks: {
                          ...yearlyProjectionOptions.scales.y.ticks,
                          callback: (value) => currency.format(value),
                        },
                      },
                    },
                  }}
                />
              </ChartCard>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#E5EBF0] bg-white shadow-sm">
            <div className="p-4 sm:p-5">
              <h3 className="text-sm font-bold text-[#172B3A]">Monthly bill and carried solar credit</h3>
              <p className="mt-1 text-[10px] leading-4 text-[#718096]">
                Financial year runs April to March. Unused kWh at year-end is settled at ₹{result.credit_settlement_rate_inr_per_kwh}/kWh and resets to zero.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm min-w-[900px]">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Solar (kWh)</th>
                    <th>Usage (kWh)</th>
                    <th>Credit balance (kWh)</th>
                    <th>Settled kWh</th>
                    <th>Settlement</th>
                    <th>Bill before</th>
                    <th>Bill after</th>
                  </tr>
                </thead>
                <tbody>
                  {result.monthly_estimates.map((item) => (
                    <tr key={item.month}>
                      <th>{item.month}</th>
                      <td>{number.format(item.generation_kwh)}</td>
                      <td>{number.format(item.consumption_kwh)}</td>
                      <td>{number.format(item.credit_balance_kwh)}</td>
                      <td>{number.format(item.settled_credit_kwh)}</td>
                      <td>{currency.format(item.credit_settlement_inr)}</td>
                      <td>{currency.format(item.bill_before_solar_inr)}</td>
                      <td>{currency.format(item.bill_after_solar_inr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5EBF0] bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-sm font-bold text-[#172B3A]">How to read this estimate</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#F5FAF7] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#07885D]">1 · Production</p>
                <p className="mt-1.5 text-xs leading-5 text-[#52657B]">The trained model predicts each month’s kWh from location, month, and system capacity.</p>
              </div>
              <div className="rounded-xl bg-[#F8F7FC] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#7063BC]">2 · Capacity</p>
                <p className="mt-1.5 text-xs leading-5 text-[#52657B]">Available system sizes are compared with annual electricity use; the smallest size covering annual use is recommended where possible.</p>
              </div>
              <div className="rounded-xl bg-[#FFFAEF] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#AA811B]">3 · Savings</p>
                <p className="mt-1.5 text-xs leading-5 text-[#52657B]">Surplus kWh carries forward within April–March, then unused kWh settle at ₹{result.credit_settlement_rate_inr_per_kwh}/kWh and the balance resets. Fixed monthly charges remain payable.</p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 border-t border-[#E9EEF1] pt-3 text-[10px] leading-5 text-[#718096]">
              <CircleAlert size={14} className="mt-0.5 shrink-0 text-[#B18823]" />
              <p>
                Estimates approximate PVGIS-derived data and are not a bill guarantee or engineering design. Rates are calculated progressively from the ranges entered; the fixed charge is your selected estimate. Export compensation beyond the ₹{result.credit_settlement_rate_inr_per_kwh}/kWh year-end settlement, taxes, demand charges, and tariff changes are not included. City-held-out model validation: MAE {Number(result.model_metrics.mae_kwh_per_month).toFixed(1)} kWh/month, RMSE {Number(result.model_metrics.rmse_kwh_per_month).toFixed(1)} kWh/month. Multi-year results are projections, not future-weather predictions.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default CalculatorPage;
