import { Sun, X } from "lucide-react";
import { navItems } from "../../data/solarData";

function Sidebar({ activePage, setActivePage, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[208px] flex-col bg-[#0B202B] px-3 py-4 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-7 flex items-center gap-2.5 px-2 py-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#153D37] text-[#E4C94B]">
            <Sun size={25} />
          </span>
          <div>
            <h1 className="text-[21px] font-bold leading-6 tracking-tight">SolarAI</h1>
            <p className="mt-0.5 text-[9px] text-[#B9C9CE]">Smarter Solar. Brighter Future.</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded p-1 text-white/70 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                setActivePage(label);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] font-medium transition ${
                activePage === label
                  ? "bg-[#07865C] text-white shadow-sm"
                  : "text-[#D4E0E4] hover:bg-white/[0.07]"
              }`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

      </aside>
    </>
  );
}

export default Sidebar;
