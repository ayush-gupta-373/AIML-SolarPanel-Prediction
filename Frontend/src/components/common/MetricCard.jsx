function MetricCard({ title, value, note, icon: Icon, iconColor, iconBg }) {
  return (
    <div className="rounded-xl border border-[#E5EBF0] bg-white p-3 shadow-[0_1px_3px_rgba(15,40,55,0.035)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] leading-4 text-[#718096]">{title}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={17} className={iconColor} />
        </span>
      </div>
      <p className="mt-2 text-xl font-bold tracking-tight text-[#172B3A]">{value}</p>
      <p className="mt-1 text-[10px] leading-4 text-[#8A98A4]">{note}</p>
    </div>
  );
}

export default MetricCard;
