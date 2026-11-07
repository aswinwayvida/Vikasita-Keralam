import { useState, useRef } from "react";
import {
  User,
  Users,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronRight,
  Info,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Globe,
  Layers,
  Building2,
  Home,
  Flag,
  UserCheck,
  UserCheck2,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface UserChartProps {
  tr: (en: string, ml: string) => string;
  lang: string;
}

export interface UserNode {
  id: string;
  nameEn: string;
  nameMl: string;
  designationEn: string;
  designationMl: string;
  orgLevel:
    | "State"
    | "Region"
    | "Organisational District"
    | "Mandalam"
    | "Area"
    | "Booth";
  locationEn: string;
  locationMl: string;
  avatarUrl: string;
  status: "Active" | "Inactive";
  mobile: string;
  email: string;
  subordinates?: UserNode[];
}

// Fictional User Hierarchy Tree representing organisational leadership reporting structure
const USER_HIERARCHY_TREE: UserNode = {
  id: "USR-001",
  nameEn: "Arun Dev",
  nameMl: "അരുൺ ദേവ്",
  designationEn: "President",
  designationMl: "സംസ്ഥാന പ്രസിഡന്റ്",
  orgLevel: "State",
  locationEn: "Kerala State",
  locationMl: "കേരള സംസ്ഥാനം",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  status: "Active",
  mobile: "+91 98470 12345",
  email: "arun.dev@vikasitakeralam.org",
  subordinates: [
    {
      id: "USR-002",
      nameEn: "Meera Nair",
      nameMl: "മീര നായർ",
      designationEn: "Vice President",
      designationMl: "വൈസ് പ്രസിഡന്റ്",
      orgLevel: "State",
      locationEn: "Kerala State",
      locationMl: "കേരള സംസ്ഥാനം",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      mobile: "+91 98470 23456",
      email: "meera.nair@vikasitakeralam.org",
    },
    {
      id: "USR-003",
      nameEn: "Anil Kumar",
      nameMl: "അനിൽ കുമാർ",
      designationEn: "General Secretary",
      designationMl: "ജനറൽ സെക്രട്ടറി",
      orgLevel: "State",
      locationEn: "Kerala State",
      locationMl: "കേരള സംസ്ഥാനം",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      mobile: "+91 98470 34567",
      email: "anil.kumar@vikasitakeralam.org",
    },
    {
      id: "USR-004",
      nameEn: "Kavitha Menon",
      nameMl: "കവിത മേനോൻ",
      designationEn: "Secretary",
      designationMl: "സെക്രട്ടറി",
      orgLevel: "State",
      locationEn: "Kerala State",
      locationMl: "കേരള സംസ്ഥാനം",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      mobile: "+91 98470 45678",
      email: "kavitha.menon@vikasitakeralam.org",
    },
    // Southern Regional Lead & Team
    {
      id: "USR-005",
      nameEn: "Vivek Menon",
      nameMl: "വിവേക് മേനോൻ",
      designationEn: "Regional Coordinator",
      designationMl: "മേഖലാ കോഓർഡിനേറ്റർ",
      orgLevel: "Region",
      locationEn: "Southern Region",
      locationMl: "തെക്കൻ മേഖല",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      mobile: "+91 98470 56789",
      email: "vivek.menon@vikasitakeralam.org",
      subordinates: [
        {
          id: "USR-008",
          nameEn: "Rajesh Varma",
          nameMl: "രാജേഷ് വർമ്മ",
          designationEn: "District President",
          designationMl: "ജില്ലാ പ്രസിഡന്റ്",
          orgLevel: "Organisational District",
          locationEn: "Thiruvananthapuram City",
          locationMl: "തിരുവനന്തപുരം സിറ്റി",
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          status: "Active",
          mobile: "+91 98470 89012",
          email: "rajesh.varma@vikasitakeralam.org",
          subordinates: [
            {
              id: "USR-009",
              nameEn: "Anjana S.",
              nameMl: "അഞ്ജന എസ്.",
              designationEn: "Vice President",
              designationMl: "വൈസ് പ്രസിഡന്റ്",
              orgLevel: "Organisational District",
              locationEn: "Thiruvananthapuram City",
              locationMl: "തിരുവനന്തപുരം സിറ്റി",
              avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
              status: "Active",
              mobile: "+91 98470 90123",
              email: "anjana.s@vikasitakeralam.org",
            },
            {
              id: "USR-012",
              nameEn: "Suresh Nandan",
              nameMl: "സുരേഷ് നന്ദൻ",
              designationEn: "Mandalam President",
              designationMl: "മണ്ഡലം പ്രസിഡന്റ്",
              orgLevel: "Mandalam",
              locationEn: "Nemom Mandalam",
              locationMl: "നേമം മണ്ഡലം",
              avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
              status: "Active",
              mobile: "+91 98471 23456",
              email: "suresh.nandan@vikasitakeralam.org",
              subordinates: [
                {
                  id: "USR-013",
                  nameEn: "Lakshmi Prasad",
                  nameMl: "ലക്ഷ്മി പ്രസാദ്",
                  designationEn: "Vice President",
                  designationMl: "വൈസ് പ്രസിഡന്റ്",
                  orgLevel: "Mandalam",
                  locationEn: "Nemom Mandalam",
                  locationMl: "നേമം മണ്ഡലം",
                  avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                  status: "Active",
                  mobile: "+91 98471 34567",
                  email: "lakshmi.prasad@vikasitakeralam.org",
                },
                {
                  id: "USR-016",
                  nameEn: "Deepak Mohan",
                  nameMl: "ദീപക് മോഹൻ",
                  designationEn: "Area Coordinator",
                  designationMl: "ഏരിയ കോഓർഡിനേറ്റർ",
                  orgLevel: "Area",
                  locationEn: "Karamana Area",
                  locationMl: "കരമന ഏരിയ",
                  avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
                  status: "Active",
                  mobile: "+91 98471 67890",
                  email: "deepak.mohan@vikasitakeralam.org",
                  subordinates: [
                    {
                      id: "USR-017",
                      nameEn: "Anoop K.",
                      nameMl: "അനൂപ് കെ.",
                      designationEn: "Area In-charge",
                      designationMl: "ഏരിയ ഇൻ-ചാർജ്ജ്",
                      orgLevel: "Area",
                      locationEn: "Karamana Area",
                      locationMl: "കരമന ഏരിയ",
                      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                      status: "Active",
                      mobile: "+91 98471 78901",
                      email: "anoop.k@vikasitakeralam.org",
                    },
                    {
                      id: "USR-019",
                      nameEn: "Manoj Krishnan",
                      nameMl: "മനോജ് കൃഷ്ണൻ",
                      designationEn: "Booth President",
                      designationMl: "ബൂത്ത് പ്രസിഡന്റ്",
                      orgLevel: "Booth",
                      locationEn: "Booth 001 — Karamana",
                      locationMl: "ബൂത്ത് 001 — കരമന",
                      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
                      status: "Active",
                      mobile: "+91 98471 90123",
                      email: "manoj.k@vikasitakeralam.org",
                    },
                    {
                      id: "USR-020",
                      nameEn: "Reshma Nair",
                      nameMl: "രേഷ്മ നായർ",
                      designationEn: "Booth Secretary",
                      designationMl: "ബൂത്ത് സെക്രട്ടറി",
                      orgLevel: "Booth",
                      locationEn: "Booth 001 — Karamana",
                      locationMl: "ബൂത്ത് 001 — കരമന",
                      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
                      status: "Active",
                      mobile: "+91 98472 01234",
                      email: "reshma.nair@vikasitakeralam.org",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    // Central Regional Lead & Team
    {
      id: "USR-007",
      nameEn: "Nikhil Raj",
      nameMl: "നിഖിൽ രാജ്",
      designationEn: "Regional Coordinator",
      designationMl: "മേഖലാ കോഓർഡിനേറ്റർ",
      orgLevel: "Region",
      locationEn: "Central Region",
      locationMl: "മധ്യ മേഖല",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      mobile: "+91 98470 78901",
      email: "nikhil.raj@vikasitakeralam.org",
      subordinates: [
        {
          id: "USR-010",
          nameEn: "Harish Kumar",
          nameMl: "ഹരീഷ് കുമാർ",
          designationEn: "General Secretary",
          designationMl: "ജനറൽ സെക്രട്ടറി",
          orgLevel: "Organisational District",
          locationEn: "Ernakulam City",
          locationMl: "എറണാകുളം സിറ്റി",
          avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
          status: "Active",
          mobile: "+91 98471 01234",
          email: "harish.kumar@vikasitakeralam.org",
          subordinates: [
            {
              id: "USR-015",
              nameEn: "Divya R.",
              nameMl: "ദിവ്യ ആർ.",
              designationEn: "Treasurer",
              designationMl: "ട്രഷറർ",
              orgLevel: "Mandalam",
              locationEn: "Thrissur Mandalam",
              locationMl: "തൃശ്ശൂർ മണ്ഡലം",
              avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              status: "Active",
              mobile: "+91 98471 56789",
              email: "divya.r@vikasitakeralam.org",
            },
          ],
        },
      ],
    },
    // Northern Regional Lead & Team
    {
      id: "USR-006",
      nameEn: "Rahul Das",
      nameMl: "രാഹുൽ ദാസ്",
      designationEn: "Regional In-charge",
      designationMl: "മേഖലാ ഇൻ-ചാർജ്ജ്",
      orgLevel: "Region",
      locationEn: "Northern Region",
      locationMl: "വടക്കൻ മേഖല",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      mobile: "+91 98470 67890",
      email: "rahul.das@vikasitakeralam.org",
      subordinates: [
        {
          id: "USR-011",
          nameEn: "Priya Mohan",
          nameMl: "പ്രിയ മോഹൻ",
          designationEn: "District Secretary",
          designationMl: "ജില്ലാ സെക്രട്ടറി",
          orgLevel: "Organisational District",
          locationEn: "Kozhikode City",
          locationMl: "കോഴിക്കോട് സിറ്റി",
          avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
          status: "Active",
          mobile: "+91 98471 12345",
          email: "priya.mohan@vikasitakeralam.org",
        },
      ],
    },
  ],
};

const LEVEL_STYLES: Record<
  string,
  { bg: string; border: string; text: string; badge: string; icon: any }
> = {
  State: {
    bg: "bg-gradient-to-b from-amber-50 to-orange-50/90 dark:from-amber-950/40 dark:to-orange-950/30",
    border: "border-orange-400 dark:border-orange-700",
    text: "text-orange-900 dark:text-orange-200",
    badge: "bg-orange-600 text-white font-black",
    icon: Globe,
  },
  Region: {
    bg: "bg-gradient-to-b from-blue-50 to-indigo-50/90 dark:from-blue-950/40 dark:to-indigo-950/30",
    border: "border-blue-400 dark:border-blue-700",
    text: "text-blue-900 dark:text-blue-200",
    badge: "bg-blue-600 text-white font-black",
    icon: Layers,
  },
  "Organisational District": {
    bg: "bg-gradient-to-b from-amber-50/90 to-yellow-50/80 dark:from-amber-950/30 dark:to-yellow-950/20",
    border: "border-amber-400 dark:border-amber-700",
    text: "text-amber-900 dark:text-amber-200",
    badge: "bg-amber-600 text-white font-black",
    icon: Building2,
  },
  Mandalam: {
    bg: "bg-gradient-to-b from-emerald-50 to-teal-50/90 dark:from-emerald-950/40 dark:to-teal-950/30",
    border: "border-emerald-400 dark:border-emerald-700",
    text: "text-emerald-900 dark:text-emerald-200",
    badge: "bg-emerald-600 text-white font-black",
    icon: MapPin,
  },
  Area: {
    bg: "bg-gradient-to-b from-purple-50 to-purple-100/70 dark:from-purple-950/40 dark:to-purple-950/20",
    border: "border-purple-300 dark:border-purple-700",
    text: "text-purple-900 dark:text-purple-200",
    badge: "bg-purple-600 text-white font-black",
    icon: Home,
  },
  Booth: {
    bg: "bg-gradient-to-b from-rose-50 to-pink-50/80 dark:from-rose-950/40 dark:to-pink-950/20",
    border: "border-rose-300 dark:border-rose-700",
    text: "text-rose-900 dark:text-rose-200",
    badge: "bg-rose-600 text-white font-black",
    icon: Flag,
  },
};

export function UserChart({ tr, lang }: UserChartProps) {
  const isMalayalam = lang === "ml";
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [zoomScale, setZoomScale] = useState(1.0);

  const [expandedUsers, setExpandedNodes] = useState<Record<string, boolean>>({
    "USR-001": true,
    "USR-005": true,
    "USR-007": true,
    "USR-006": true,
    "USR-008": true,
    "USR-012": true,
    "USR-016": true,
  });

  const [selectedUser, setSelectedUser] = useState<UserNode | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    const traverse = (node: UserNode) => {
      all[node.id] = true;
      if (node.subordinates) node.subordinates.forEach(traverse);
    };
    traverse(USER_HIERARCHY_TREE);
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes({ "USR-001": true });
  };

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.15, 0.55));
  const handleResetZoom = () => setZoomScale(1.0);

  const renderUserCard = (user: UserNode, depth = 0): React.ReactNode => {
    const isExpanded = Boolean(expandedUsers[user.id]);
    const styleConfig = LEVEL_STYLES[user.orgLevel] || LEVEL_STYLES["State"];
    const LevelIcon = styleConfig.icon;

    // Filter check by search
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const selfMatch =
        user.nameEn.toLowerCase().includes(q) ||
        user.nameMl.toLowerCase().includes(q) ||
        user.designationEn.toLowerCase().includes(q) ||
        user.locationEn.toLowerCase().includes(q) ||
        user.mobile.includes(q);

      const childrenMatch = user.subordinates?.some((child) => {
        const check = (c: UserNode): boolean =>
          c.nameEn.toLowerCase().includes(q) ||
          c.nameMl.toLowerCase().includes(q) ||
          c.designationEn.toLowerCase().includes(q) ||
          Boolean(c.subordinates?.some(check));
        return check(child);
      });

      if (!selfMatch && !childrenMatch) return null;
    }

    if (levelFilter !== "ALL" && user.orgLevel !== levelFilter) {
      // Allow children check if parent level filtered
    }

    const hasSubordinates = Boolean(user.subordinates && user.subordinates.length > 0);

    return (
      <div key={user.id} className="flex flex-col items-center shrink-0">
        {/* User Profile Card */}
        <div
          className={cn(
            "w-[300px] sm:w-[320px] rounded-xl border-2 p-3.5 transition-all shadow-sm hover:shadow-md relative bg-card",
            styleConfig.bg,
            styleConfig.border
          )}
        >
          {/* Level Header Tag */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/60">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white text-[10px]",
                  styleConfig.badge
                )}
              >
                <LevelIcon className="h-3 w-3" />
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-background/90 border border-border text-foreground truncate">
                {tr(user.orgLevel, user.orgLevel)}
              </span>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3 mr-0.5" />
              {tr("Active User", "സജീവ ഉപയോക്താവ്")}
            </span>
          </div>

          {/* User Photo & Info Row */}
          <div className="flex items-start gap-3">
            <img
              src={user.avatarUrl}
              alt={user.nameEn}
              className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-orange-400 shadow-2xs"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black text-foreground truncate">
                {isMalayalam ? user.nameMl : user.nameEn}
              </h3>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 truncate">
                {isMalayalam ? user.designationMl : user.designationEn}
              </p>
              {user.locationEn !== "Kerala State" && user.locationEn !== "Kerala" && (
                <p className="text-[10.5px] font-semibold text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                  {isMalayalam ? user.locationMl : user.locationEn}
                </p>
              )}
            </div>
          </div>

          {/* Action Row */}
          {hasSubordinates && (
            <div className="flex items-center justify-end pt-2.5 mt-2.5 border-t border-border/60">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => toggleExpand(user.id)}
                className="h-7 px-2.5 text-[11px] font-bold bg-background border-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer shrink-0"
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 mr-1" />
                    {tr("Collapse Team", "ചുരുക്കുക")} ({user.subordinates?.length})
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 mr-1" />
                    {tr("Direct Team", "കീഴ് ഉദ്യോഗസ്ഥർ")} ({user.subordinates?.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Subordinate Connection Lines & Cards */}
        {hasSubordinates && isExpanded && (
          <div className="flex flex-col items-center w-full pt-1">
            <div className="w-0.5 h-6 bg-orange-400 dark:bg-orange-500" />

            {user.subordinates!.length > 1 && (
              <div className="w-full flex justify-center px-4 relative">
                <div className="h-0.5 bg-orange-400 dark:bg-orange-500 w-[calc(100%-300px)] max-w-full" />
              </div>
            )}

            <div className="flex flex-wrap sm:flex-nowrap justify-center gap-6 pt-1 items-start">
              {user.subordinates!.map((subNode) => (
                <div key={subNode.id} className="flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-orange-400 dark:bg-orange-500" />
                  {renderUserCard(subNode, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 sm:p-5 bg-background text-foreground">
      {/* Top Header Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-bold text-xs mb-1">
            <Globe className="h-4 w-4" />
            <span>{tr("State Leaders", "സംസ്ഥാന നേതാക്കൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">4 Active</p>
          <p className="text-[10.5px] text-muted-foreground">Arun Dev & Team</p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">
            <Layers className="h-4 w-4" />
            <span>{tr("Regional Leads", "മേഖലാ നേതാക്കൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">3 Active</p>
          <p className="text-[10.5px] text-muted-foreground">South, Central, North</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs mb-1">
            <Building2 className="h-4 w-4" />
            <span>{tr("District Office Bearers", "ജില്ലാ ഭാരവാഹികൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">120+ Active</p>
          <p className="text-[10.5px] text-muted-foreground">30 Org Districts</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
            <MapPin className="h-4 w-4" />
            <span>{tr("Mandalam Office Bearers", "മണ്ഡലം ഭാരവാഹികൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">560+ Active</p>
          <p className="text-[10.5px] text-muted-foreground">140 Mandalams</p>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs mb-1">
            <Home className="h-4 w-4" />
            <span>{tr("Area Coordinators", "ഏരിയ ഭാരവാഹികൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">4,200+ Active</p>
          <p className="text-[10.5px] text-muted-foreground">Kendra & Area Units</p>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs mb-1">
            <Flag className="h-4 w-4" />
            <span>{tr("Booth Workers", "ബൂത്ത് പ്രവർത്തകർ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">25,000+ Active</p>
          <p className="text-[10.5px] text-muted-foreground">Grassroot Level</p>
        </div>
      </div>

      {/* Control Navigation Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 mr-1">
            <UserCheck2 className="h-4 w-4 text-orange-500" />
            {tr("User Level:", "ഉപയോക്തൃ തലം:")}
          </span>
          {[
            { id: "ALL", en: "All Users", ml: "എല്ലാ ഉപയോക്താക്കളും" },
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
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                levelFilter === btn.id
                  ? "bg-orange-500 text-white font-extrabold shadow-2xs"
                  : "bg-background text-muted-foreground border border-border hover:bg-muted"
              )}
            >
              {isMalayalam ? btn.ml : btn.en}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={tr("Search user name, designation...", "തിരയുക...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-l border-r border-border px-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-7 w-7 p-0 cursor-pointer"
              title={tr("Zoom Out", "ചെറുതാക്കുക")}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[11px] font-extrabold text-muted-foreground w-10 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-7 w-7 p-0 cursor-pointer"
              title={tr("Zoom In", "വലുതാക്കുക")}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              className="h-7 w-7 p-0 cursor-pointer"
              title={tr("Reset Zoom", "യഥാർത്ഥ വലുപ്പം")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="h-8 text-xs font-bold cursor-pointer"
          >
            <Maximize2 className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">{tr("Expand All", "വികസിപ്പിക്കുക")}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="h-8 text-xs font-bold cursor-pointer"
          >
            <Minimize2 className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">{tr("Collapse All", "ചുരുക്കുക")}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-8 text-xs font-bold border-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            <span>{tr("Export", "പ്രിന്റ്")}</span>
          </Button>
        </div>
      </div>

      {/* Main Interactive User Canvas */}
      <div className="rounded-2xl border-2 border-border/80 bg-slate-50/50 dark:bg-slate-950/40 p-6 overflow-auto min-h-[600px] relative shadow-inner bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]">
        <div
          className="inline-block min-w-full transition-transform duration-200 origin-top center py-4"
          style={{ transform: `scale(${zoomScale})` }}
        >
          <div className="flex justify-center">
            {renderUserCard(USER_HIERARCHY_TREE)}
          </div>
        </div>
      </div>

      {/* User Profile Details Modal */}
      {selectedUser && (
        <Dialog open={Boolean(selectedUser)} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.nameEn}
                  className="h-12 w-12 rounded-full object-cover border-2 border-orange-500"
                />
                <div>
                  <DialogTitle className="text-base font-bold">
                    {isMalayalam ? selectedUser.nameMl : selectedUser.nameEn}
                  </DialogTitle>
                  <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    {isMalayalam ? selectedUser.designationMl : selectedUser.designationEn}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 pt-2 text-xs">
              <div className="rounded-lg bg-muted/40 p-3 space-y-2 border border-border/70">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{tr("Organisation Level:", "ലെവൽ:")}</span>
                  <span className="font-extrabold text-foreground">{selectedUser.orgLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{tr("Assigned Location:", "സ്ഥലം:")}</span>
                  <span className="font-bold text-foreground">
                    {isMalayalam ? selectedUser.locationMl : selectedUser.locationEn}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{tr("Mobile Number:", "ഫോൺ:")}</span>
                  <span className="font-mono font-bold text-foreground">{selectedUser.mobile}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{tr("Email Address:", "ഇമെയിൽ:")}</span>
                  <span className="font-mono text-foreground truncate max-w-[200px]">{selectedUser.email}</span>
                </div>
              </div>

              {selectedUser.subordinates && selectedUser.subordinates.length > 0 && (
                <div className="space-y-2 border-t border-border pt-3">
                  <h4 className="font-extrabold text-foreground text-xs uppercase tracking-wider">
                    {tr("Direct Subordinates", "കീഴ് ഉദ്യോഗസ്ഥർ")} ({selectedUser.subordinates.length})
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedUser.subordinates.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2 shadow-2xs"
                      >
                        <img
                          src={sub.avatarUrl}
                          alt={sub.nameEn}
                          className="h-8 w-8 rounded-full object-cover shrink-0 border border-border"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground text-xs truncate">
                            {isMalayalam ? sub.nameMl : sub.nameEn}
                          </p>
                          <p className="text-[10.5px] font-bold text-orange-600 dark:text-orange-400 truncate">
                            {isMalayalam ? sub.designationMl : sub.designationEn}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
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
