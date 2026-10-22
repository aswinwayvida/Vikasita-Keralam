import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  HelpCircle,
  Layers,
  LineChart,
  Maximize2,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserCheck,
  UserPlus,
  UserRoundCheck,
  Users,
  UserX,
  X,
  Zap,
} from "lucide-react";

export type OrgLevel = "STATE" | "REGION" | "DISTRICT" | "MANDALAM" | "AREA" | "BOOTH";
export type UserRole = "STATE_ADMIN" | "DISTRICT_ADMIN" | "MANDALAM_OFFICER" | "FIELD_AGENT";

export interface RoleConfig {
  role: UserRole;
  title: string;
  label: string;
  scopeLabel: string;
  allowRoleSwitch: boolean;
  exportPermission: boolean;
  defaultLevel: OrgLevel;
  allowedLevels: OrgLevel[];
}

export const roleConfigs: Record<UserRole, RoleConfig> = {
  STATE_ADMIN: {
    role: "STATE_ADMIN",
    title: "State Super Administrator",
    label: "State Super Administrator",
    scopeLabel: "Kerala Statewide (All 14 Districts)",
    allowRoleSwitch: true,
    exportPermission: true,
    defaultLevel: "STATE",
    allowedLevels: ["STATE", "REGION", "DISTRICT", "MANDALAM", "AREA", "BOOTH"],
  },
  DISTRICT_ADMIN: {
    role: "DISTRICT_ADMIN",
    title: "District Administrator",
    label: "District Administrator",
    scopeLabel: "Thiruvananthapuram District",
    allowRoleSwitch: true,
    exportPermission: true,
    defaultLevel: "DISTRICT",
    allowedLevels: ["DISTRICT", "MANDALAM", "AREA", "BOOTH"],
  },
  MANDALAM_OFFICER: {
    role: "MANDALAM_OFFICER",
    title: "Mandalam Nodal Officer",
    label: "Mandalam Nodal Officer",
    scopeLabel: "Kazhakkoottam Mandalam",
    allowRoleSwitch: true,
    exportPermission: false,
    defaultLevel: "MANDALAM",
    allowedLevels: ["MANDALAM", "AREA", "BOOTH"],
  },
  FIELD_AGENT: {
    role: "FIELD_AGENT",
    title: "Booth Level Officer / Volunteer",
    label: "Booth Level Officer / Volunteer",
    scopeLabel: "Kazhakkoottam Ward 4 (Booth 142)",
    allowRoleSwitch: true,
    exportPermission: false,
    defaultLevel: "BOOTH",
    allowedLevels: ["BOOTH"],
  },
};

export const orgScopeLevels: {
  level: OrgLevel;
  label: string;
  units: { id: string; name: string }[];
}[] = [
  { level: "STATE", label: "State Level", units: [{ id: "STATE-KL", name: "Kerala State" }] },
  {
    level: "REGION",
    label: "Region Level",
    units: [
      { id: "reg-south", name: "South Region" },
      { id: "reg-central", name: "Central Region" },
      { id: "reg-north", name: "North Region" },
    ],
  },
  {
    level: "DISTRICT",
    label: "District Level",
    units: [
      { id: "dist-tvm", name: "Thiruvananthapuram" },
      { id: "dist-klm", name: "Kollam" },
      { id: "dist-ekm", name: "Ernakulam" },
      { id: "dist-clt", name: "Kozhikode" },
    ],
  },
  {
    level: "MANDALAM",
    label: "Mandalam Level",
    units: [
      { id: "man-tvm-c", name: "TVM Central Mandalam" },
      { id: "man-kazh", name: "Kazhakkoottam Mandalam" },
      { id: "man-maradu", name: "Maradu / Tripunithura Mandalam" },
    ],
  },
  {
    level: "AREA",
    label: "Area Level",
    units: [
      { id: "area-kazh-n", name: "Kazhakkoottam North Area" },
      { id: "area-[#statue]", name: "Statue / Secretariat Area" },
    ],
  },
  {
    level: "BOOTH",
    label: "Booth Level",
    units: [
      { id: "booth-142", name: "Booth 142 - Kazhakkoottam Govt HS" },
      { id: "booth-101", name: "Booth 101 - Govt Press School" },
    ],
  },
];

