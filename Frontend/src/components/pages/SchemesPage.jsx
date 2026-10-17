import { useMemo, useState } from "react";
import { ArrowUpRight, Search, ShieldCheck } from "lucide-react";
import { schemes } from "../../data/solarData";

function SchemesPage() {
  const [query, setQuery] = useState("");

  const filteredSchemes = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return schemes;
    return schemes.filter((scheme) => {
      const text = `${scheme.name} ${scheme.short} ${scheme.detail} ${scheme.category}`.toLowerCase();
      return text.includes(search);
    });
  }, [query]);

  return (
    <div>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B3C31] via-[#087654] to-[#0B9A6A] p-6 text-white shadow-sm sm:p-8">
        <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full border-[24px] border-white/[0.07]" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BDEBD2]">Government support</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Find the right solar scheme</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Explore official program information for households, farmers, and businesses. Check each portal for current eligibility and application steps.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90">
            <ShieldCheck size={14} /> Official information links
          </div>
        </div>
      </section>

      <div className="mt-5 rounded-2xl border border-[#E5EBF0] bg-white p-4 shadow-sm">
        <label className="relative block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83919C]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schemes by name or benefit"
            className="w-full rounded-lg border border-[#E3EAF0] bg-[#FAFCFD] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0B9A6A]"
          />
        </label>
        <p className="mt-3 text-[11px] text-[#718096]">
          Showing <span className="font-semibold text-[#172B3A]">{filteredSchemes.length}</span> of {schemes.length} programs
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredSchemes.map(({ name, short, detail, icon: Icon, url, linkLabel, category }, index) => (
          <article
            key={name}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5EBF0] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#B9DDC9] hover:shadow-md"
          >
            <div className="h-1.5 bg-gradient-to-r from-[#0B9A6A] via-[#63C58D] to-[#E5C954]" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF6F0] text-[#07885D] transition group-hover:bg-[#07885D] group-hover:text-white">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <span className="rounded-full bg-[#F3F7F5] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#557367]">
                  {category}
                </span>
              </div>
              <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.14em] text-[#07885D]">
                Program {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 text-base font-bold leading-6 text-[#172B3A]">{name}</h3>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#07885D]">{short}</p>
              <p className="mt-2 flex-1 text-xs leading-5 text-[#718096]">{detail}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#CFE8D9] bg-[#F3FAF6] px-3 py-2 text-xs font-bold text-[#08764F] transition hover:border-[#07885D] hover:bg-[#07885D] hover:text-white"
              >
                {linkLabel} <ArrowUpRight size={14} />
              </a>
            </div>
          </article>
        ))}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-[#D8E4EA] bg-white p-6 text-center text-sm text-[#718096]">
          No schemes match your search. Try a broader keyword.
        </div>
      )}

      <p className="mt-4 text-[10px] leading-5 text-[#718096]">
        Program availability, eligibility, and benefits may vary by state and can change. Confirm current details on the linked official portal before applying.
      </p>
    </div>
  );
}

export default SchemesPage;
