import { ChartNoAxesCombined } from "lucide-react";

function GenericPage({ title }) {
  return (
    <div className="rounded-xl border border-[#E5EBF0] bg-white p-7">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E4F5EB] text-[#07885D]">
        <ChartNoAxesCombined size={25} />
      </span>
      <h2 className="mt-4 text-2xl font-bold text-[#172B3A]">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#718096]">
        This page is ready for the next implementation step. We will connect the relevant data and backend functionality without changing the dashboard design.
      </p>
    </div>
  );
}

export default GenericPage;