export interface OrgHierarchyNode {
  id: string;
  name: string;
  level: OrgLevel;
  parentId?: string;
}

export const orgHierarchyData: OrgHierarchyNode[] = [
  { id: "STATE-KL", name: "Kerala State", level: "STATE" },

  // Regions
  { id: "REG-SOUTH", name: "South Region", level: "REGION", parentId: "STATE-KL" },
  { id: "REG-CENTRAL", name: "Central Region", level: "REGION", parentId: "STATE-KL" },
  { id: "REG-NORTH", name: "North Region", level: "REGION", parentId: "STATE-KL" },

  // Districts - South
  { id: "DST-TVM", name: "Thiruvananthapuram", level: "DISTRICT", parentId: "REG-SOUTH" },
  { id: "DST-KLM", name: "Kollam", level: "DISTRICT", parentId: "REG-SOUTH" },
  { id: "DST-PTA", name: "Pathanamthitta", level: "DISTRICT", parentId: "REG-SOUTH" },
  { id: "DST-ALP", name: "Alappuzha", level: "DISTRICT", parentId: "REG-SOUTH" },

  // Districts - Central
  { id: "DST-EKM", name: "Ernakulam", level: "DISTRICT", parentId: "REG-CENTRAL" },
  { id: "DST-TSR", name: "Thrissur", level: "DISTRICT", parentId: "REG-CENTRAL" },
  { id: "DST-KTM", name: "Kottayam", level: "DISTRICT", parentId: "REG-CENTRAL" },
  { id: "DST-IDK", name: "Idukki", level: "DISTRICT", parentId: "REG-CENTRAL" },

  // Districts - North
  { id: "DST-CLT", name: "Kozhikode", level: "DISTRICT", parentId: "REG-NORTH" },
  { id: "DST-PKD", name: "Palakkad", level: "DISTRICT", parentId: "REG-NORTH" },
  { id: "DST-MLP", name: "Malappuram", level: "DISTRICT", parentId: "REG-NORTH" },
  { id: "DST-KNR", name: "Kannur", level: "DISTRICT", parentId: "REG-NORTH" },
  { id: "DST-WYD", name: "Wayanad", level: "DISTRICT", parentId: "REG-NORTH" },
  { id: "DST-KGD", name: "Kasaragod", level: "DISTRICT", parentId: "REG-NORTH" },
];

export const executiveKpiData = [
  {
    key: "totalCitizens",
    title: "Total Citizens",
    value: "142,850",
    change: "+6.2%",
    changeType: "increase" as const,
    period: "vs previous 30 days",
    subtext: "+8,201 registrations",
    href: "/admin/applications?tab=citizens",
  },
  {
    key: "helpRequests",
    title: "Help Requests",
    value: "12,450",
    change: "+8.4%",
    changeType: "increase" as const,
    period: "vs previous 30 days",
    subtext: "+842 this period",
    href: "/admin/applications",
  },
  {
    key: "openCases",
    title: "Open Requests",
    value: "1,884",
    change: "-4.1%",
    changeType: "decrease" as const,
    period: "vs previous 30 days",
    subtext: "68 overdue",
    href: "/admin/applications?filter=open",
  },
  {
    key: "pendingFollowups",
    title: "Pending Follow-ups",
    value: "342",
    change: "+2.1%",
    changeType: "increase" as const,
    period: "vs previous 30 days",
    subtext: "24 escalated",
    href: "/admin/applications?filter=followup",
  },
];

export interface TrendPoint {
  day: string;
  helpRequests: number;
  casesClosed: number;
  newRegistrations: number;
  eligibilityMatches: number;
  avgResponseHrs: number;
  prevHelpRequests: number;
}

