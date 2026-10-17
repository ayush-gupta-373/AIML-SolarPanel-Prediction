import {
  LayoutDashboard,
  Calculator,
  PanelsTopLeft,
  ScanSearch,
  Landmark,
  ChartNoAxesCombined,
  UserRound,
  Sun,
  Zap,
  IndianRupee,
  Leaf,
  House,
  Sprout,
  Building2,
  ShieldCheck,
  Tractor,
  Factory,
  ArrowUpRight,
} from "lucide-react";

export const solarImage = "/images/solar-plant.png";

export const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Solar Calculator", icon: Calculator },
  { label: "Company Comparison", icon: PanelsTopLeft },
  { label: "Panel Type Comparison", icon: Sun },
  { label: "Fault Detection", icon: ScanSearch },
  { label: "Government Schemes", icon: Landmark },
  { label: "Solar Insights", icon: ChartNoAxesCombined },
];

export const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label: "Generation",
      data: [390, 450, 510, 590, 620, 540, 490, 520, 550, 530, 510, 490],
      backgroundColor: "#0D9A6C",
      hoverBackgroundColor: "#087A55",
      borderRadius: 4,
      maxBarThickness: 15,
    },
  ],
};

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#102D37",
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context) => `${context.parsed.y} kWh`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: "#718096", font: { size: 10 } },
    },
    y: {
      beginAtZero: true,
      max: 750,
      border: { display: false, dash: [4, 4] },
      grid: { color: "#EDF1F4" },
      ticks: { color: "#718096", stepSize: 250, font: { size: 10 } },
    },
  },
};

export const brands = [
  { name: "JinkoSolar", color: "#16864B", efficiency: "21.3%", warranty: "25 years", price: "₹45-70/W", recommendedFor: "Residential rooftops", website: "https://www.jinkosolar.com" },
  { name: "LONGi", color: "#DC3434", efficiency: "22.5%", warranty: "25 years", price: "₹50-75/W", recommendedFor: "High-output systems", website: "https://www.longi.com/en/" },
  { name: "Trina Solar", color: "#1874B9", efficiency: "21.0%", warranty: "25 years", price: "₹42-68/W", recommendedFor: "Balanced value", website: "https://www.trinasolar.com/en-glb/" },
  { name: "Canadian Solar", color: "#CE3838", efficiency: "22.4%", warranty: "25 years", price: "₹48-72/W", recommendedFor: "Commercial spaces", website: "https://www.canadiansolar.com" },
  { name: "Waaree", color: "#0C8A68", efficiency: "20.8%", warranty: "25 years", price: "₹40-65/W", recommendedFor: "Budget-conscious homes", website: "https://waaree.com" },
  { name: "Adani Solar", color: "#B27A16", efficiency: "21.7%", warranty: "25 years", price: "₹44-70/W", recommendedFor: "Large Indian projects", website: "https://www.adanisolar.com" },
];

export const companyComparisonData = {
  Residential: [
    {
      name: "JinkoSolar",
      efficiency: "21.3%",
      warranty: "25 years",
      price: "₹45-70/W",
      output: "600-750 Wp",
      annualYield: "5.8-6.8 kWh/day",
      bestFor: "Urban rooftops with compact space",
      feature: "Strong balance of efficiency and long-term output",
      website: "https://www.jinkosolar.com",
    },
    {
      name: "Waaree",
      efficiency: "20.8%",
      warranty: "25 years",
      price: "₹40-65/W",
      output: "540-680 Wp",
      annualYield: "5.4-6.4 kWh/day",
      bestFor: "Budget-friendly home solar systems",
      feature: "Excellent value for residential installations",
      website: "https://waaree.com",
    },
    {
      name: "LONGi",
      efficiency: "22.5%",
      warranty: "25 years",
      price: "₹50-75/W",
      output: "620-760 Wp",
      annualYield: "6.0-7.0 kWh/day",
      bestFor: "Small roof areas needing high output",
      feature: "High power density and top-tier efficiency",
      website: "https://www.longi.com/en/",
    },
    {
      name: "Trina Solar",
      efficiency: "21.0%",
      warranty: "25 years",
      price: "₹42-68/W",
      output: "560-700 Wp",
      annualYield: "5.7-6.7 kWh/day",
      bestFor: "Mid-size homes with consistent generation needs",
      feature: "Reliable performance with balanced cost to output",
      website: "https://www.trinasolar.com/en-glb/",
    },
  ],
  Commercial: [
    {
      name: "Canadian Solar",
      efficiency: "22.4%",
      warranty: "25 years",
      price: "₹48-72/W",
      output: "600-730 Wp",
      annualYield: "6.3-7.2 kWh/day",
      bestFor: "Warehouses, malls and commercial rooftops",
      feature: "High-output modules for large arrays and ROI-focused projects",
      website: "https://www.canadiansolar.com",
    },
    {
      name: "Adani Solar",
      efficiency: "21.7%",
      warranty: "25 years",
      price: "₹44-70/W",
      output: "540-700 Wp",
      annualYield: "5.9-6.9 kWh/day",
      bestFor: "Industrial roofs and utility-scale setups",
      feature: "Strong large-scale deployment with dependable economics",
      website: "https://www.adanisolar.com",
    },
    {
      name: "LONGi",
      efficiency: "22.5%",
      warranty: "25 years",
      price: "₹50-75/W",
      output: "620-760 Wp",
      annualYield: "6.2-7.4 kWh/day",
      bestFor: "Large commercial projects with limited space",
      feature: "Maximum generation density for premium commercial installations",
      website: "https://www.longi.com/en/",
    },
    {
      name: "JinkoSolar",
      efficiency: "21.3%",
      warranty: "25 years",
      price: "₹45-70/W",
      output: "600-750 Wp",
      annualYield: "6.0-7.1 kWh/day",
      bestFor: "Office roofs, retail parks and mixed-use buildings",
      feature: "Commercial-ready performance with excellent durability",
      website: "https://www.jinkosolar.com",
    },
  ],
};

