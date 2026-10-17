import { ArrowUpRight, Gauge, Leaf, Ruler, ShieldCheck, Sun, Wallet } from "lucide-react";
import { panelTypes, typeHighlights } from "../../data/solarData";

const highlightIcons = [Gauge, Wallet, Ruler, Sun];

function TypeComparisonPage() {
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B3C31] via-[#087654] to-[#0B9A6A] p-6 text-white shadow-sm sm:p-8">
        <div className="absolute -right-12 -top-16 h-60 w-60 rounded-full border-[28px] border-white/[0.07]" />
        <div className="absolute -bottom-24 right-28 h-52 w-52 rounded-full border-[20px] border-white/[0.05]" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BDEBD2]">Choose the right technology</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Solar Panel Type Comparison</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
            Compare efficiency, cost, durability, and ideal applications to find the panel technology that fits your site.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90">
            <Leaf size={14} /> Four technologies, one clear comparison
          </div>
        </div>
      </section>

      <section aria-label="Panel type highlights" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {typeHighlights.map((item, index) => {
          const Icon = highlightIcons[index % highlightIcons.length];
          return (
            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-[#E5EBF0] bg-white p-4 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF6F0] text-[#07885D]">
                <Icon size={19} />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#718096]">{item.label}</p>
                <p className="mt-1 truncate text-sm font-bold text-[#172B3A]">{item.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section aria-label="Solar panel types" className="grid gap-4 xl:grid-cols-2">
        {panelTypes.map((panel, index) => (
          <article
            key={panel.type}
            className="group overflow-hidden rounded-2xl border border-[#E5EBF0] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#B9DDC9] hover:shadow-md"
          >
            <div className="relative h-56 overflow-hidden bg-[#EAF2EE] sm:h-64">
              <img
                src={panel.image}
                alt={`${panel.type} solar panel`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102D37]/75 via-transparent to-black/10" />
              <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#08764F] shadow-sm">
                <span className="text-xs font-bold">{String(index + 1).padStart(2, "0")}</span>
              </span>
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#07885D]">Panel technology</p>
                  <h3 className="mt-1 text-lg font-bold text-[#172B3A]">{panel.type}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-[#EAF6F0] px-3 py-1.5 text-[10px] font-bold text-[#08764F]">
                  {panel.cost} cost
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#F4FAF6] p-3">
                  <div className="flex items-center gap-1.5 text-[#07885D]">
                    <Gauge size={14} />
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#718096]">Efficiency</p>
                  </div>
                  <p className="mt-1.5 text-base font-bold text-[#172B3A]">{panel.efficiency}</p>
                </div>
                <div className="rounded-xl bg-[#F4FAF6] p-3">
                  <div className="flex items-center gap-1.5 text-[#07885D]">
                    <ShieldCheck size={14} />
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#718096]">Durability</p>
                  </div>
                  <p className="mt-1.5 text-base font-bold text-[#172B3A]">{panel.durability}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#E7EEF2] p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#83919C]">Ideal application</p>
                  <p className="mt-1.5 text-xs font-medium leading-5 text-[#263B49]">{panel.bestFor}</p>
                </div>
                <div className="rounded-xl border border-[#E7EEF2] p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#83919C]">Key advantage</p>
                  <p className="mt-1.5 text-xs font-medium leading-5 text-[#263B49]">{panel.feature}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E5EBF0] bg-white shadow-sm">
        <div className="border-b border-[#E8EEF1] px-4 py-4 sm:px-5">
          <h3 className="text-sm font-bold text-[#172B3A]">Side-by-side specifications</h3>
          <p className="mt-1 text-xs text-[#718096]">Quickly scan the key differences between panel technologies.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Panel type</th>
                <th>Efficiency</th>
                <th>Cost level</th>
                <th>Durability</th>
                <th>Best suited for</th>
                <th>Key advantage</th>
              </tr>
            </thead>
            <tbody>
              {panelTypes.map((panel) => (
                <tr key={panel.type}>
                  <td className="font-semibold text-[#172B3A]">{panel.type}</td>
                  <td className="font-medium text-[#08764F]">{panel.efficiency}</td>
                  <td>{panel.cost}</td>
                  <td>{panel.durability}</td>
                  <td className="min-w-48">{panel.bestFor}</td>
                  <td className="min-w-48">{panel.feature}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex items-center gap-1.5 border-t border-[#E8EEF1] px-4 py-3 text-[10px] text-[#718096] sm:px-5">
          <ArrowUpRight size={12} className="text-[#07885D]" />
          Actual output and lifetime depend on panel model, installation, climate, and site conditions.
        </p>
      </section>
    </div>
  );
}

export default TypeComparisonPage;
