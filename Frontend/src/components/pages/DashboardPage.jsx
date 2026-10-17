import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  Leaf,
  Search,
  Sun,
  IndianRupee,
  Zap,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import MetricCard from "../common/MetricCard";
import SectionTitle from "../common/SectionTitle";
import { brands, chartData, chartOptions, metricTiles, schemes, solarImage, summaryStats } from "../../data/solarData";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function DashboardPage({ setActivePage }) {
  return (
    <>
      <header className="mb-3 flex min-h-[54px] items-center gap-3 rounded-xl border border-[#E7EDF2] bg-white px-3 py-2 sm:px-4">
        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF5D8] text-[#DDAF26] sm:flex">
          <Sun size={23} />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-[#172B3A] sm:text-[15px]">Welcome back!</h2>
          <p className="hidden text-[10px] text-[#718096] sm:block">
            Explore solar solutions, compare panels, and save more with clean energy.
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <label className="relative hidden lg:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83919C]" />
            <input
              placeholder="Search solar insights..."
              className="h-9 w-44 rounded-lg border border-[#E3EAF0] bg-[#FAFCFD] pl-9 pr-3 text-[11px] outline-none focus:border-[#0B9A6A] xl:w-56"
            />
          </label>
          <button aria-label="Notifications" className="relative rounded-lg p-2 text-[#536773] hover:bg-[#F1F6F4]">
            <Bell size={18} />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
          <div className="flex items-center gap-2 border-l border-[#E7EDF2] pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#087C58] text-xs font-bold text-white">
              U
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-semibold text-[#172B3A]">Solar User</p>
              <p className="text-[9px] text-[#83919C]">Home dashboard</p>
            </div>
            <ChevronDown size={13} className="hidden text-[#83919C] sm:block" />
          </div>
        </div>
      </header>

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.85fr)_repeat(4,minmax(0,0.48fr))]">
        <div
          className="relative flex min-h-[165px] overflow-hidden rounded-xl bg-cover bg-center sm:col-span-2 xl:col-span-1"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(5,31,39,.93) 0%, rgba(5,31,39,.70) 45%, rgba(5,31,39,.08) 100%), url("${solarImage}")`,
          }}
        >
          <div className="relative z-10 flex max-w-[390px] flex-col items-start justify-center p-5 sm:p-6">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#A8E4C7]">
              Smart solar solutions
            </p>
            <h2 className="max-w-xs text-[23px] font-bold leading-[1.15] text-white">
              Power Your Home With Clean Energy
            </h2>
            <p className="mt-2 max-w-[270px] text-[10px] leading-4 text-white/85">
              Discover a suitable solar solution with data-driven insights.
            </p>
            <button
              onClick={() => setActivePage("Solar Calculator")}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#079B6A] px-3.5 py-2 text-[10px] font-bold text-white transition hover:bg-[#087D59]"
            >
              Start Solar Calculator <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {metricTiles.map(({ title, subtitle, detail, icon: Icon, page }) => (
          <button
            key={title}
            onClick={() => setActivePage(page)}
            className="group flex min-h-[110px] flex-col items-start rounded-xl border border-[#E3EDF0] bg-[#F0F8FA] p-3 text-left transition hover:border-[#B6DDCB] hover:bg-[#E7F5ED] sm:min-h-[130px] xl:min-h-0"
          >
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#08764F] shadow-sm">
              <Icon size={20} />
            </span>
            <p className="text-[11px] font-bold leading-4 text-[#172B3A]">{title}</p>
            <p className="text-[11px] font-bold leading-4 text-[#172B3A]">{subtitle}</p>
            <p className="mt-2 text-[9px] leading-4 text-[#718096]">{detail}</p>
          </button>
        ))}
      </section>

      <section className="mb-4 grid items-stretch gap-3 xl:grid-cols-[1.18fr_1.2fr_0.65fr]">
        <div className="rounded-xl border border-[#E5EBF0] bg-white p-3 sm:p-4">
          <SectionTitle title="Your Solar Potential" subtitle="Illustrative values for the dashboard preview" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <MetricCard
              title="Recommended Capacity"
              value="5 kW"
              note="Example system size"
              icon={Zap}
              iconColor="text-[#07885D]"
              iconBg="bg-[#E4F5EB]"
            />
            <MetricCard
              title="Monthly Generation"
              value="650 kWh"
              note="Illustrative estimate"
              icon={Sun}
              iconColor="text-[#D6A01C]"
              iconBg="bg-[#FFF4D9]"
            />
            <MetricCard
              title="Estimated Monthly Savings"
              value="₹4,550"
              note="Example calculation only"
              icon={IndianRupee}
              iconColor="text-[#7164C2]"
              iconBg="bg-[#EFECFF]"
            />
            <MetricCard
              title="CO₂ Reduction"
              value="Estimate"
              note="Requires verified assumptions"
              icon={Leaf}
              iconColor="text-[#17845D]"
              iconBg="bg-[#E2F5EA]"
            />
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-[#E5EBF0] bg-white p-3 sm:p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[13px] font-bold text-[#172B3A]">Monthly Solar Generation</h2>
              <p className="mt-1 text-[10px] text-[#718096]">Example 5 kW system</p>
            </div>
            <select
              aria-label="Solar capacity"
              className="select select-bordered select-xs w-[75px] rounded-md border-[#E4EBF0] bg-white text-[10px]"
              defaultValue="5 kW"
            >
              <option>1 kW</option>
              <option>2 kW</option>
              <option>3 kW</option>
              <option>5 kW</option>
              <option>10 kW</option>
            </select>
          </div>
          <div className="h-[205px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <p className="mt-2 text-[9px] text-[#8A98A4]">Sample chart only; PVGIS integration comes next.</p>
        </div>

        <div className="rounded-xl border border-[#E5EBF0] bg-white p-3 sm:p-4">
          <SectionTitle title="Quick Summary" />
          <div className="space-y-4">
            {summaryStats.map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] text-[#83919C]">{label}</p>
                <p className="mt-1 text-[11px] font-semibold text-[#263B49]">{value}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActivePage("Solar Calculator")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#079B6A] px-3 py-2.5 text-[10px] font-bold text-white hover:bg-[#087D59]"
          >
            Open Solar Calculator <ArrowUpRight size={13} />
          </button>
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.25fr_1fr]">
        <div className="rounded-xl border border-[#E5EBF0] bg-white p-3 sm:p-4">
          <SectionTitle
            title="Top Solar Panel Companies"
            subtitle="Compare panel specifications and warranty information"
            action="View all"
            onAction={() => setActivePage("Company Comparison")}
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {brands.slice(0, 4).map((brand) => (
              <div key={brand.name} className="rounded-lg border border-[#E8EDF1] p-3 transition hover:border-[#B9DCCB]">
                <div className="flex min-h-9 items-center text-[12px] font-extrabold tracking-tight" style={{ color: brand.color }}>
                  {brand.name}
                </div>
                <p className="mt-2 text-[9px] text-[#718096]">Efficiency</p>
                <p className="text-[11px] font-semibold text-[#263B49]">{brand.efficiency}</p>
                <p className="mt-2 text-[9px] text-[#718096]">Warranty</p>
                <p className="text-[11px] font-semibold text-[#263B49]">{brand.warranty}</p>
                <button
                  onClick={() => setActivePage("Company Comparison")}
                  className="mt-3 w-full rounded-md bg-[#EAF7EF] px-2 py-2 text-[10px] font-bold text-[#087B54] hover:bg-[#D7F0E1]"
                >
                  Compare <ArrowUpRight size={11} className="inline" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[9px] text-[#8A98A4]">
            Illustrative brand entries. Verify current specifications, prices and warranties before using them for decisions.
          </p>
        </div>

        <div className="rounded-xl border border-[#E5EBF0] bg-white p-3 sm:p-4">
          <SectionTitle
            title="Latest Government Schemes"
            subtitle="Explore solar support programs"
            action="View all"
            onAction={() => setActivePage("Government Schemes")}
          />
          <div className="space-y-2">
            {schemes.slice(0, 4).map(({ name, short, icon: Icon }, index) => (
              <div key={name} className="flex items-center gap-3 rounded-lg border border-[#E9EEF1] p-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    index === 0 ? "bg-[#FFF5D9] text-[#C18D19]" : index === 1 ? "bg-[#E4F3EC] text-[#087B54]" : "bg-[#E5F4E9] text-[#318454]"
                  }`}
                >
                  <Icon size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold leading-4 text-[#263B49]">{name}</p>
                  <p className="mt-1 text-[9px] leading-4 text-[#83919C]">{short}</p>
                </div>
                <button
                  onClick={() => setActivePage("Government Schemes")}
                  className="shrink-0 rounded-md border border-[#D5EDE0] px-2 py-1.5 text-[9px] font-semibold text-[#087B54] hover:bg-[#EAF7EF]"
                >
                  Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default DashboardPage;
