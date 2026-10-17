import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CircleDollarSign,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { brands as brandDirectory, companyComparisonData } from "../../data/solarData";

const cardAccents = [
  "from-[#0B9A6A] to-[#52C28C]",
  "from-[#DF9D22] to-[#F2C45B]",
  "from-[#3878B8] to-[#72B7D9]",
  "from-[#7961B5] to-[#AA91D2]",
];

function CompanyComparisonPage() {
  const [type, setType] = useState("Residential");

  const rows = useMemo(() => companyComparisonData[type], [type]);
  const featured = rows[0];
  const topOutput = rows[2]?.output || rows[0].output;
  const brandColors = Object.fromEntries(brandDirectory.map((brand) => [brand.name, brand.color]));

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B3C31] via-[#087654] to-[#0B9A6A] p-6 text-white shadow-sm sm:p-8">
        <div className="absolute -right-12 -top-16 h-60 w-60 rounded-full border-[28px] border-white/[0.07]" />
        <div className="absolute -bottom-24 right-28 h-52 w-52 rounded-full border-[20px] border-white/[0.05]" />
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BDEBD2]">
              Solar company comparison
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Find a brand that fits your project</h2>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Compare leading solar brands by cost, efficiency, output, and warranty for your installation.
            </p>
          </div>
          <div className="inline-flex w-fit rounded-xl border border-white/20 bg-black/10 p-1.5 backdrop-blur-sm">
            {["Residential", "Commercial"].map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={type === item}
                onClick={() => setType(item)}
                className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
                  type === item
                    ? "bg-white text-[#08764F] shadow-sm"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="relative z-10 mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-medium text-white/90">
          <Sparkles size={13} /> Showing recommendations for {type.toLowerCase()} solar
        </div>
      </section>

      <section aria-label={`${type} comparison highlights`} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#E5EBF0] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#07885D]">
            <CircleDollarSign size={18} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Featured price range</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#172B3A]">{featured.price}</p>
          <p className="mt-1 text-[10px] text-[#718096]">{featured.name} indicative cost per watt</p>
        </div>
        <div className="rounded-2xl border border-[#E5EBF0] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#07885D]">
            <Zap size={18} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">High-output option</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#172B3A]">{topOutput}</p>
          <p className="mt-1 text-[10px] text-[#718096]">Module output range in this comparison</p>
        </div>
        <div className="rounded-2xl border border-[#E5EBF0] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#07885D]">
            <Building2 size={18} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Featured use case</span>
          </div>
          <p className="mt-3 text-sm font-bold leading-5 text-[#172B3A]">{featured.bestFor}</p>
          <p className="mt-1 text-[10px] text-[#718096]">Starting point for {type.toLowerCase()} projects</p>
        </div>
        <div className="rounded-2xl border border-[#E5EBF0] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#07885D]">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Warranty reference</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#172B3A]">25 years</p>
          <p className="mt-1 text-[10px] text-[#718096]">Listed warranty benchmark</p>
        </div>
      </section>

      <section aria-label={`${type} solar company cards`} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((brand, index) => (
          <article
            key={brand.name}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5EBF0] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#B9DDC9] hover:shadow-md"
          >
            <div className={`h-1.5 bg-gradient-to-r ${cardAccents[index % cardAccents.length]}`} />
            <div className="flex flex-1 flex-col p-4">
              <div className="flex min-h-10 items-start justify-between gap-2">
                <h3
                  className="pt-1 text-base font-extrabold tracking-tight"
                  style={{ color: brandColors[brand.name] || "#172B3A" }}
                >
                  {brand.name}
                </h3>
                <span className="rounded-full bg-[#EAF6F0] px-2.5 py-1 text-[10px] font-bold text-[#07885D]">
                  {brand.efficiency} efficient
                </span>
              </div>
              <p className="mt-2 min-h-10 text-xs leading-5 text-[#52657B]">{brand.feature}</p>

              <div className="mt-4 space-y-2.5 rounded-xl bg-[#F7FAF8] p-3 text-[11px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718096]">Module output</span>
                  <strong className="text-[#172B3A]">{brand.output}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718096]">Daily yield</span>
                  <strong className="text-[#172B3A]">{brand.annualYield}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718096]">Typical cost</span>
                  <strong className="text-[#08764F]">{brand.price}</strong>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#E7EEF2] p-3">
                <Building2 size={14} className="mt-0.5 shrink-0 text-[#07885D]" />
                <p className="text-[10px] leading-4 text-[#52657B]">{brand.bestFor}</p>
              </div>

              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 pt-4 text-xs font-bold text-[#07885D] transition hover:text-[#075D42]"
              >
                Visit company website <ArrowUpRight size={13} />
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E5EBF0] bg-white shadow-sm">
        <div className="border-b border-[#E8EEF1] px-4 py-4 sm:px-5">
          <h3 className="text-sm font-bold text-[#172B3A]">Detailed specifications</h3>
          <p className="mt-1 text-xs text-[#718096]">Compare price, performance, and warranty side by side.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Company</th>
                <th>Efficiency</th>
                <th>Output</th>
                <th>Annual yield</th>
                <th>Typical cost</th>
                <th>Warranty</th>
                <th>Best for</th>
                <th>Website</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((brand) => (
                <tr key={brand.name}>
                  <td className="font-semibold text-[#172B3A]">{brand.name}</td>
                  <td className="font-medium text-[#08764F]">{brand.efficiency}</td>
                  <td>{brand.output}</td>
                  <td>{brand.annualYield}</td>
                  <td>{brand.price}</td>
                  <td>{brand.warranty}</td>
                  <td className="min-w-48">{brand.bestFor}</td>
                  <td>
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#07885D]"
                    >
                      Visit <ArrowUpRight size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-[#E8EEF1] px-4 py-3 text-[10px] leading-5 text-[#718096] sm:px-5">
          Prices and performance figures are indicative; verify current module specifications and quotations with the manufacturer or installer.
        </p>
      </section>
    </div>
  );
}

export default CompanyComparisonPage;