export const serviceTrendData: TrendPoint[] = [
  { day: "Sep 06", helpRequests: 320, casesClosed: 280, newRegistrations: 210, eligibilityMatches: 1400, avgResponseHrs: 16.2, prevHelpRequests: 290 },
  { day: "Sep 09", helpRequests: 380, casesClosed: 340, newRegistrations: 240, eligibilityMatches: 1580, avgResponseHrs: 15.8, prevHelpRequests: 310 },
  { day: "Sep 12", helpRequests: 410, casesClosed: 390, newRegistrations: 290, eligibilityMatches: 1720, avgResponseHrs: 14.9, prevHelpRequests: 340 },
  { day: "Sep 15", helpRequests: 390, casesClosed: 370, newRegistrations: 270, eligibilityMatches: 1650, avgResponseHrs: 14.5, prevHelpRequests: 350 },
  { day: "Sep 18", helpRequests: 450, casesClosed: 420, newRegistrations: 310, eligibilityMatches: 1890, avgResponseHrs: 14.1, prevHelpRequests: 380 },
  { day: "Sep 21", helpRequests: 480, casesClosed: 460, newRegistrations: 330, eligibilityMatches: 1980, avgResponseHrs: 13.8, prevHelpRequests: 400 },
  { day: "Sep 24", helpRequests: 520, casesClosed: 490, newRegistrations: 360, eligibilityMatches: 2150, avgResponseHrs: 13.5, prevHelpRequests: 420 },
  { day: "Sep 27", helpRequests: 490, casesClosed: 470, newRegistrations: 340, eligibilityMatches: 2020, avgResponseHrs: 13.9, prevHelpRequests: 410 },
  { day: "Sep 30", helpRequests: 540, casesClosed: 510, newRegistrations: 380, eligibilityMatches: 2280, avgResponseHrs: 13.2, prevHelpRequests: 440 },
  { day: "Oct 03", helpRequests: 580, casesClosed: 550, newRegistrations: 410, eligibilityMatches: 2450, avgResponseHrs: 12.8, prevHelpRequests: 460 },
  { day: "Oct 05", helpRequests: 610, casesClosed: 580, newRegistrations: 430, eligibilityMatches: 2580, avgResponseHrs: 12.4, prevHelpRequests: 490 },
];

import { calculatePercentage, calculateResolutionRate } from "@/utils/analyticsUtils";

export const caseStatusDistribution = [
  { status: "New", count: 320, color: "bg-blue-500", href: "/admin/applications?status=NEW" },
  { status: "Assigned", count: 240, color: "bg-indigo-500", href: "/admin/applications?status=ASSIGNED" },
  { status: "In Progress", count: 480, color: "bg-primary", href: "/admin/applications?status=IN_PROGRESS" },
  { status: "Pending Follow-up", count: 342, color: "bg-amber-500", href: "/admin/applications?status=PENDING_FOLLOWUP" },
  { status: "Escalated", count: 68, color: "bg-destructive", href: "/admin/applications?status=ESCALATED" },
  { status: "Resolved", count: 214, color: "bg-emerald-500", href: "/admin/applications?status=RESOLVED" },
  { status: "Closed", count: 220, color: "bg-slate-400", href: "/admin/applications?status=CLOSED" },
].map((item, _, arr) => {
  const totalCount = arr.reduce((acc, curr) => acc + curr.count, 0);
  return {
    ...item,
    percent: Math.round(calculatePercentage(item.count, totalCount)),
  };
});

