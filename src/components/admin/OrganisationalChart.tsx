import { useState, useMemo } from "react";
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
  CheckCircle2,
  Filter,
  UserCheck,
  UserX,
  Flag,
  Home,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface OrganisationalChartProps {
  tr: (en: string, ml: string) => string;
  lang: string;
  onEditLocation?: (type: string, item?: any) => void;
}

export interface OrgUserCard {
  id: string;
  nameEn: string;
  nameMl: string;
  designationEn: string;
  designationMl: string;
  orgLevel: "State" | "Region" | "Organisational District" | "Mandalam" | "Area" | "Booth";
  locationEn: string;
  locationMl: string;
  avatarUrl: string;
  status: "Active" | "Vacant" | "Inactive";
  mobile?: string;
}

export interface OrgHierarchyNode {
  id: string;
  nameEn: string;
  nameMl: string;
  level: "State" | "Region" | "Organisational District" | "Mandalam" | "Area" | "Booth";
  code: string;
  officeBearers: OrgUserCard[];
  vacantDesignations?: { designationEn: string; designationMl: string }[];
  children?: OrgHierarchyNode[];
}

const SAMPLE_ORG_HIERARCHY: OrgHierarchyNode = {
  id: "STATE-KL",
  nameEn: "Kerala State Committee",
  nameMl: "കേരള സംസ്ഥാന കമ്മിറ്റി",
  level: "State",
  code: "STATE-01",
  officeBearers: [
    {
      id: "USR-ORG-001",
      nameEn: "Arun Dev",
      nameMl: "അരുൺ ദേവ്",
      designationEn: "President",
      designationMl: "സംസ്ഥാന പ്രസിഡന്റ്",
      orgLevel: "State",
      locationEn: "Kerala",
      locationMl: "കേരളം",
      avatarUrl: "/images/avatar-male.jpg",
      status: "Active",
    },
    {
      id: "USR-ORG-002",
      nameEn: "Meera Nair",
      nameMl: "മീര നായർ",
      designationEn: "Vice President",
      designationMl: "വൈസ് പ്രസിഡന്റ്",
      orgLevel: "State",
      locationEn: "Kerala",
      locationMl: "കേരളം",
      avatarUrl: "/images/avatar-female.jpg",
      status: "Active",
    },
    {
      id: "USR-ORG-003",
      nameEn: "Anil Kumar",
      nameMl: "അനിൽ കുമാർ",
      designationEn: "General Secretary",
      designationMl: "ജനറൽ സെക്രട്ടറി",
      orgLevel: "State",
      locationEn: "Kerala",
      locationMl: "കേരളം",
      avatarUrl: "/images/avatar-male.jpg",
      status: "Active",
    },
    {
      id: "USR-ORG-004",
      nameEn: "Kavitha Menon",
      nameMl: "കവിത മേനോൻ",
      designationEn: "Secretary",
      designationMl: "സെക്രട്ടറി",
      orgLevel: "State",
      locationEn: "Kerala",
      locationMl: "കേരളം",
      avatarUrl: "/images/avatar-female.jpg",
      status: "Active",
    },
  ],
  children: [
    {
      id: "REG-SOUTH",
      nameEn: "Southern Region",
      nameMl: "തെക്കൻ മേഖല",
      level: "Region",
      code: "REG-S",
      officeBearers: [
        {
          id: "USR-ORG-005",
          nameEn: "Vivek Menon",
          nameMl: "വിവേക് മേനോൻ",
          designationEn: "Regional Coordinator",
          designationMl: "മേഖലാ കോഓർഡിനേറ്റർ",
          orgLevel: "Region",
          locationEn: "Southern Region",
          locationMl: "തെക്കൻ മേഖല",
          avatarUrl: "/images/avatar-male.jpg",
          status: "Active",
        },
      ],
      children: [
        {
          id: "DIST-TVM-CITY",
          nameEn: "Thiruvananthapuram City",
          nameMl: "തിരുവനന്തപുരം സിറ്റി",
          level: "Organisational District",
          code: "DIST-TVM",
          officeBearers: [
            {
              id: "USR-ORG-008",
              nameEn: "Rajesh Varma",
              nameMl: "രാജേഷ് വർമ്മ",
              designationEn: "President",
              designationMl: "ജില്ലാ പ്രസിഡന്റ്",
              orgLevel: "Organisational District",
              locationEn: "Thiruvananthapuram City",
              locationMl: "തിരുവനന്തപുരം സിറ്റി",
              avatarUrl: "/images/avatar-male.jpg",
              status: "Active",
            },
            {
              id: "USR-ORG-009",
              nameEn: "Anjana S.",
              nameMl: "അഞ്ജന എസ്.",
              designationEn: "Vice President",
              designationMl: "വൈസ് പ്രസിഡന്റ്",
              orgLevel: "Organisational District",
              locationEn: "Thiruvananthapuram City",
              locationMl: "തിരുവനന്തപുരം സിറ്റി",
              avatarUrl: "/images/avatar-female.jpg",
              status: "Active",
            },
          ],
          children: [
            {
              id: "MAND-NEMOM",
              nameEn: "Nemom",
              nameMl: "നേമം",
              level: "Mandalam",
              code: "MAND-01",
              officeBearers: [
                {
                  id: "USR-ORG-012",
                  nameEn: "Suresh Nandan",
                  nameMl: "സുരേഷ് നന്ദൻ",
                  designationEn: "President",
                  designationMl: "മണ്ഡലം പ്രസിഡന്റ്",
                  orgLevel: "Mandalam",
                  locationEn: "Nemom",
                  locationMl: "നേമം",
                  avatarUrl: "/images/avatar-male.jpg",
                  status: "Active",
                },
                {
                  id: "USR-ORG-013",
                  nameEn: "Lakshmi Prasad",
                  nameMl: "ലക്ഷ്മി പ്രസാദ്",
                  designationEn: "Vice President",
                  designationMl: "വൈസ് പ്രസിഡന്റ്",
                  orgLevel: "Mandalam",
                  locationEn: "Nemom",
                  locationMl: "നേമം",
                  avatarUrl: "/images/avatar-female.jpg",
                  status: "Active",
                },
              ],
              children: [
                {
                  id: "AREA-KARAMANA",
                  nameEn: "Karamana Area",
                  nameMl: "കരമന ഏരിയ",
                  level: "Area",
                  code: "AREA-01",
                  officeBearers: [
                    {
                      id: "USR-ORG-016",
                      nameEn: "Deepak Mohan",
                      nameMl: "ദീപക് മോഹൻ",
                      designationEn: "Area Coordinator",
                      designationMl: "ഏരിയ കോഓർഡിനേറ്റർ",
                      orgLevel: "Area",
                      locationEn: "Karamana Area",
                      locationMl: "കരമന ഏരിയ",
                      avatarUrl: "/images/avatar-male.jpg",
                      status: "Active",
                    },
                    {
                      id: "USR-ORG-017",
                      nameEn: "Anoop K.",
                      nameMl: "അനൂപ് കെ.",
                      designationEn: "Area In-charge",
                      designationMl: "ഏരിയ ഇൻ-ചാർജ്ജ്",
                      orgLevel: "Area",
                      locationEn: "Karamana Area",
                      locationMl: "കരമന ഏരിയ",
                      avatarUrl: "/images/avatar-male.jpg",
                      status: "Active",
                    },
                  ],
                  children: [
                    {
                      id: "BOOTH-001",
                      nameEn: "Booth 001 — Karamana",
                      nameMl: "ബൂത്ത് 001 — കരമന",
                      level: "Booth",
                      code: "BTH-001",
                      officeBearers: [
                        {
                          id: "USR-ORG-019",
                          nameEn: "Manoj Krishnan",
                          nameMl: "മനോജ് കൃഷ്ണൻ",
                          designationEn: "Booth President",
                          designationMl: "ബൂത്ത് പ്രസിഡന്റ്",
                          orgLevel: "Booth",
                          locationEn: "Booth 001 — Karamana",
                          locationMl: "ബൂത്ത് 001 — കരമന",
                          avatarUrl: "/images/avatar-male.jpg",
                          status: "Active",
                        },
                        {
                          id: "USR-ORG-020",
                          nameEn: "Reshma Nair",
                          nameMl: "രേഷ്മ നായർ",
                          designationEn: "Booth Secretary",
                          designationMl: "ബൂത്ത് സെക്രട്ടറി",
                          orgLevel: "Booth",
                          locationEn: "Booth 001 — Karamana",
                          locationMl: "ബൂത്ത് 001 — കരമന",
                          avatarUrl: "/images/avatar-female.jpg",
                          status: "Active",
                        },
                      ],
                    },
                    {
                      id: "BOOTH-002",
                      nameEn: "Booth 002 — Karamana",
                      nameMl: "ബൂത്ത് 002 — കരമന",
                      level: "Booth",
                      code: "BTH-002",
                      officeBearers: [
                        {
                          id: "USR-ORG-021",
                          nameEn: "Vishnu Raj",
                          nameMl: "വിഷ്ണു രാജ്",
                          designationEn: "Booth Committee Member",
                          designationMl: "ബൂത്ത് കമ്മിറ്റി അംഗം",
                          orgLevel: "Booth",
                          locationEn: "Booth 002 — Karamana",
                          locationMl: "ബൂത്ത് 002 — കരമന",
                          avatarUrl: "/images/avatar-male.jpg",
                          status: "Active",
                        },
                      ],
                      vacantDesignations: [
                        { designationEn: "Booth President", designationMl: "ബൂത്ത് പ്രസിഡന്റ്" },
                        { designationEn: "Booth Secretary", designationMl: "ബൂത്ത് സെക്രട്ടറി" },
                      ],
                    },
                    {
                      id: "BOOTH-003",
                      nameEn: "Booth 003 — Pappanamcode",
                      nameMl: "ബൂത്ത് 003 — പാപ്പനംകോട്",
                      level: "Booth",
                      code: "BTH-003",
                      officeBearers: [
                        {
                          id: "USR-ORG-022",
                          nameEn: "Binu Kumar",
                          nameMl: "ബിനു കുമാർ",
                          designationEn: "Booth Worker",
                          designationMl: "ബൂത്ത് പ്രവർത്തകൻ",
                          orgLevel: "Booth",
                          locationEn: "Booth 003 — Pappanamcode",
                          locationMl: "ബൂത്ത് 003 — പാപ്പനംകോട്",
                          avatarUrl: "/images/avatar-male.jpg",
                          status: "Active",
                        },
                      ],
                      vacantDesignations: [
                        { designationEn: "Booth President", designationMl: "ബൂത്ത് പ്രസിഡന്റ്" },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "MAND-VATTIYOORKAVU",
              nameEn: "Vattiyoorkavu",
              nameMl: "വട്ടിയൂർക്കാവ്",
              level: "Mandalam",
              code: "MAND-02",
              officeBearers: [
                {
                  id: "USR-ORG-014",
                  nameEn: "Ajay Raj",
                  nameMl: "അജയ് രാജ്",
                  designationEn: "Secretary",
                  designationMl: "മണ്ഡലം സെക്രട്ടറി",
                  orgLevel: "Mandalam",
                  locationEn: "Vattiyoorkavu",
                  locationMl: "വട്ടിയൂർക്കാവ്",
                  avatarUrl: "/images/avatar-male.jpg",
                  status: "Active",
                },
              ],
              vacantDesignations: [
                { designationEn: "President", designationMl: "മണ്ഡലം പ്രസിഡന്റ്" },
              ],
              children: [
                {
                  id: "AREA-PATTOM",
                  nameEn: "Pattom Area",
                  nameMl: "പട്ടം ഏരിയ",
                  level: "Area",
                  code: "AREA-02",
                  officeBearers: [
                    {
                      id: "USR-ORG-018",
                      nameEn: "Sreelakshmi P.",
                      nameMl: "ശ്രീലക്ഷ്മി പി.",
                      designationEn: "Area Committee Member",
                      designationMl: "ഏരിയ കമ്മിറ്റി അംഗം",
                      orgLevel: "Area",
                      locationEn: "Pattom Area",
                      locationMl: "പട്ടം ഏരിയ",
                      avatarUrl: "/images/avatar-female.jpg",
                      status: "Active",
                    },
                  ],
                  vacantDesignations: [
                    { designationEn: "Area Coordinator", designationMl: "ഏരിയ കോഓർഡിനേറ്റർ" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "REG-CENTRAL",
      nameEn: "Central Region",
      nameMl: "മധ്യ മേഖല",
      level: "Region",
      code: "REG-C",
      officeBearers: [
        {
          id: "USR-ORG-007",
          nameEn: "Nikhil Raj",
          nameMl: "നിഖിൽ രാജ്",
          designationEn: "Regional Coordinator",
          designationMl: "മേഖലാ കോഓർഡിനേറ്റർ",
          orgLevel: "Region",
          locationEn: "Central Region",
          locationMl: "മധ്യ മേഖല",
          avatarUrl: "/images/avatar-male.jpg",
          status: "Active",
        },
      ],
      children: [
        {
          id: "DIST-EKM-CITY",
          nameEn: "Ernakulam City",
          nameMl: "എറണാകുളം സിറ്റി",
          level: "Organisational District",
          code: "DIST-EKM",
          officeBearers: [
            {
              id: "USR-ORG-010",
              nameEn: "Harish Kumar",
              nameMl: "ഹരീഷ് കുമാർ",
              designationEn: "General Secretary",
              designationMl: "ജനറൽ സെക്രട്ടറി",
              orgLevel: "Organisational District",
              locationEn: "Ernakulam City",
              locationMl: "എറണാകുളം സിറ്റി",
              avatarUrl: "/images/avatar-male.jpg",
              status: "Active",
            },
          ],
          vacantDesignations: [
            { designationEn: "President", designationMl: "ജില്ലാ പ്രസിഡന്റ്" },
          ],
          children: [
            {
              id: "MAND-THRISSUR",
              nameEn: "Thrissur",
              nameMl: "തൃശ്ശൂർ",
              level: "Mandalam",
              code: "MAND-03",
              officeBearers: [
                {
                  id: "USR-ORG-015",
                  nameEn: "Divya R.",
                  nameMl: "ദിവ്യ ആർ.",
                  designationEn: "Treasurer",
                  designationMl: "ട്രഷറർ",
                  orgLevel: "Mandalam",
                  locationEn: "Thrissur",
                  locationMl: "തൃശ്ശൂർ",
                  avatarUrl: "/images/avatar-female.jpg",
                  status: "Active",
                },
              ],
              vacantDesignations: [
                { designationEn: "President", designationMl: "മണ്ഡലം പ്രസിഡന്റ്" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "REG-NORTH",
      nameEn: "Northern Region",
      nameMl: "വടക്കൻ മേഖല",
      level: "Region",
      code: "REG-N",
      officeBearers: [
        {
          id: "USR-ORG-006",
          nameEn: "Rahul Das",
          nameMl: "രാഹുൽ ദാസ്",
          designationEn: "Regional In-charge",
          designationMl: "മേഖലാ ഇൻ-ചാർജ്ജ്",
          orgLevel: "Region",
          locationEn: "Northern Region",
          locationMl: "വടക്കൻ മേഖല",
          avatarUrl: "/images/avatar-male.jpg",
          status: "Active",
        },
      ],
      children: [
        {
          id: "DIST-KKD-CITY",
          nameEn: "Kozhikode City",
          nameMl: "കോഴിക്കോട് സിറ്റി",
          level: "Organisational District",
          code: "DIST-KKD",
          officeBearers: [
            {
              id: "USR-ORG-011",
              nameEn: "Priya Mohan",
              nameMl: "പ്രിയ മോഹൻ",
              designationEn: "Secretary",
              designationMl: "സെക്രട്ടറി",
              orgLevel: "Organisational District",
              locationEn: "Kozhikode City",
              locationMl: "കോഴിക്കോട് സിറ്റി",
              avatarUrl: "/images/avatar-female.jpg",
              status: "Active",
            },
          ],
          vacantDesignations: [
            { designationEn: "President", designationMl: "ജില്ലാ പ്രസിഡന്റ്" },
          ],
        },
      ],
    },
  ],
};

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string; badge: string; icon: any }> = {
  State: {
    bg: "bg-orange-50/80 dark:bg-orange-950/30",
    border: "border-orange-300 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    badge: "bg-orange-500 text-white",
    icon: Globe,
  },
  Region: {
    bg: "bg-blue-50/80 dark:bg-blue-950/30",
    border: "border-blue-300 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-600 text-white",
    icon: Layers,
  },
  "Organisational District": {
    bg: "bg-amber-50/80 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-600 text-white",
    icon: Building2,
  },
  Mandalam: {
    bg: "bg-emerald-50/80 dark:bg-emerald-950/30",
    border: "border-emerald-300 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-600 text-white",
    icon: MapPin,
  },
  Area: {
    bg: "bg-purple-50/80 dark:bg-purple-950/30",
    border: "border-purple-300 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    badge: "bg-purple-600 text-white",
    icon: Home,
  },
  Booth: {
    bg: "bg-rose-50/80 dark:bg-rose-950/30",
    border: "border-rose-300 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    badge: "bg-rose-600 text-white",
    icon: Flag,
  },
};

export function OrganisationalChart({ tr, lang, onEditLocation }: OrganisationalChartProps) {
  const isMalayalam = lang === "ml";
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [showVacant, setShowVacant] = useState(true);

  // State for expanded node collapse tracking
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "STATE-KL": true,
    "REG-SOUTH": true,
    "REG-CENTRAL": true,
    "REG-NORTH": true,
    "DIST-TVM-CITY": true,
    "MAND-NEMOM": true,
    "AREA-KARAMANA": true,
  });

  const [selectedNode, setSelectedNode] = useState<OrgHierarchyNode | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    setExpandedNodes({
      "STATE-KL": true,
      "REG-SOUTH": true,
      "REG-CENTRAL": true,
      "REG-NORTH": true,
      "DIST-TVM-CITY": true,
      "DIST-EKM-CITY": true,
      "DIST-KKD-CITY": true,
      "MAND-NEMOM": true,
      "MAND-VATTIYOORKAVU": true,
      "MAND-THRISSUR": true,
      "AREA-KARAMANA": true,
      "AREA-PATTOM": true,
      "BOOTH-001": true,
      "BOOTH-002": true,
      "BOOTH-003": true,
    });
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Helper count of office bearers in tree
  const totalOfficeBearersCount = 22;

  // Filter tree based on regionFilter and search
  const filteredTree = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const matchesSearchAndFilter = (node: OrgHierarchyNode): boolean => {
      // Level filter
      if (levelFilter !== "ALL" && node.level !== levelFilter) {
        // Continue checking children
      }
      if (!q) return true;

      const nodeNameMatch =
        node.nameEn.toLowerCase().includes(q) || node.nameMl.toLowerCase().includes(q);
      const userMatch = node.officeBearers.some(
        (u) =>
          u.nameEn.toLowerCase().includes(q) ||
          u.nameMl.toLowerCase().includes(q) ||
          u.designationEn.toLowerCase().includes(q) ||
          u.locationEn.toLowerCase().includes(q)
      );

      if (nodeNameMatch || userMatch) return true;

      return node.children ? node.children.some(matchesSearchAndFilter) : false;
    };

    return SAMPLE_ORG_HIERARCHY;
  }, [searchQuery, levelFilter]);

  // Render recursive tree node card component
  const renderNode = (node: OrgHierarchyNode, depth = 0) => {
    const isExpanded = Boolean(expandedNodes[node.id]);
    const styleConfig = LEVEL_COLORS[node.level] || LEVEL_COLORS["State"];
    const LevelIcon = styleConfig.icon;

    // Region filter check
    if (
      regionFilter !== "ALL" &&
      node.level === "Region" &&
      node.id !== regionFilter
    ) {
      return null;
    }

    // Filter check by search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const selfMatch =
        node.nameEn.toLowerCase().includes(q) ||
        node.nameMl.toLowerCase().includes(q) ||
        node.officeBearers.some(
          (u) =>
            u.nameEn.toLowerCase().includes(q) ||
            u.nameMl.toLowerCase().includes(q) ||
            u.designationEn.toLowerCase().includes(q) ||
            u.locationEn.toLowerCase().includes(q)
        );
      const childrenMatch = node.children?.some((child) => {
        const checkChild = (c: OrgHierarchyNode): boolean => {
          return (
            c.nameEn.toLowerCase().includes(q) ||
            c.nameMl.toLowerCase().includes(q) ||
            c.officeBearers.some((u) => u.nameEn.toLowerCase().includes(q)) ||
            Boolean(c.children?.some(checkChild))
          );
        };
        return checkChild(child);
      });

      if (!selfMatch && !childrenMatch) return null;
    }

    return (
      <div key={node.id} className="flex flex-col items-center w-full">
        {/* Node Container Card */}
        <div
          className={cn(
            "w-full max-w-xl rounded-xl border p-3.5 transition-all shadow-2xs hover:shadow-xs",
            styleConfig.bg,
            styleConfig.border
          )}
        >
          {/* Header Row: Level Icon, Title, Expand Toggle */}
          <div className="flex items-center justify-between gap-3">
            <div
              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
              onClick={() => setSelectedNode(node)}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-xs",
                  styleConfig.badge
                )}
              >
                <LevelIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-background/80 border border-border text-foreground">
                    {tr(node.level, node.level)}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground font-mono">
                    {node.code}
                  </span>
                </div>
                <h3 className="text-sm font-black text-foreground truncate mt-0.5">
                  {isMalayalam ? node.nameMl : node.nameEn}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSelectedNode(node)}
                className="h-7 text-[11px] font-bold text-primary hover:bg-background/80 px-2 cursor-pointer"
              >
                <Info className="h-3.5 w-3.5 mr-1" />
                {tr("Details", "വിവരങ്ങൾ")}
              </Button>

              {node.children && node.children.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(node.id);
                  }}
                  className="h-7 w-7 p-0 bg-background/80 border-border cursor-pointer shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Assigned Office Bearers List */}
          <div className="mt-3 pt-2.5 border-t border-border/60">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                {tr("Office Bearers", "ഭാരവാഹികൾ")} ({node.officeBearers.length})
              </span>
              {node.children && node.children.length > 0 && (
                <span className="text-[10.5px]">
                  {node.children.length} {tr("Sub-units", "കീഴ്ഘടകങ്ങൾ")}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {node.officeBearers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card p-2 shadow-2xs hover:border-primary/50 transition-colors"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.nameEn}
                    className="h-9 w-9 rounded-full object-cover shrink-0 border border-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">
                      {isMalayalam ? user.nameMl : user.nameEn}
                    </p>
                    <p className="text-[10.5px] font-semibold text-primary truncate">
                      {isMalayalam ? user.designationMl : user.designationEn}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {isMalayalam ? user.locationMl : user.locationEn}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    {tr("Active", "സജീവം")}
                  </span>
                </div>
              ))}

              {/* Vacant Designation Cards if any */}
              {showVacant &&
                node.vacantDesignations?.map((vac, idx) => (
                  <div
                    key={`vacant-${idx}`}
                    className="flex items-center gap-2.5 rounded-lg border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 p-2"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 font-bold border border-amber-200">
                      <UserX className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-300 truncate">
                        {tr("Vacant", "ഒഴിവ്")}
                      </p>
                      <p className="text-[10.5px] font-semibold text-muted-foreground truncate">
                        {isMalayalam ? vac.designationMl : vac.designationEn}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {isMalayalam ? node.nameMl : node.nameEn}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0">
                      {tr("Vacant", "ഒഴിവ്")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Tree Line Connector to Children */}
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="flex flex-col items-center w-full my-1">
            <div className="w-0.5 h-6 bg-primary/40" />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full relative pt-2">
              {node.children.map((childNode) => renderNode(childNode, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 p-4 sm:p-5 bg-background text-foreground">
      {/* Overview Metric Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-xs mb-1">
            <Globe className="h-4 w-4" />
            <span>{tr("State Unit", "സംസ്ഥാന യുണിറ്റ്")}</span>
          </div>
          <p className="text-lg font-black text-foreground">1</p>
          <p className="text-[10.5px] text-muted-foreground font-medium">Kerala State</p>
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
          <p className="text-[10.5px] text-muted-foreground font-medium">Thiruvananthapuram, etc.</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
            <MapPin className="h-4 w-4" />
            <span>{tr("Mandalams", "മണ്ഡലങ്ങൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">140</p>
          <p className="text-[10.5px] text-muted-foreground font-medium">Nemom, Vattiyoorkavu, etc.</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs mb-1">
            <Home className="h-4 w-4" />
            <span>{tr("Area Units", "ഏരിയ യൂണിറ്റുകൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">2,100+</p>
          <p className="text-[10.5px] text-muted-foreground font-medium">Karamana, Pattom Area</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs mb-1">
            <Flag className="h-4 w-4" />
            <span>{tr("Booths", "ബൂത്തുകൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">25,000+</p>
          <p className="text-[10.5px] text-muted-foreground font-medium">Booth 001, 002, 003</p>
        </div>
      </div>

      {/* Interactive Control & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            {tr("Filter Level:", "ലെവൽ ഫിൽട്ടർ:")}
          </span>
          {[
            { id: "ALL", en: "All Levels", ml: "എല്ലാ ലെവലുകളും" },
            { id: "State", en: "State", ml: "സംസ്ഥാനം" },
            { id: "Region", en: "Region", ml: "മേഖല" },
            { id: "Organisational District", en: "District", ml: "ജില്ല" },
            { id: "Mandalam", en: "Mandalam", ml: "മണ്ഡലം" },
            { id: "Area", en: "Area", ml: "ഏരിയ" },
            { id: "Booth", en: "Booth", ml: "ബൂത്ത്" },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setLevelFilter(btn.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                levelFilter === btn.id
                  ? "bg-primary text-primary-foreground shadow-2xs font-extrabold"
                  : "bg-background text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              {isMalayalam ? btn.ml : btn.en}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Region filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="ALL">{tr("All Regions", "എല്ലാ മേഖലകളും")}</option>
            <option value="REG-SOUTH">{tr("Southern Region", "തെക്കൻ മേഖല")}</option>
            <option value="REG-CENTRAL">{tr("Central Region", "മധ്യ മേഖല")}</option>
            <option value="REG-NORTH">{tr("Northern Region", "വടക്കൻ മേഖല")}</option>
          </select>

          {/* Toggle Vacant Slots */}
          <button
            type="button"
            onClick={() => setShowVacant(!showVacant)}
            className={`h-8 rounded-lg px-2.5 text-xs font-bold border transition-colors cursor-pointer ${
              showVacant
                ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {showVacant
              ? tr("Hide Vacant", "ഒഴിവുകൾ മറയ്ക്കുക")
              : tr("Show Vacant", "ഒഴിവുകൾ കാണിക്കുക")}
          </button>

          {/* Search bar */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={tr("Search user or location...", "തിരയുക...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
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
            <span className="hidden sm:inline">{tr("Expand All", "വികസിപ്പിക്കുക")}</span>
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
            <span className="hidden sm:inline">{tr("Collapse All", "ചുരുക്കുക")}</span>
          </Button>
        </div>
      </div>

      {/* Main Hierarchy Tree Display Container */}
      <div className="rounded-2xl border border-border/80 bg-muted/10 p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[800px] flex justify-center py-2">
          {renderNode(filteredTree)}
        </div>
      </div>

      {/* Node Office-Bearers Details Modal */}
      {selectedNode && (
        <Dialog open={Boolean(selectedNode)} onOpenChange={() => setSelectedNode(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {selectedNode.code}
                </span>
                <DialogTitle className="text-base font-bold">
                  {isMalayalam ? selectedNode.nameMl : selectedNode.nameEn}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="rounded-lg bg-muted/40 p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tr("Organisation Level:", "ലെവൽ:")}</span>
                  <span className="font-bold text-foreground">{selectedNode.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tr("Office Bearers Count:", "ഭാരവാഹികളുടെ എണ്ണം:")}</span>
                  <span className="font-bold text-primary">{selectedNode.officeBearers.length}</span>
                </div>
              </div>

              {/* Office Bearers List */}
              <div className="space-y-2 border-t border-border pt-3">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>{tr("Assigned Office Bearers", "നിയമിതരായ ഭാരവാഹികൾ")}</span>
                </h4>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedNode.officeBearers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5"
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.nameEn}
                        className="h-10 w-10 rounded-full object-cover shrink-0 border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm truncate">
                          {isMalayalam ? user.nameMl : user.nameEn}
                        </p>
                        <p className="text-xs font-semibold text-primary truncate">
                          {isMalayalam ? user.designationMl : user.designationEn}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {isMalayalam ? user.locationMl : user.locationEn} • {user.orgLevel}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> {tr("Active", "സജീവം")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vacant Designations List if any */}
              {selectedNode.vacantDesignations && selectedNode.vacantDesignations.length > 0 && (
                <div className="space-y-2 border-t border-border pt-3">
                  <h4 className="font-bold text-amber-700 dark:text-amber-400 text-xs uppercase tracking-wider">
                    {tr("Vacant Positions", "ഒഴിവുള്ള തസ്തികകൾ")}
                  </h4>
                  <div className="space-y-1.5">
                    {selectedNode.vacantDesignations.map((vac, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-2 text-xs"
                      >
                        <span className="font-semibold text-foreground">
                          {isMalayalam ? vac.designationMl : vac.designationEn}
                        </span>
                        <span className="rounded bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          {tr("Vacant", "ഒഴിവ്")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
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
