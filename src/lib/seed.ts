import type { ProductType } from "@/types";

const U = (id: string, name: string, role: string, color: string) => ({
  id,
  name,
  role,
  initials: name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2),
  color,
});
export const users = {
  maria: U("maria", "Maria Santos", "NTG Manager", "#7C3AED"),
  rodney: U("rodney", "Rodney Rodriguez", "Territory Lead", "#0EA5E9"),
  karen: U("karen", "Karen Li", "Business Analyst", "#F59E0B"),
  arjay: U("arjay", "Arjay Reyes", "Data Steward", "#10B981"),
  liza: U("liza", "Liza Ramirez", "NTG Analyst", "#EF4444"),
  michael: U("michael", "Michael Tan", "Network Engineer", "#6366F1"),
  john: U("john", "John Dela Cruz", "KPI Owner", "#EC4899"),
};
const teams = {
  cwn: "CWN Analytics Team",
  terr: "Territory Analytics Team",
  ntg: "NTG Insights Team",
  nps: "Customer Experience Team",
  dp: "Data Products Team",
};

// Minimal product shape for IntelliBot seed data (dev only)
type SeedProduct = {
  data_product_id: string;
  name: string;
  description: string;
  domain_name: string;
  tags: string[];
  productType: ProductType;
  icon: string;
  accent: string;
  product_url: string;
  certification_status: string;
};

export const products: SeedProduct[] = [
  { data_product_id: "ookla-dash", productType: "dashboard", name: "Ookla Consistency Score Dashboard", domain_name: "Network Quality", icon: "gauge", accent: "#7C3AED", description: "Measures consistency of wireless network experience based on Ookla speed test results across time and locations.", tags: ["Ookla", "Consistency", "CWN", "Quality"], product_url: "https://eagle-eye.nai.example/d/ookla-dash", certification_status: "Validated" },
  { data_product_id: "territory-perf", productType: "dashboard", name: "Territory Performance Overview", domain_name: "Territory Operations", icon: "map-pin", accent: "#4F46E5", description: "Track territory performance, KPIs and operational excellence across regions and cell sites.", tags: ["Territory", "Performance", "Operations"], product_url: "https://eagle-eye.nai.example/d/territory-perf", certification_status: "Validated" },
  { data_product_id: "ntg-mancom", productType: "dashboard", name: "NTG Mancom Dashboard", domain_name: "Executive", icon: "layout-grid", accent: "#0EA5E9", description: "Executive dashboards for the NTG Management Committee covering top-line network and experience KPIs.", tags: ["Executive", "Mancom", "NTG"], product_url: "https://eagle-eye.nai.example/d/ntg-mancom", certification_status: "Validated" },
  { data_product_id: "nps-insights", productType: "dashboard", name: "NPS Insights", domain_name: "Customer Experience", icon: "smile", accent: "#10B981", description: "Customer satisfaction and experience insights across the customer journey and key touchpoints.", tags: ["NPS", "Customer Experience", "Satisfaction"], product_url: "https://looker.nai.example/dashboards/nps-insights", certification_status: "Validated" },
  { data_product_id: "gtap", productType: "dataproduct", name: "GTAP — Geo Traffic Analytics Platform", domain_name: "Network Quality", icon: "database", accent: "#F59E0B", description: "Standardised geo-tagged traffic and experience dataset powering reporting and downstream analytics.", tags: ["Data Product", "Geo", "Traffic"], product_url: "https://analytics.nai.example/gtap", certification_status: "Validated" },
  { data_product_id: "network-quality", productType: "dashboard", name: "Network Quality Overview Dashboard", domain_name: "Network Quality", icon: "activity", accent: "#6366F1", description: "Holistic view of network quality across key performance indicators and technologies.", tags: ["Quality", "CWN", "Overview"], product_url: "https://eagle-eye.nai.example/d/network-quality", certification_status: "Validated" },
  { data_product_id: "cwn-capacity", productType: "report", name: "CWN Capacity Report", domain_name: "Capacity", icon: "bar-chart-3", accent: "#0EA5E9", description: "Periodic capacity utilisation report highlighting congestion risk across the radio network.", tags: ["Capacity", "CWN", "Report"], product_url: "https://eagle-eye.nai.example/d/cwn-capacity", certification_status: "In Review" },
  { data_product_id: "so-experience", productType: "dashboard", name: "SO Experience Dashboard", domain_name: "Customer Experience", icon: "smile", accent: "#EC4899", description: "Service order experience analytics covering activation, provisioning and early-life journeys.", tags: ["NPS", "Service Order", "New"], product_url: "https://looker.nai.example/dashboards/so-experience", certification_status: "Validated" },
];

// Minimal KPI shape for IntelliBot seed data (dev only)
type SeedKpi = {
  kpi_id: string;
  kpi_name: string;
  kpi_description: string;
  business_domain: string;
  kpi_category: string;
  accent: string;
};

export const kpis: SeedKpi[] = [
  { kpi_id: "ookla-consistency", kpi_name: "Ookla Consistency Score", kpi_description: "Percentage of tests that meet consistency thresholds for download and upload speeds.", business_domain: "Network Quality", kpi_category: "Network Performance", accent: "#7C3AED" },
  { kpi_id: "nps-score", kpi_name: "Net Promoter Score", kpi_description: "Likelihood of customers to recommend, measured via survey across the customer base.", business_domain: "Customer Experience", kpi_category: "Customer Experience", accent: "#10B981" },
  { kpi_id: "mobile-availability", kpi_name: "Mobile Network Availability", kpi_description: "Share of time the mobile network is available to serve customers across monitored sites.", business_domain: "Network Quality", kpi_category: "Network Reliability", accent: "#4F46E5" },
  { kpi_id: "dl-throughput", kpi_name: "Download Throughput", kpi_description: "Median download speed experienced by customers across the radio access network.", business_domain: "Network Quality", kpi_category: "Network Performance", accent: "#0EA5E9" },
  { kpi_id: "accessibility", kpi_name: "Accessibility Score", kpi_description: "Success rate of customers accessing the network on first attempt.", business_domain: "Network Quality", kpi_category: "Network Reliability", accent: "#F59E0B" },
  { kpi_id: "churn-risk", kpi_name: "Churn Risk Index", kpi_description: "Modelled likelihood of customer churn based on experience and network signals.", business_domain: "Customer Experience", kpi_category: "Customer Retention", accent: "#EF4444" },
];

export const currentUser = users.maria;