export const caseAgeingBreakdown = [
  { label: "Under 24 hours", count: 1120, status: "Normal", color: "bg-emerald-500", href: "/admin/applications?ageing=24h" },
  { label: "1–2 days", count: 450, status: "Normal", color: "bg-blue-500", href: "/admin/applications?ageing=48h" },
  { label: "3–7 days", count: 246, status: "Warning", color: "bg-amber-500", href: "/admin/applications?ageing=7d" },
  { label: "7+ days", count: 68, status: "Critical", color: "bg-destructive", href: "/admin/applications?ageing=over7d" },
].map((item, _, arr) => {
  const totalCount = arr.reduce((acc, curr) => acc + curr.count, 0);
  return {
    ...item,
    percent: Math.round(calculatePercentage(item.count, totalCount)),
  };
});

export interface OrgPerformanceRow {
  id: string;
  unit: string;
  level: OrgLevel;
  parentId?: string;
  total: number;
  open: number;
  closed: number;
  pendingFollowup: number;
  overdue: number;
  avgResponse: string;
  resolutionRate: string;
  hasChildren: boolean;
}

export const orgPerformanceData: OrgPerformanceRow[] = [
  // Level: REGION (Parent: STATE-KL / Root)
  { id: "reg-south", unit: "South Region", level: "REGION", parentId: "STATE-KL", total: 11200, open: 1040, closed: 9480, pendingFollowup: 240, overdue: 38, avgResponse: "12.2h", resolutionRate: "96.2%", hasChildren: true },
  { id: "reg-central", unit: "Central Region", level: "REGION", parentId: "STATE-KL", total: 10100, open: 980, closed: 8520, pendingFollowup: 210, overdue: 42, avgResponse: "13.1h", resolutionRate: "95.5%", hasChildren: true },
  { id: "reg-north", unit: "North Region", level: "REGION", parentId: "STATE-KL", total: 9450, open: 920, closed: 8010, pendingFollowup: 190, overdue: 56, avgResponse: "15.4h", resolutionRate: "93.8%", hasChildren: true },

  // Level: DISTRICT - South Region (parentId: reg-south)
  { id: "dist-tvm", unit: "Thiruvananthapuram", level: "DISTRICT", parentId: "reg-south", total: 4250, open: 420, closed: 3580, pendingFollowup: 98, overdue: 18, avgResponse: "11.8h", resolutionRate: "96.4%", hasChildren: true },
  { id: "dist-klm", unit: "Kollam", level: "DISTRICT", parentId: "reg-south", total: 2850, open: 380, closed: 2420, pendingFollowup: 68, overdue: 21, avgResponse: "12.5h", resolutionRate: "95.9%", hasChildren: true },
  { id: "dist-pta", unit: "Pathanamthitta", level: "DISTRICT", parentId: "reg-south", total: 2210, open: 310, closed: 1860, pendingFollowup: 52, overdue: 25, avgResponse: "14.1h", resolutionRate: "94.8%", hasChildren: true },
  { id: "dist-alp", unit: "Alappuzha", level: "DISTRICT", parentId: "reg-south", total: 1890, open: 295, closed: 1620, pendingFollowup: 48, overdue: 29, avgResponse: "15.0h", resolutionRate: "94.2%", hasChildren: true },

  // Level: DISTRICT - Central Region (parentId: reg-central)
  { id: "dist-ekm", unit: "Ernakulam", level: "DISTRICT", parentId: "reg-central", total: 3890, open: 390, closed: 3290, pendingFollowup: 84, overdue: 14, avgResponse: "12.1h", resolutionRate: "96.5%", hasChildren: true },
  { id: "dist-tsr", unit: "Thrissur", level: "DISTRICT", parentId: "reg-central", total: 2420, open: 210, closed: 2090, pendingFollowup: 45, overdue: 8, avgResponse: "13.2h", resolutionRate: "96.8%", hasChildren: true },
  { id: "dist-ktm", unit: "Kottayam", level: "DISTRICT", parentId: "reg-central", total: 2100, open: 200, closed: 1820, pendingFollowup: 39, overdue: 11, avgResponse: "13.8h", resolutionRate: "95.8%", hasChildren: true },
  { id: "dist-idk", unit: "Idukki", level: "DISTRICT", parentId: "reg-central", total: 1690, open: 180, closed: 1420, pendingFollowup: 42, overdue: 19, avgResponse: "14.5h", resolutionRate: "94.9%", hasChildren: true },

  // Level: DISTRICT - North Region (parentId: reg-north)
  { id: "dist-clt", unit: "Kozhikode", level: "DISTRICT", parentId: "reg-north", total: 2950, open: 280, closed: 2510, pendingFollowup: 62, overdue: 18, avgResponse: "14.8h", resolutionRate: "95.1%", hasChildren: true },
  { id: "dist-pkd", unit: "Palakkad", level: "DISTRICT", parentId: "reg-north", total: 2450, open: 270, closed: 2100, pendingFollowup: 58, overdue: 24, avgResponse: "15.8h", resolutionRate: "93.9%", hasChildren: true },
  { id: "dist-mlp", unit: "Malappuram", level: "DISTRICT", parentId: "reg-north", total: 2150, open: 220, closed: 1850, pendingFollowup: 44, overdue: 19, avgResponse: "15.2h", resolutionRate: "94.1%", hasChildren: true },
  { id: "dist-knr", unit: "Kannur", level: "DISTRICT", parentId: "reg-north", total: 1850, open: 150, closed: 1550, pendingFollowup: 26, overdue: 9, avgResponse: "13.9h", resolutionRate: "96.1%", hasChildren: true },

  // Level: MANDALAM - Thiruvananthapuram District (parentId: dist-tvm)
  { id: "man-tvm-c", unit: "TVM Central Mandalam", level: "MANDALAM", parentId: "dist-tvm", total: 1420, open: 94, closed: 1280, pendingFollowup: 28, overdue: 4, avgResponse: "10.8h", resolutionRate: "97.1%", hasChildren: true },
  { id: "man-kazh", unit: "Kazhakkoottam Mandalam", level: "MANDALAM", parentId: "dist-tvm", total: 1240, open: 82, closed: 1080, pendingFollowup: 22, overdue: 6, avgResponse: "11.9h", resolutionRate: "96.2%", hasChildren: true },
  { id: "man-neyy", unit: "Neyyattinkara Mandalam", level: "MANDALAM", parentId: "dist-tvm", total: 980, open: 78, closed: 840, pendingFollowup: 19, overdue: 9, avgResponse: "13.6h", resolutionRate: "94.9%", hasChildren: true },
  { id: "man-att", unit: "Attingal Mandalam", level: "MANDALAM", parentId: "dist-tvm", total: 860, open: 70, closed: 720, pendingFollowup: 16, overdue: 12, avgResponse: "15.1h", resolutionRate: "93.8%", hasChildren: true },
  { id: "man-vat", unit: "Vattiyoorkavu Mandalam", level: "MANDALAM", parentId: "dist-tvm", total: 750, open: 55, closed: 660, pendingFollowup: 13, overdue: 5, avgResponse: "12.0h", resolutionRate: "96.5%", hasChildren: true },

  // Level: MANDALAM - Kollam District (parentId: dist-klm)
  { id: "man-klm-c", unit: "Kollam Town Mandalam", level: "MANDALAM", parentId: "dist-klm", total: 1100, open: 120, closed: 920, pendingFollowup: 30, overdue: 8, avgResponse: "12.0h", resolutionRate: "95.5%", hasChildren: true },
  { id: "man-kottarakara", unit: "Kottarakkara Mandalam", level: "MANDALAM", parentId: "dist-klm", total: 950, open: 140, closed: 780, pendingFollowup: 22, overdue: 7, avgResponse: "12.8h", resolutionRate: "96.0%", hasChildren: true },
  { id: "man-karunagappally", unit: "Karunagappally Mandalam", level: "MANDALAM", parentId: "dist-klm", total: 800, open: 120, closed: 650, pendingFollowup: 16, overdue: 6, avgResponse: "13.1h", resolutionRate: "95.8%", hasChildren: true },

  // Level: MANDALAM - Ernakulam District (parentId: dist-ekm)
  { id: "man-maradu", unit: "Tripunithura / Maradu", level: "MANDALAM", parentId: "dist-ekm", total: 1150, open: 75, closed: 1020, pendingFollowup: 20, overdue: 3, avgResponse: "10.9h", resolutionRate: "97.4%", hasChildren: true },
  { id: "man-ekm-c", unit: "Ernakulam Central", level: "MANDALAM", parentId: "dist-ekm", total: 1020, open: 80, closed: 900, pendingFollowup: 18, overdue: 5, avgResponse: "11.5h", resolutionRate: "96.9%", hasChildren: true },
  { id: "man-aluva", unit: "Aluva Mandalam", level: "MANDALAM", parentId: "dist-ekm", total: 920, open: 85, closed: 790, pendingFollowup: 22, overdue: 8, avgResponse: "13.2h", resolutionRate: "95.2%", hasChildren: true },

  // Level: MANDALAM - Kozhikode District (parentId: dist-clt)
  { id: "man-clt-north", unit: "Kozhikode North Mandalam", level: "MANDALAM", parentId: "dist-clt", total: 1100, open: 95, closed: 960, pendingFollowup: 24, overdue: 5, avgResponse: "14.2h", resolutionRate: "95.8%", hasChildren: true },
  { id: "man-clt-south", unit: "Kozhikode South Mandalam", level: "MANDALAM", parentId: "dist-clt", total: 1050, open: 105, closed: 910, pendingFollowup: 22, overdue: 7, avgResponse: "14.9h", resolutionRate: "94.8%", hasChildren: true },
  { id: "man-vadakara", unit: "Vadakara Mandalam", level: "MANDALAM", parentId: "dist-clt", total: 800, open: 80, closed: 640, pendingFollowup: 16, overdue: 6, avgResponse: "15.1h", resolutionRate: "94.2%", hasChildren: true },

  // Level: MANDALAM - Palakkad District (parentId: dist-pkd)
  { id: "man-pkd-t", unit: "Palakkad Town Mandalam", level: "MANDALAM", parentId: "dist-pkd", total: 980, open: 110, closed: 820, pendingFollowup: 25, overdue: 10, avgResponse: "15.2h", resolutionRate: "94.5%", hasChildren: true },
  { id: "man-chittur", unit: "Chittur Mandalam", level: "MANDALAM", parentId: "dist-pkd", total: 820, open: 90, closed: 700, pendingFollowup: 20, overdue: 8, avgResponse: "16.1h", resolutionRate: "93.2%", hasChildren: true },

  // Level: MANDALAM - Malappuram District (parentId: dist-mlp)
  { id: "man-mlp-t", unit: "Malappuram Mandalam", level: "MANDALAM", parentId: "dist-mlp", total: 950, open: 100, closed: 810, pendingFollowup: 21, overdue: 9, avgResponse: "14.8h", resolutionRate: "94.6%", hasChildren: true },
  { id: "man-manjeri", unit: "Manjeri Mandalam", level: "MANDALAM", parentId: "dist-mlp", total: 720, open: 70, closed: 620, pendingFollowup: 14, overdue: 6, avgResponse: "15.5h", resolutionRate: "93.8%", hasChildren: true },

  // Level: AREA - Kazhakkoottam Mandalam (parentId: man-kazh)
  { id: "area-kazh-n", unit: "Kazhakkoottam North Area", level: "AREA", parentId: "man-kazh", total: 420, open: 24, closed: 380, pendingFollowup: 6, overdue: 1, avgResponse: "9.2h", resolutionRate: "98.2%", hasChildren: true },
  { id: "area-kazh-s", unit: "Kazhakkoottam South Area", level: "AREA", parentId: "man-kazh", total: 380, open: 28, closed: 335, pendingFollowup: 8, overdue: 2, avgResponse: "11.1h", resolutionRate: "96.8%", hasChildren: true },
  { id: "area-techno", unit: "Technopark / Kariavattom", level: "AREA", parentId: "man-kazh", total: 440, open: 30, closed: 395, pendingFollowup: 8, overdue: 3, avgResponse: "12.4h", resolutionRate: "95.9%", hasChildren: true },

  // Level: AREA - TVM Central Mandalam (parentId: man-tvm-c)
  { id: "area-statue", unit: "Statue / Secretariat Area", level: "AREA", parentId: "man-tvm-c", total: 510, open: 32, closed: 460, pendingFollowup: 10, overdue: 1, avgResponse: "9.5h", resolutionRate: "98.0%", hasChildren: true },
  { id: "area-palayam", unit: "Palayam / MG Road Area", level: "AREA", parentId: "man-tvm-c", total: 480, open: 34, closed: 430, pendingFollowup: 9, overdue: 2, avgResponse: "10.2h", resolutionRate: "97.5%", hasChildren: true },

  // Level: AREA - Maradu / Tripunithura Mandalam (parentId: man-maradu)
  { id: "area-maradu-e", unit: "Maradu East Area", level: "AREA", parentId: "man-maradu", total: 410, open: 25, closed: 370, pendingFollowup: 8, overdue: 1, avgResponse: "10.1h", resolutionRate: "97.8%", hasChildren: true },
  { id: "area-tripuni", unit: "Tripunithura Town Area", level: "AREA", parentId: "man-maradu", total: 450, open: 28, closed: 405, pendingFollowup: 7, overdue: 1, avgResponse: "10.5h", resolutionRate: "97.2%", hasChildren: true },

  // Level: BOOTH - Kazhakkoottam North Area (parentId: area-kazh-n)
  { id: "booth-142", unit: "Booth 142 - Kazhakkoottam Govt HS", level: "BOOTH", parentId: "area-kazh-n", total: 180, open: 8, closed: 165, pendingFollowup: 2, overdue: 0, avgResponse: "7.8h", resolutionRate: "99.0%", hasChildren: false },
  { id: "booth-143", unit: "Booth 143 - KSEB Substation Hall", level: "BOOTH", parentId: "area-kazh-n", total: 140, open: 9, closed: 125, pendingFollowup: 2, overdue: 0, avgResponse: "8.4h", resolutionRate: "98.5%", hasChildren: false },
  { id: "booth-144", unit: "Booth 144 - Menamkulam Primary School", level: "BOOTH", parentId: "area-kazh-n", total: 100, open: 7, closed: 90, pendingFollowup: 2, overdue: 1, avgResponse: "10.2h", resolutionRate: "96.8%", hasChildren: false },

  // Level: BOOTH - Statue Area (parentId: area-statue)
  { id: "booth-101", unit: "Booth 101 - Govt Press School", level: "BOOTH", parentId: "area-statue", total: 190, open: 10, closed: 175, pendingFollowup: 3, overdue: 0, avgResponse: "8.1h", resolutionRate: "98.8%", hasChildren: false },
  { id: "booth-102", unit: "Booth 102 - SMSM Institute Hall", level: "BOOTH", parentId: "area-statue", total: 160, open: 11, closed: 145, pendingFollowup: 2, overdue: 0, avgResponse: "8.8h", resolutionRate: "98.2%", hasChildren: false },

  // Level: BOOTH - Maradu East Area (parentId: area-maradu-e)
  { id: "booth-088", unit: "Booth 88 - Maradu St. Thomas School", level: "BOOTH", parentId: "area-maradu-e", total: 175, open: 9, closed: 160, pendingFollowup: 3, overdue: 0, avgResponse: "8.6h", resolutionRate: "98.4%", hasChildren: false },
].map((row) => {
  const activeTotal = row.closed + row.open;
  const rate = calculatePercentage(row.closed, activeTotal > 0 ? activeTotal : row.total);
  return {
    ...row,
    level: row.level as OrgLevel,
    resolutionRate: `${rate}%`,
  };
});
