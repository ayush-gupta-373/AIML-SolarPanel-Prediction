import { ArrowUpRight } from "lucide-react";

function SectionTitle({ title, subtitle, action, onAction }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[15px] font-bold text-[#172B3A]">{title}</h2>
        {subtitle && <p className="mt-1 text-[11px] leading-4 text-[#7A8995]">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#07885D] hover:text-[#055F43]"
        >
          {action} <ArrowUpRight size={13} />
        </button>
      )}
    </div>
  );
}

export default SectionTitle;