export const panelTypes = [
  {
    type: "Monocrystalline",
    image: "/images/monocrystalline.png",
    efficiency: "18-24%",
    cost: "High",
    durability: "Very high",
    bestFor: "Premium rooftops, limited space",
    feature: "Best efficiency and sleek appearance",
  },
  {
    type: "Polycrystalline",
    image: "/images/polycrystalline.png",
    efficiency: "15-18%",
    cost: "Medium",
    durability: "High",
    bestFor: "Budget residential systems",
    feature: "Cost-effective with solid performance",
  },
  {
    type: "Thin-Film",
    image: "/images/thin-film.png",
    efficiency: "10-13%",
    cost: "Low to medium",
    durability: "Medium",
    bestFor: "Large commercial or flexible surfaces",
    feature: "Lightweight and flexible but less efficient",
  },
  {
    type: "Bifacial",
    image: "/images/bifacial.png",
    efficiency: "19-23%",
    cost: "High",
    durability: "Very high",
    bestFor: "Ground-mounted and reflective sites",
    feature: "Captures sunlight from both sides",
  },
];

export const schemes = [
  {
    name: "PM Surya Ghar: Muft Bijli Yojana",
    short: "Residential rooftop solar subsidy",
    detail: "Support for homeowners installing rooftop solar systems.",
    icon: House,
    url: "https://pmsuryaghar.gov.in/",
    linkLabel: "Apply / check eligibility",
    category: "Homeowners",
  },
  {
    name: "PM-KUSUM Scheme",
    short: "Solar for farmers",
    detail: "Boosts irrigation and off-grid solar adoption for agriculture.",
    icon: Sprout,
    url: "https://pmkusum.mnre.gov.in/",
    linkLabel: "View PM-KUSUM details",
    category: "Farmers",
  },
  {
    name: "Green Energy Open Access",
    short: "Commercial solar benefits",
    detail: "Ideal for businesses seeking lower energy costs through open access.",
    icon: Building2,
    url: "https://greenopenaccess.in/",
    linkLabel: "Open the Green OA portal",
    category: "Businesses",
  },
  {
    name: "Solar for MSMEs",
    short: "Business energy support",
    detail: "Helps small businesses adopt cleaner and cheaper power.",
    icon: Factory,
    url: "https://www.sidbi.in/en/green-finance-scheme",
    linkLabel: "Explore SIDBI green finance",
    category: "MSMEs",
  },
  {
    name: "Agrivoltaics Incentives",
    short: "Combined farm and solar",
    detail: "Promotes dual-use solar systems on agricultural land.",
    icon: Tractor,
    url: "https://pmkusum.mnre.gov.in/ComponentA.html",
    linkLabel: "View related farm-solar support",
    category: "Agriculture",
  },
  {
    name: "National Solar Mission",
    short: "Long-term solar growth",
    detail: "A national roadmap supporting clean energy and grid readiness.",
    icon: ShieldCheck,
    url: "https://mnre.gov.in/solar/",
    linkLabel: "Explore MNRE solar programs",
    category: "National program",
  },
];

export const metricTiles = [
  { title: "Calculate", subtitle: "Your Solar Needs", detail: "Find a suitable system size", icon: Calculator, page: "Solar Calculator" },
  { title: "Compare", subtitle: "Solar Companies", detail: "Compare leading brands", icon: PanelsTopLeft, page: "Company Comparison" },
  { title: "Detect Faults", subtitle: "with AI", detail: "Inspect a panel image", icon: ScanSearch, page: "Fault Detection" },
  { title: "Explore", subtitle: "Government Schemes", detail: "Explore available programs", icon: Landmark, page: "Government Schemes" },
];

export const summaryStats = [
  ["State", "Select your state"],
  ["City", "Select your city"],
  ["Monthly Consumption", "Not entered"],
  ["Recommended Capacity", "Pending input"],
];

export const typeHighlights = [
  { label: "Most efficient", value: "Monocrystalline" },
  { label: "Most budget-friendly", value: "Polycrystalline" },
  { label: "Best for large surfaces", value: "Thin-Film" },
  { label: "Best yield potential", value: "Bifacial" },
];

export {
  UserRound,
  Sun,
  Zap,
  IndianRupee,
  Leaf,
  ArrowUpRight,
};
