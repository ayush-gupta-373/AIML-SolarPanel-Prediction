
import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./components/layout/Sidebar";
import DashboardPage from "./components/pages/DashboardPage";
import CalculatorPage from "./components/pages/CalculatorPage";
import CompanyComparisonPage from "./components/pages/CompanyComparisonPage";
import TypeComparisonPage from "./components/pages/TypeComparisonPage";
import FaultPage from "./components/pages/FaultPage";
import SchemesPage from "./components/pages/SchemesPage";
import LoginPage from "./components/pages/LoginPage";
import SignupPage from "./components/pages/SignupPage";
import GenericPage from "./components/pages/GenericPage";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  function renderPage() {
    switch (activePage) {
      case "Dashboard":
        return <DashboardPage setActivePage={setActivePage} />;
      case "Solar Calculator":
        return <CalculatorPage />;
      case "Company Comparison":
        return <CompanyComparisonPage />;
      case "Panel Type Comparison":
        return <TypeComparisonPage />;
      case "Fault Detection":
        return <FaultPage />;
      case "Government Schemes":
        return <SchemesPage />;
      case "Login":
        return <LoginPage />;
      case "Signup":
        return <SignupPage />;
      case "Profile":
        return <GenericPage title="Profile" />;
      default:
        return <GenericPage title={activePage} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F6FA] text-[#172B3A] lg:flex">
      <Sidebar activePage={activePage} setActivePage={setActivePage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-5 xl:p-6">
        <div className="mx-auto max-w-[1700px]">
          <div className="mb-3 flex items-center justify-between lg:hidden">
            <button onClick={() => setMobileOpen(true)} className="btn btn-ghost btn-sm gap-2">
              <Menu size={19} /> Menu
            </button>
            <span className="text-sm font-bold text-[#0B5540]">SolarAI</span>
          </div>

          {renderPage()}

          <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E3EAF0] py-4 text-[10px] text-[#83919C]">
            <span>© 2026 SolarAI · Smart Solar Solutions</span>
            <span>Dashboard preview · Data integration pending</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
