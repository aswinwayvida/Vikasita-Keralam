import { useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Layers,
  MapPin,
  Search,
  User,
  Users,
  ShieldCheck,
  Globe,
  Maximize2,
  Minimize2,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrganisationalChartProps {
  tr: (en: string, ml: string) => string;
  lang: string;
  onEditLocation?: (type: string, item?: any) => void;
}

interface OrgNode {
  id: string;
  titleEn: string;
  titleMl: string;
  type: "state" | "region" | "district" | "mandalam";
  code: string;
  scope: string;
  districtsCount?: number;
  mandalamsCount?: number;
  boothsCount?: number;
  leaderEn: string;
  leaderMl: string;
  roleEn: string;
  roleMl: string;
  status: "Active" | "Inactive";
  districtsList?: string[];
  mandalamsList?: string[];
  children?: OrgNode[];
}

const ORG_HIERARCHY_DATA: OrgNode = {
  id: "STATE-KL",
  titleEn: "Kerala State Committee",
  titleMl: "കേരള സംസ്ഥാന കമ്മിറ്റി",
  type: "state",
  code: "LVL-1 (State)",
  scope: "Entire Kerala State (1 State Unit)",
  districtsCount: 30,
  mandalamsCount: 140,
  boothsCount: 25000,
  leaderEn: "K. Surendran / State Leadership",
  leaderMl: "കെ. സുരേന്ദ്രൻ / സംസ്ഥാന നേതൃത്വം",
  roleEn: "State President",
  roleMl: "സംസ്ഥാന പ്രസിഡന്റ്",
  status: "Active",
  children: [
    {
      id: "REG-N",
      titleEn: "Northern Region",
      titleMl: "വടക്കൻ മേഖല",
      type: "region",
      code: "REG-N",
      scope: "5 Geographic Districts (10 Org Districts, 48 Mandalams)",
      districtsCount: 10,
      mandalamsCount: 48,
      boothsCount: 8200,
      leaderEn: "P. K. Krishnadas",
      leaderMl: "പി. കെ. കൃഷ്ണദാസ്",
      roleEn: "Regional Coordinator (North)",
      roleMl: "മേഖലാ കോഓർഡിനേറ്റർ",
      status: "Active",
      districtsList: [
        "Kasaragod",
        "Kannur",
        "Wayanad",
        "Kozhikode City",
        "Kozhikode Rural",
        "Malappuram East",
        "Malappuram West",
      ],
      children: [
        {
          id: "DIST-KKD-CITY",
          titleEn: "Kozhikode City District",
          titleMl: "കോഴിക്കോട് സിറ്റി ജില്ലാ കമ്മിറ്റി",
          type: "district",
          code: "DIST-01",
          scope: "Kozhikode Urban & Metropolitan Area",
          mandalamsCount: 6,
          boothsCount: 1050,
          leaderEn: "V. K. Sajeevan",
          leaderMl: "വി. കെ. സജീവൻ",
          roleEn: "District President",
          roleMl: "ജില്ലാ പ്രസിഡന്റ്",
          status: "Active",
          mandalamsList: [
            "Kozhikode North",
            "Kozhikode South",
            "Elathur",
            "Beypore",
            "Kunnamangalam",
            "Koduvally",
          ],
        },
        {
          id: "DIST-KNR",
          titleEn: "Kannur District",
          titleMl: "കണ്ണൂർ ജില്ലാ കമ്മിറ്റി",
          type: "district",
          code: "DIST-02",
          scope: "Kannur District & Coastal Belts",
          mandalamsCount: 11,
          boothsCount: 1850,
          leaderEn: "N. Haridas",
          leaderMl: "എൻ. ഹരിദാസ്",
          roleEn: "District President",
          roleMl: "ജില്ലാ പ്രസിഡന്റ്",
          status: "Active",
          mandalamsList: [
            "Thalassery",
            "Kannur",
            "Azheekode",
            "Mattannur",
            "Payyannur",
            "Kalliasseri",
            "Irikkur",
            "Peravoor",
          ],
        },
        {
          id: "DIST-KSGD",
          titleEn: "Kasaragod District",
          titleMl: "കാസർഗോഡ് ജില്ലാ കമ്മിറ്റി",
          type: "district",
          code: "DIST-03",
          scope: "Kasaragod District Units",
          mandalamsCount: 5,
          boothsCount: 980,
          leaderEn: "Ravisha Thanthri Kuntar",
          leaderMl: "രവീശ തന്ത്രി കുന്താർ",
          roleEn: "District President",
          roleMl: "ജില്ലാ പ്രസിഡന്റ്",
          status: "Active",
          mandalamsList: [
            "Manjeshwaram",
            "Kasaragod",
            "Udma",
            "Kanhangad",
            "Trikaripur",
          ],
        },
      ],
    },
    {
      id: "REG-C",
      titleEn: "Central Region",
      titleMl: "മധ്യ മേഖല",
      type: "region",
      code: "REG-C",
      scope: "5 Geographic Districts (12 Org Districts, 53 Mandalams)",
      districtsCount: 12,
      mandalamsCount: 53,
      boothsCount: 9400,
      leaderEn: "A. N. Radhakrishnan",
      leaderMl: "എ. എൻ. രാധാകൃഷ്ണൻ",
      roleEn: "Regional Coordinator (Central)",
      roleMl: "മേഖലാ കോഓർഡിനേറ്റർ",
      status: "Active",
      districtsList: [
        "Palakkad East",
        "Palakkad West",
        "Thrissur Urban",
        "Thrissur Rural",
        "Ernakulam City",
        "Ernakulam Rural",
        "Idukki",
        "Kottayam",
      ],
      children: [
        {
          id: "DIST-EKM-CITY",
          titleEn: "Ernakulam City District",
          titleMl: "എറണാകുളം സിറ്റി ജില്ലാ കമ്മിറ്റി",
          type: "district",
          code: "DIST-04",
          scope: "Kochi Corporation & Suburbs",
          mandalamsCount: 7,
          boothsCount: 1240,
          leaderEn: "K. S. Shaiju",
          leaderMl: "കെ. എസ്. ഷൈജു",
          roleEn: "District President",
          roleMl: "ജില്ലാ പ്രസിഡന്റ്",
          status: "Active",
          mandalamsList: [
            "Ernakulam",
            "Kochi",
            "Thrippunithura",
            "Thrikkakara",
            "Kalamassery",
            "Paravur",
            "Vypin",
          ],
        },
        {
          id: "DIST-TSR",
          titleEn: "Thrissur District",
          titleMl: "തൃശ്ശൂർ ജില്ലാ കമ്മിറ്റി",
          type: "district",
          code: "DIST-05",
          scope: "Thrissur Central & Cultural Capital",
          mandalamsCount: 13,
          boothsCount: 2100,
          leaderEn: "Adv. K. K. Aneeshkumar",
          leaderMl: "അഡ്വ. കെ. കെ. അനീഷ്‌കുമാർ",
          roleEn: "District President",
          roleMl: "ജില്ലാ പ്രസിഡന്റ്",
          status: "Active",
          mandalamsList: [
            "Thrissur",
            "Guruvayur",
            "Manalur",
            "Ollur",
            "Puthukkad",
            "Chalakudy",
            "Kodungallur",
            "Irinjalakuda",
          ],
        },
        {
          id: "DIST-PKD",
          titleEn: "Palakkad District",
          titleMl: "പാലക്കാട് ജില്ലാ കമ്മിറ്റി",
          type: "district",
          code: "DIST-06",
          scope: "Palakkad East & West Divisions",
          mandalamsCount: 12,
          boothsCount: 1950,
          leaderEn: "K. M. Haridas",
          leaderMl: "കെ. എം. ഹരിദാസ്",
          roleEn: "District President",
          roleMl: "ജില്ലാ പ്രസിഡന്റ്",
          status: "Active",
          mandalamsList: [
            "Palakkad",
            "Malampuzha",
            "Alathur",
            "Chittur",
            "Nenmara",
            "Ottapalam",
            "Shornur",
            "Mannarkkad",
          ],
        },
      ],
    },
    {
      id: "REG-S",
      titleEn: "Southern Region",
      titleMl: "തെക്കൻ മേഖല",
      type: "region",
      code: "REG-S",
      scope: "4 Geographic Districts (8 Org Districts, 39 Mandalams)",
      districtsCount: 8,
      mandalamsCount: 39,
      boothsCount: 7400,
      leaderEn: "George Kurian",
      leaderMl: "ജോർജ്ജ് കുര്യൻ",
      roleEn: "Regional Coordinator (South)",
      roleMl: "മേഖലാ കോഓർഡിനേറ്റർ",
      status: "Active",
      districtsList: [
        "Thiruvananthapuram City",
        "Thiruvananthapuram Rural",
        "Kollam City",
        "Kollam Rural",
        "Pathanamthitta",
        "Alappuzha North",
        "Alappuzha South",
      ],
      children: [
        {
          id: "DIST-TVM-CITY",
          titleEn: "Thiruvananthapuram City",
          titleMl: "തിരുവനന്തപുരം സിറ്റി ജില്ലാ കമ്മിറ്റി",
          type: "district",
          code: "DIST-07",
          scope: "Capital City Metropolitan Area",
          mandalamsCount: 6,
          boothsCount: 1120,
          leaderEn: "Adv. V. V. Rajesh",
          leaderMl: "അഡ്വ. വി. വി. രാജേഷ്",
          roleEn: "District President",
          roleMl: "ജില്ലാ പ്രസിഡന്റ്",
          status: "Active",
          mandalamsList: [
            "Thiruvananthapuram",
            "Nemom",
            "Kazhakoottam",
            "Vattiyoorkavu",
            "Vattiyoorkavu Central",
            "Kovalam",
          ],
        },
        {
          id: "DIST-KLM",
          titleEn: "Kollam District",
          titleMl: "കൊല്ലം ജില്ലാ കമ്മിറ്റി",
          type: "district",
          code: "DIST-08",
          scope: "Kollam City & Rural Divisions",
          mandalamsCount: 11,
          boothsCount: 1780,
          leaderEn: "B. B. Gopakumar",
          leaderMl: "ബി. ബി. ഗോപകുമാർ",
          roleEn: "District President",
          roleMl: "ജില്ലാ പ്രസിഡന്റ്",
          status: "Active",
          mandalamsList: [
            "Kollam",
            "Chavara",
            "Karunagappally",
            "Kottarakkara",
            "Kunnathur",
            "Pathanapuram",
            "Punalur",
            "Chadayamangalam",
          ],
        },
        {
          id: "DIST-ALP",
          titleEn: "Alappuzha District",
          titleMl: "ആലപ്പുഴ ജില്ലാ കമ്മിറ്റി",
          type: "district",
          code: "DIST-09",
          scope: "Alappuzha Coastal & Inland Mandalams",
          mandalamsCount: 9,
          boothsCount: 1450,
          leaderEn: "M. V. Gopakumar",
          leaderMl: "എം. വി. ഗോപകുമാർ",
          roleEn: "District President",
          roleMl: "ജില്ലാ പ്രസിഡന്റ്",
          status: "Active",
          mandalamsList: [
            "Alappuzha",
            "Cherthala",
            "Ambalappuzha",
            "Haripad",
            "Kayamkulam",
            "Mavelikkara",
            "Chengannur",
          ],
        },
      ],
    },
  ],
};

export function OrganisationalChart({ tr, lang, onEditLocation }: OrganisationalChartProps) {
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "STATE-KL": true,
    "REG-N": true,
    "REG-C": true,
    "REG-S": true,
  });
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    setExpandedNodes({
      "STATE-KL": true,
      "REG-N": true,
      "REG-C": true,
      "REG-S": true,
      "DIST-KKD-CITY": true,
      "DIST-KNR": true,
      "DIST-KSGD": true,
      "DIST-EKM-CITY": true,
      "DIST-TSR": true,
      "DIST-PKD": true,
      "DIST-TVM-CITY": true,
      "DIST-KLM": true,
      "DIST-ALP": true,
    });
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const isMalayalam = lang === "ml";

  // Filter children of state based on region selection and search query
  const filteredRegions = ORG_HIERARCHY_DATA.children?.filter((region) => {
    if (selectedRegionFilter !== "ALL" && region.id !== selectedRegionFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const regionMatch =
      region.titleEn.toLowerCase().includes(q) ||
      region.titleMl.toLowerCase().includes(q) ||
      region.leaderEn.toLowerCase().includes(q);
    const childMatch = region.children?.some(
      (c) =>
        c.titleEn.toLowerCase().includes(q) ||
        c.titleMl.toLowerCase().includes(q) ||
        c.mandalamsList?.some((m) => m.toLowerCase().includes(q))
    );
    return regionMatch || childMatch;
  });

  return (
    <div className="space-y-5 p-4 sm:p-5 bg-background text-foreground">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
            <Globe className="h-4 w-4" />
            <span>{tr("State Unit", "സംസ്ഥാന യുണിറ്റ്")}</span>
          </div>
          <p className="text-lg font-black text-foreground">1</p>
          <p className="text-[10.5px] text-muted-foreground font-medium">Entire Kerala State</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">
            <Layers className="h-4 w-4" />
            <span>{tr("Regions", "മേഖലകൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">3</p>
          <p className="text-[10.5px] text-muted-foreground font-medium">South, Central, North</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs mb-1">
            <Building2 className="h-4 w-4" />
            <span>{tr("Org Districts", "സംഘടനാ ജില്ലകൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">30</p>
          <p className="text-[10.5px] text-muted-foreground font-medium">Sub-district units</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
            <MapPin className="h-4 w-4" />
            <span>{tr("Mandalams", "മണ്ഡലങ്ങൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">140</p>
          <p className="text-[10.5px] text-muted-foreground font-medium">Assembly Constituencies</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs mb-1">
            <Users className="h-4 w-4" />
            <span>{tr("Area Units", "ഏരിയ യൂണിറ്റുകൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">2,100+</p>
          <p className="text-[10.5px] text-muted-foreground font-medium">Local Area Clusters</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>{tr("Booths", "ബൂത്തുകൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">25,000+</p>
          <p className="text-[10.5px] text-muted-foreground font-medium">Polling Booth Units</p>
        </div>
      </div>

      {/* Control Bar: Filter, Search, Expand/Collapse */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground mr-1">
            {tr("Region Filter:", "മേഖലാ ഫിൽട്ടർ:")}
          </span>
          {[
            { id: "ALL", en: "All Regions", ml: "എല്ലാ മേഖലകളും" },
            { id: "REG-S", en: "Southern Region", ml: "തെക്കൻ മേഖല" },
            { id: "REG-C", en: "Central Region", ml: "മധ്യ മേഖല" },
            { id: "REG-N", en: "Northern Region", ml: "വടക്കൻ മേഖല" },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setSelectedRegionFilter(btn.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                selectedRegionFilter === btn.id
                  ? "bg-primary text-primary-foreground shadow-2xs font-extrabold"
                  : "bg-background text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              {isMalayalam ? btn.ml : btn.en}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={tr("Search location or leader...", "തിരയുക...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="h-8 text-xs font-semibold cursor-pointer"
            title={tr("Expand All", "എല്ലാം വികസിപ്പിക്കുക")}
          >
            <Maximize2 className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">{tr("Expand", "വികസിപ്പിക്കുക")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="h-8 text-xs font-semibold cursor-pointer"
            title={tr("Collapse All", "എല്ലാം ചുരുക്കുക")}
          >
            <Minimize2 className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">{tr("Collapse", "ചുരുക്കുക")}</span>
          </Button>
        </div>
      </div>

      {/* Main Organisational Tree Chart View */}
      <div className="rounded-2xl border border-border/80 bg-muted/10 p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[700px] space-y-6">
          
          {/* LEVEL 1: STATE ROOT NODE */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => setSelectedNode(ORG_HIERARCHY_DATA)}
              className="relative group w-full max-w-lg rounded-2xl border-2 border-primary bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4 shadow-xs transition-all hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                      {ORG_HIERARCHY_DATA.code}
                    </span>
                    <h3 className="text-base font-black text-foreground mt-0.5">
                      {isMalayalam ? ORG_HIERARCHY_DATA.titleMl : ORG_HIERARCHY_DATA.titleEn}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground">{ORG_HIERARCHY_DATA.scope}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand("STATE-KL");
                  }}
                  className="h-8 w-8 p-0 cursor-pointer"
                >
                  {expandedNodes["STATE-KL"] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* State Node Footer Details */}
              <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>
                    {isMalayalam ? ORG_HIERARCHY_DATA.roleMl : ORG_HIERARCHY_DATA.roleEn}:{" "}
                    <strong>{isMalayalam ? ORG_HIERARCHY_DATA.leaderMl : ORG_HIERARCHY_DATA.leaderEn}</strong>
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" /> {tr("Active", "സജീവം")}
                </span>
              </div>
            </div>

            {/* Tree Line Connector down to Level 2 */}
            {expandedNodes["STATE-KL"] && filteredRegions && filteredRegions.length > 0 && (
              <div className="w-0.5 h-6 bg-primary/40 my-1" />
            )}
          </div>

          {/* LEVEL 2: REGIONAL NODES */}
          {expandedNodes["STATE-KL"] && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                
                {filteredRegions?.map((region) => {
                  const isRegExpanded = Boolean(expandedNodes[region.id]);
                  return (
                    <div key={region.id} className="flex flex-col items-center">
                      <div
                        onClick={() => setSelectedNode(region)}
                        className="w-full rounded-xl border border-primary/30 bg-card p-4 shadow-2xs hover:border-primary transition-all hover:shadow-xs cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                              <Layers className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                                {region.code}
                              </span>
                              <h4 className="text-sm font-bold text-foreground">
                                {isMalayalam ? region.titleMl : region.titleEn}
                              </h4>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(region.id);
                            }}
                            className="h-7 w-7 p-0 cursor-pointer"
                          >
                            {isRegExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <p className="text-[11px] font-medium text-muted-foreground mt-2">
                          {region.scope}
                        </p>

                        <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">
                            {isMalayalam ? region.roleMl : region.roleEn}:
                          </span>
                          <span className="font-bold text-foreground">
                            {isMalayalam ? region.leaderMl : region.leaderEn}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                          <span className="bg-muted px-1.5 py-0.5 rounded">
                            {region.districtsCount} {tr("Districts", "ജില്ലകൾ")}
                          </span>
                          <span className="bg-muted px-1.5 py-0.5 rounded">
                            {region.mandalamsCount} {tr("Mandalams", "മണ്ഡലങ്ങൾ")}
                          </span>
                        </div>
                      </div>

                      {/* Tree Line Connector down to Level 3 */}
                      {isRegExpanded && region.children && region.children.length > 0 && (
                        <div className="w-0.5 h-6 bg-border my-1" />
                      )}

                      {/* LEVEL 3: DISTRICT NODES */}
                      {isRegExpanded && region.children && (
                        <div className="w-full space-y-3">
                          {region.children.map((dist) => {
                            const isDistExpanded = Boolean(expandedNodes[dist.id]);
                            return (
                              <div key={dist.id} className="w-full">
                                <div
                                  onClick={() => setSelectedNode(dist)}
                                  className="rounded-lg border border-border bg-background p-3 shadow-2xs hover:border-primary/50 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                      <div>
                                        <h5 className="text-xs font-bold text-foreground">
                                          {isMalayalam ? dist.titleMl : dist.titleEn}
                                        </h5>
                                        <p className="text-[10px] text-muted-foreground font-mono">
                                          {dist.mandalamsCount} Mandalams • {dist.boothsCount} Booths
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand(dist.id);
                                      }}
                                      className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
                                    >
                                      {isDistExpanded ? (
                                        <ChevronDown className="h-3.5 w-3.5" />
                                      ) : (
                                        <ChevronRight className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>

                                  <div className="mt-1.5 text-[10.5px] text-muted-foreground flex items-center justify-between">
                                    <span>{tr("President", "പ്രസിഡന്റ്")}:</span>
                                    <span className="font-semibold text-foreground">
                                      {isMalayalam ? dist.leaderMl : dist.leaderEn}
                                    </span>
                                  </div>

                                  {/* LEVEL 4: MANDALAMS LIST (Expandable) */}
                                  {isDistExpanded && dist.mandalamsList && (
                                    <div className="mt-2.5 pt-2 border-t border-border/60">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {tr("Mandalams (Assembly Constituencies):", "മണ്ഡലങ്ങൾ:")}
                                      </span>
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {dist.mandalamsList.map((m) => (
                                          <span
                                            key={m}
                                            className="inline-flex items-center gap-1 rounded bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-foreground border border-border/50"
                                          >
                                            <MapPin className="h-2.5 w-2.5 text-primary" />
                                            {m}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Node Details Modal */}
      {selectedNode && (
        <Dialog open={Boolean(selectedNode)} onOpenChange={() => setSelectedNode(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {selectedNode.code}
                </span>
                <DialogTitle className="text-base font-bold">
                  {isMalayalam ? selectedNode.titleMl : selectedNode.titleEn}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="rounded-lg bg-muted/40 p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tr("Scope / Area:", "പരിധി:")}</span>
                  <span className="font-semibold text-foreground">{selectedNode.scope}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tr("Status:", "സ്റ്റാറ്റസ്:")}</span>
                  <span className="font-bold text-emerald-600">{selectedNode.status}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  {tr("Assigned Leadership", "നേതൃത്വം")}
                </h4>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {isMalayalam ? selectedNode.leaderMl : selectedNode.leaderEn}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {isMalayalam ? selectedNode.roleMl : selectedNode.roleEn}
                    </p>
                  </div>
                </div>
              </div>

              {selectedNode.districtsList && selectedNode.districtsList.length > 0 && (
                <div className="space-y-1.5 border-t border-border pt-3">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                    {tr("Included Districts", "ഉൾപ്പെട്ട ജില്ലകൾ")}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.districtsList.map((d) => (
                      <span
                        key={d}
                        className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-foreground"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.mandalamsList && selectedNode.mandalamsList.length > 0 && (
                <div className="space-y-1.5 border-t border-border pt-3">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                    {tr("Assembly Mandalams", "മണ്ഡലങ്ങൾ")}
                  </h4>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {selectedNode.mandalamsList.map((m) => (
                      <span
                        key={m}
                        className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nodeType = selectedNode.type === "state" ? "org-levels" : selectedNode.type;
                    setSelectedNode(null);
                    if (onEditLocation) onEditLocation(nodeType, selectedNode);
                  }}
                  className="cursor-pointer"
                >
                  {tr("Edit Details", "തിരുത്തുക")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setSelectedNode(null)}
                  className="cursor-pointer"
                >
                  {tr("Close", "അടയ്ക്കുക")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
