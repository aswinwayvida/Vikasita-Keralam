import { useState, useMemo, useRef } from "react";
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  List,
  Network,
  Landmark,
  Eye,
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
  orgLevel:
    | "State"
    | "Region"
    | "Revenue District"
    | "Organisational District"
    | "Mandalam"
    | "Area"
    | "Booth";
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
  level:
    | "State"
    | "Region"
    | "Revenue District"
    | "Organisational District"
    | "Mandalam"
    | "Area"
    | "Booth";
  code: string;
  unitCountLabel?: string;
  officeBearers: OrgUserCard[];
  vacantDesignations?: { designationEn: string; designationMl: string }[];
  children?: OrgHierarchyNode[];
}

// Complete 6-Level Hierarchical Structure: State -> 3 Regions -> 14 Revenue Districts -> 30 Organisational Districts -> 140 Mandalams -> Areas -> Booths
const COMPLETE_ORG_HIERARCHY: OrgHierarchyNode = {
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
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      mobile: "+91 98470 12345",
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
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      mobile: "+91 98470 23456",
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
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      mobile: "+91 98470 34567",
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
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      mobile: "+91 98470 45678",
    },
  ],
  vacantDesignations: [
    { designationEn: "General Secretary (Organisation)", designationMl: "ജനറൽ സെക്രട്ടറി (സംഘടന)" },
    { designationEn: "Treasurer", designationMl: "ട്രഷറർ" },
  ],
  children: [
    // 1. NORTHERN REGION (5 Rev Dist, 10 Org Dist, 48 Mandalams)
    {
      id: "REG-NORTH",
      nameEn: "Northern Region",
      nameMl: "വടക്കൻ മേഖല",
      level: "Region",
      code: "REG-N",
      unitCountLabel: "5 Rev Dist • 10 Org Dist • 48 Mandalams",
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
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          status: "Active",
        },
      ],
      children: [
        {
          id: "REV-KASARAGOD",
          nameEn: "Kasaragod Revenue District",
          nameMl: "കാസർഗോഡ് റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-KSD",
          unitCountLabel: "1 Org Dist • 5 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-KASARAGOD",
              nameEn: "Kasaragod",
              nameMl: "കാസർഗോഡ്",
              level: "Organisational District",
              code: "OD-KSD",
              unitCountLabel: "5 Mandalams",
              officeBearers: [
                {
                  id: "USR-KSD-01",
                  nameEn: "K. Balakrishnan",
                  nameMl: "കെ. ബാലകൃഷ്ണൻ",
                  designationEn: "President",
                  designationMl: "ജില്ലാ പ്രസിഡന്റ്",
                  orgLevel: "Organisational District",
                  locationEn: "Kasaragod",
                  locationMl: "കാസർഗോഡ്",
                  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
                  status: "Active",
                },
              ],
              children: [
                {
                  id: "MAND-MANJESHWARAM",
                  nameEn: "Manjeshwaram",
                  nameMl: "മഞ്ചേശ്വരം",
                  level: "Mandalam",
                  code: "MND-001",
                  officeBearers: [],
                },
                {
                  id: "MAND-KASARAGOD",
                  nameEn: "Kasaragod Mandalam",
                  nameMl: "കാസർഗോഡ് മണ്ഡലം",
                  level: "Mandalam",
                  code: "MND-002",
                  officeBearers: [],
                },
              ],
            },
          ],
        },
        {
          id: "REV-KANNUR",
          nameEn: "Kannur Revenue District",
          nameMl: "കണ്ണൂർ റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-KNR",
          unitCountLabel: "2 Org Dist • 11 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-KNR-NORTH",
              nameEn: "Kannur North",
              nameMl: "കണ്ണൂർ നോർത്ത്",
              level: "Organisational District",
              code: "OD-KNR-N",
              officeBearers: [],
            },
            {
              id: "DIST-KNR-SOUTH",
              nameEn: "Kannur South",
              nameMl: "കണ്ണൂർ സൗത്ത്",
              level: "Organisational District",
              code: "OD-KNR-S",
              officeBearers: [],
            },
          ],
        },
        {
          id: "REV-WAYANAD",
          nameEn: "Wayanad Revenue District",
          nameMl: "വയനാട് റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-WYD",
          unitCountLabel: "1 Org Dist • 3 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-WAYANAD",
              nameEn: "Wayanad",
              nameMl: "വയനാട്",
              level: "Organisational District",
              code: "OD-WYD",
              officeBearers: [],
            },
          ],
        },
        {
          id: "REV-KOZHIKODE",
          nameEn: "Kozhikode Revenue District",
          nameMl: "കോഴിക്കോട് റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-KKD",
          unitCountLabel: "3 Org Dist • 13 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-KKD-CITY",
              nameEn: "Kozhikode City",
              nameMl: "കോഴിക്കോട് സിറ്റി",
              level: "Organisational District",
              code: "OD-KKD-C",
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
                  avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
                  status: "Active",
                },
              ],
              vacantDesignations: [
                { designationEn: "President", designationMl: "ജില്ലാ പ്രസിഡന്റ്" },
              ],
            },
            {
              id: "DIST-KKD-NORTH",
              nameEn: "Kozhikode North",
              nameMl: "കോഴിക്കോട് നോർത്ത്",
              level: "Organisational District",
              code: "OD-KKD-N",
              officeBearers: [],
            },
            {
              id: "DIST-KKD-RURAL",
              nameEn: "Kozhikode Rural",
              nameMl: "കോഴിക്കോട് റൂറൽ",
              level: "Organisational District",
              code: "OD-KKD-R",
              officeBearers: [],
            },
          ],
        },
        {
          id: "REV-MALAPPURAM",
          nameEn: "Malappuram Revenue District",
          nameMl: "മലപ്പുറം റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-MLP",
          unitCountLabel: "3 Org Dist • 16 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-MLP-CENTRAL",
              nameEn: "Malappuram Central",
              nameMl: "മലപ്പുറം സെൻട്രൽ",
              level: "Organisational District",
              code: "OD-MLP-C",
              officeBearers: [],
            },
            {
              id: "DIST-MLP-EAST",
              nameEn: "Malappuram East",
              nameMl: "മലപ്പുറം ഈസ്റ്റ്",
              level: "Organisational District",
              code: "OD-MLP-E",
              officeBearers: [],
            },
            {
              id: "DIST-MLP-WEST",
              nameEn: "Malappuram West",
              nameMl: "മലപ്പുറം വെസ്റ്റ്",
              level: "Organisational District",
              code: "OD-MLP-W",
              officeBearers: [],
            },
          ],
        },
      ],
    },

    // 2. CENTRAL REGION (5 Rev Dist, 12 Org Dist, 53 Mandalams)
    {
      id: "REG-CENTRAL",
      nameEn: "Central Region",
      nameMl: "മധ്യ മേഖല",
      level: "Region",
      code: "REG-C",
      unitCountLabel: "5 Rev Dist • 12 Org Dist • 53 Mandalams",
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
          avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
          status: "Active",
        },
      ],
      children: [
        {
          id: "REV-PALAKKAD",
          nameEn: "Palakkad Revenue District",
          nameMl: "പാലക്കാട് റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-PKD",
          unitCountLabel: "2 Org Dist • 12 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-PKD-EAST",
              nameEn: "Palakkad East",
              nameMl: "പാലക്കാട് ഈസ്റ്റ്",
              level: "Organisational District",
              code: "OD-PKD-E",
              officeBearers: [],
            },
            {
              id: "DIST-PKD-WEST",
              nameEn: "Palakkad West",
              nameMl: "പാലക്കാട് വെസ്റ്റ്",
              level: "Organisational District",
              code: "OD-PKD-W",
              officeBearers: [],
            },
          ],
        },
        {
          id: "REV-THRISSUR",
          nameEn: "Thrissur Revenue District",
          nameMl: "തൃശ്ശൂർ റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-TSR",
          unitCountLabel: "3 Org Dist • 13 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-TSR-CITY",
              nameEn: "Thrissur City",
              nameMl: "തൃശ്ശൂർ സിറ്റി",
              level: "Organisational District",
              code: "OD-TSR-C",
              officeBearers: [],
            },
            {
              id: "DIST-TSR-NORTH",
              nameEn: "Thrissur North",
              nameMl: "തൃശ്ശൂർ നോർത്ത്",
              level: "Organisational District",
              code: "OD-TSR-N",
              officeBearers: [],
            },
            {
              id: "DIST-TSR-SOUTH",
              nameEn: "Thrissur South",
              nameMl: "തൃശ്ശൂർ സൗത്ത്",
              level: "Organisational District",
              code: "OD-TSR-S",
              officeBearers: [],
            },
          ],
        },
        {
          id: "REV-ERNAKULAM",
          nameEn: "Ernakulam Revenue District",
          nameMl: "എറണാകുളം റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-EKM",
          unitCountLabel: "3 Org Dist • 14 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-EKM-CITY",
              nameEn: "Ernakulam City",
              nameMl: "എറണാകുളം സിറ്റി",
              level: "Organisational District",
              code: "OD-EKM-C",
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
                  avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
                  status: "Active",
                },
              ],
              children: [
                {
                  id: "MAND-THRISSUR",
                  nameEn: "Thrissur Mandalam",
                  nameMl: "തൃശ്ശൂർ മണ്ഡലം",
                  level: "Mandalam",
                  code: "MND-065",
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
                      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                      status: "Active",
                    },
                  ],
                },
              ],
            },
            {
              id: "DIST-EKM-NORTH",
              nameEn: "Ernakulam North",
              nameMl: "എറണാകുളം നോർത്ത്",
              level: "Organisational District",
              code: "OD-EKM-N",
              officeBearers: [],
            },
            {
              id: "DIST-EKM-EAST",
              nameEn: "Ernakulam East",
              nameMl: "എറണാകുളം ഈസ്റ്റ്",
              level: "Organisational District",
              code: "OD-EKM-E",
              officeBearers: [],
            },
          ],
        },
        {
          id: "REV-KOTTAYAM",
          nameEn: "Kottayam Revenue District",
          nameMl: "കോട്ടയം റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-KTM",
          unitCountLabel: "2 Org Dist • 9 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-KTM-EAST",
              nameEn: "Kottayam East",
              nameMl: "കോട്ടയം ഈസ്റ്റ്",
              level: "Organisational District",
              code: "OD-KTM-E",
              officeBearers: [],
            },
            {
              id: "DIST-KTM-WEST",
              nameEn: "Kottayam West",
              nameMl: "കോട്ടയം വെസ്റ്റ്",
              level: "Organisational District",
              code: "OD-KTM-W",
              officeBearers: [],
            },
          ],
        },
        {
          id: "REV-IDUKKI",
          nameEn: "Idukki Revenue District",
          nameMl: "ഇടുക്കി റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-IDK",
          unitCountLabel: "2 Org Dist • 5 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-IDK-NORTH",
              nameEn: "Idukki North",
              nameMl: "ഇടുക്കി നോർത്ത്",
              level: "Organisational District",
              code: "OD-IDK-N",
              officeBearers: [],
            },
            {
              id: "DIST-IDK-SOUTH",
              nameEn: "Idukki South",
              nameMl: "ഇടുക്കി സൗത്ത്",
              level: "Organisational District",
              code: "OD-IDK-S",
              officeBearers: [],
            },
          ],
        },
      ],
    },

    // 3. SOUTHERN REGION (4 Rev Dist, 8 Org Dist, 39 Mandalams)
    {
      id: "REG-SOUTH",
      nameEn: "Southern Region",
      nameMl: "തെക്കൻ മേഖല",
      level: "Region",
      code: "REG-S",
      unitCountLabel: "4 Rev Dist • 8 Org Dist • 39 Mandalams",
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
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          status: "Active",
        },
      ],
      children: [
        {
          id: "REV-ALAPPUZHA",
          nameEn: "Alappuzha Revenue District",
          nameMl: "ആലപ്പുഴ റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-ALP",
          unitCountLabel: "2 Org Dist • 9 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-ALP-NORTH",
              nameEn: "Alappuzha North",
              nameMl: "ആലപ്പുഴ നോർത്ത്",
              level: "Organisational District",
              code: "OD-ALP-N",
              officeBearers: [],
            },
            {
              id: "DIST-ALP-SOUTH",
              nameEn: "Alappuzha South",
              nameMl: "ആലപ്പുഴ സൗത്ത്",
              level: "Organisational District",
              code: "OD-ALP-S",
              officeBearers: [],
            },
          ],
        },
        {
          id: "REV-PATHANAMTHITTA",
          nameEn: "Pathanamthitta Revenue District",
          nameMl: "പത്തനംതിട്ട റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-PTA",
          unitCountLabel: "1 Org Dist • 5 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-PATHANAMTHITTA",
              nameEn: "Pathanamthitta",
              nameMl: "പത്തനംതിട്ട",
              level: "Organisational District",
              code: "OD-PTA",
              officeBearers: [],
            },
          ],
        },
        {
          id: "REV-KOLLAM",
          nameEn: "Kollam Revenue District",
          nameMl: "കൊല്ലം റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-KLM",
          unitCountLabel: "2 Org Dist • 11 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-KLM-EAST",
              nameEn: "Kollam East",
              nameMl: "കൊല്ലം ഈസ്റ്റ്",
              level: "Organisational District",
              code: "OD-KLM-E",
              officeBearers: [],
            },
            {
              id: "DIST-KLM-WEST",
              nameEn: "Kollam West",
              nameMl: "കൊല്ലം വെസ്റ്റ്",
              level: "Organisational District",
              code: "OD-KLM-W",
              officeBearers: [],
            },
          ],
        },
        {
          id: "REV-TVM",
          nameEn: "Thiruvananthapuram Revenue District",
          nameMl: "തിരുവനന്തപുരം റവന്യൂ ജില്ല",
          level: "Revenue District",
          code: "REV-TVM",
          unitCountLabel: "3 Org Dist • 14 Mandalams",
          officeBearers: [],
          children: [
            {
              id: "DIST-TVM-CITY",
              nameEn: "Thiruvananthapuram City",
              nameMl: "തിരുവനന്തപുരം സിറ്റി",
              level: "Organisational District",
              code: "OD-TVM-C",
              unitCountLabel: "4 Mandalams",
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
                  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
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
                  avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
                  status: "Active",
                },
              ],
              children: [
                {
                  id: "MAND-NEMOM",
                  nameEn: "Nemom Mandalam",
                  nameMl: "നേമം മണ്ഡലം",
                  level: "Mandalam",
                  code: "MND-139",
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
                      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
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
                      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                      status: "Active",
                    },
                  ],
                  children: [
                    {
                      id: "AREA-KARAMANA",
                      nameEn: "Karamana Area",
                      nameMl: "കരമന ഏരിയ",
                      level: "Area",
                      code: "AREA-001",
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
                          avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
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
                          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
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
                              avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
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
                              avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
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
                              avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
                              status: "Active",
                            },
                          ],
                          vacantDesignations: [
                            { designationEn: "Booth President", designationMl: "ബൂത്ത് പ്രസിഡന്റ്" },
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
                              avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
                              status: "Active",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "MAND-VATTIYOORKAVU",
                  nameEn: "Vattiyoorkavu Mandalam",
                  nameMl: "വട്ടിയൂർക്കാവ് മണ്ഡലം",
                  level: "Mandalam",
                  code: "MND-140",
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
                      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                      status: "Active",
                    },
                  ],
                  children: [
                    {
                      id: "AREA-PATTOM",
                      nameEn: "Pattom Area",
                      nameMl: "പട്ടം ഏരിയ",
                      level: "Area",
                      code: "AREA-002",
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
                          avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
                          status: "Active",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "DIST-TVM-NORTH",
              nameEn: "Thiruvananthapuram North",
              nameMl: "തിരുവനന്തപുരം നോർത്ത്",
              level: "Organisational District",
              code: "OD-TVM-N",
              officeBearers: [],
            },
            {
              id: "DIST-TVM-SOUTH",
              nameEn: "Thiruvananthapuram South",
              nameMl: "തിരുവനന്തപുരം സൗത്ത്",
              level: "Organisational District",
              code: "OD-TVM-S",
              officeBearers: [],
            },
          ],
        },
      ],
    },
  ],
};

const LEVEL_COLORS: Record<
  string,
  { bg: string; border: string; text: string; badge: string; icon: any; line: string }
> = {
  State: {
    bg: "bg-gradient-to-b from-amber-50 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/30",
    border: "border-orange-400 dark:border-orange-700",
    text: "text-orange-800 dark:text-orange-200",
    badge: "bg-orange-500 text-white font-bold",
    icon: Globe,
    line: "#f97316",
  },
  Region: {
    bg: "bg-gradient-to-b from-blue-50 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/30",
    border: "border-blue-400 dark:border-blue-700",
    text: "text-blue-800 dark:text-blue-200",
    badge: "bg-blue-600 text-white font-bold",
    icon: Layers,
    line: "#3b82f6",
  },
  "Revenue District": {
    bg: "bg-gradient-to-b from-slate-50 to-slate-100/90 dark:from-slate-900/60 dark:to-slate-900/40",
    border: "border-slate-300 dark:border-slate-700",
    text: "text-slate-800 dark:text-slate-200",
    badge: "bg-slate-700 text-white font-bold",
    icon: Landmark,
    line: "#64748b",
  },
  "Organisational District": {
    bg: "bg-gradient-to-b from-amber-50/90 to-yellow-50/70 dark:from-amber-950/30 dark:to-yellow-950/20",
    border: "border-amber-400 dark:border-amber-700",
    text: "text-amber-800 dark:text-amber-200",
    badge: "bg-amber-600 text-white font-bold",
    icon: Building2,
    line: "#d97706",
  },
  Mandalam: {
    bg: "bg-gradient-to-b from-emerald-50 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/30",
    border: "border-emerald-400 dark:border-emerald-700",
    text: "text-emerald-800 dark:text-emerald-200",
    badge: "bg-emerald-600 text-white font-bold",
    icon: MapPin,
    line: "#059669",
  },
  Area: {
    bg: "bg-gradient-to-b from-purple-50 to-purple-100/60 dark:from-purple-950/40 dark:to-purple-950/20",
    border: "border-purple-300 dark:border-purple-700",
    text: "text-purple-800 dark:text-purple-200",
    badge: "bg-purple-600 text-white font-bold",
    icon: Home,
    line: "#7c3aed",
  },
  Booth: {
    bg: "bg-gradient-to-b from-rose-50 to-pink-50/70 dark:from-rose-950/40 dark:to-pink-950/20",
    border: "border-rose-300 dark:border-rose-700",
    text: "text-rose-800 dark:text-rose-200",
    badge: "bg-rose-600 text-white font-bold",
    icon: Flag,
    line: "#e11d48",
  },
};

export function OrganisationalChart({ tr, lang, onEditLocation }: OrganisationalChartProps) {
  const isMalayalam = lang === "ml";
  const canvasRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [showVacant, setShowVacant] = useState(true);
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // State for expanded node collapse tracking
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "STATE-KL": true,
    "REG-SOUTH": true,
    "REG-CENTRAL": true,
    "REG-NORTH": true,
    "REV-TVM": true,
    "DIST-TVM-CITY": true,
    "MAND-NEMOM": true,
    "AREA-KARAMANA": true,
  });

  const [selectedNode, setSelectedNode] = useState<OrgHierarchyNode | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    const traverse = (node: OrgHierarchyNode) => {
      allIds[node.id] = true;
      if (node.children) node.children.forEach(traverse);
    };
    traverse(COMPLETE_ORG_HIERARCHY);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes({ "STATE-KL": true });
  };

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.15, 0.55));
  const handleResetZoom = () => setZoomScale(1.0);

  const handleExportChart = () => {
    window.print();
  };

  // Render recursive tree node card component for Tree View
  const renderTreeNode = (node: OrgHierarchyNode, depth = 0): React.ReactNode => {
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
        node.code.toLowerCase().includes(q) ||
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

    const childNodesToRender =
      node.children?.filter((c) => {
        if (
          regionFilter !== "ALL" &&
          c.level === "Region" &&
          c.id !== regionFilter
        ) {
          return false;
        }
        return true;
      }) || [];

    const hasChildren = childNodesToRender.length > 0;

    return (
      <div key={node.id} className="flex flex-col items-center shrink-0">
        {/* Organisation Unit Card */}
        <div
          className={cn(
            "w-[310px] sm:w-[340px] rounded-xl border-2 p-3.5 transition-all shadow-sm hover:shadow-md relative bg-card",
            styleConfig.bg,
            styleConfig.border
          )}
        >
          {/* Unit Level Tag and Code */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/60">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-2xs",
                  styleConfig.badge
                )}
              >
                <LevelIcon className="h-3.5 w-3.5" />
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-background/90 border border-border text-foreground truncate">
                {tr(node.level, node.level)}
              </span>
            </div>
            <span className="text-[10px] font-extrabold font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/80">
              {node.code}
            </span>
          </div>

          {/* Unit Name Title */}
          <h3 className="text-sm font-black text-foreground truncate mb-1">
            {isMalayalam ? node.nameMl : node.nameEn}
          </h3>

          {node.unitCountLabel && (
            <p className="text-[10.5px] font-semibold text-muted-foreground mb-2.5 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
              {node.unitCountLabel}
            </p>
          )}

          {/* Office Bearers User List */}
          <div className="space-y-1.5 mt-2">
            {node.officeBearers.length > 0 ? (
              node.officeBearers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-background/90 p-2 shadow-2xs hover:border-orange-400 transition-colors"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.nameEn}
                    className="h-8 w-8 rounded-full object-cover shrink-0 border border-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate leading-tight">
                      {isMalayalam ? user.nameMl : user.nameEn}
                    </p>
                    <p className="text-[10.5px] font-bold text-orange-600 dark:text-orange-400 truncate">
                      {isMalayalam ? user.designationMl : user.designationEn}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    {tr("Active", "സജീവം")}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border/80 p-2 text-center text-[11px] font-medium text-muted-foreground bg-muted/20">
                {tr("No direct office bearers assigned", "ഭാരവാഹികൾ നിയമിച്ചിട്ടില്ല")}
              </div>
            )}

            {/* Vacant slots */}
            {showVacant &&
              node.vacantDesignations?.map((vac, idx) => (
                <div
                  key={`vac-${idx}`}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 p-1.5 text-xs"
                >
                  <UserX className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 truncate">
                      {tr("Vacant", "ഒഴിവ്")} — {isMalayalam ? vac.designationMl : vac.designationEn}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Action Row: Details Popup & Expand Toggle */}
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-border/60">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setSelectedNode(node)}
              className="h-7 text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 px-2 cursor-pointer"
            >
              <Info className="h-3.5 w-3.5 mr-1" />
              {tr("Details", "വിവരങ്ങൾ")}
            </Button>

            {hasChildren && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => toggleExpand(node.id)}
                className="h-7 px-2.5 text-[11px] font-bold bg-background border-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer shrink-0"
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 mr-1" />
                    {tr("Collapse", "ചുരുക്കുക")} ({childNodesToRender.length})
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 mr-1" />
                    {tr("Expand", "വികസിപ്പിക്കുക")} ({childNodesToRender.length})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Connecting Lines & Children Horizontal Branch Layout */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col items-center w-full pt-1">
            {/* Top vertical connector from parent card */}
            <div className="w-0.5 h-6 bg-orange-400 dark:bg-orange-500" />

            {/* Horizontal branch line connecting children */}
            {childNodesToRender.length > 1 && (
              <div className="w-full flex justify-center px-4 relative">
                <div className="h-0.5 bg-orange-400 dark:bg-orange-500 w-[calc(100%-320px)] max-w-full" />
              </div>
            )}

            {/* Children Cards Row */}
            <div className="flex flex-wrap sm:flex-nowrap justify-center gap-6 pt-1 items-start">
              {childNodesToRender.map((childNode) => (
                <div key={childNode.id} className="flex flex-col items-center">
                  {/* Vertical line into child card */}
                  <div className="w-0.5 h-4 bg-orange-400 dark:bg-orange-500" />
                  {renderTreeNode(childNode, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render List / Directory view for alternative hierarchical navigation
  const renderListItem = (node: OrgHierarchyNode, depth = 0): React.ReactNode => {
    const isExpanded = Boolean(expandedNodes[node.id]);
    const styleConfig = LEVEL_COLORS[node.level] || LEVEL_COLORS["State"];

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={cn(
            "flex items-center justify-between p-2.5 rounded-lg border transition-all hover:bg-muted/50 cursor-pointer",
            styleConfig.bg,
            styleConfig.border,
            "ml-" + Math.min(depth * 4, 16)
          )}
          style={{ marginLeft: `${depth * 18}px` }}
          onClick={() => toggleExpand(node.id)}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {node.children && node.children.length > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}

            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold text-white", styleConfig.badge)}>
              {node.level}
            </span>

            <span className="font-bold text-xs text-foreground truncate">
              {isMalayalam ? node.nameMl : node.nameEn}
            </span>

            <span className="text-[10px] font-mono text-muted-foreground">({node.code})</span>

            {node.officeBearers.length > 0 && (
              <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                • {node.officeBearers.map((u) => u.nameEn).join(", ")}
              </span>
            )}
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNode(node);
            }}
            className="h-7 text-xs font-bold shrink-0 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            {tr("View", "കാണുക")}
          </Button>
        </div>

        {isExpanded && node.children && node.children.length > 0 && (
          <div className="space-y-1">
            {node.children.map((child) => renderListItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 sm:p-5 bg-background text-foreground">
      {/* Top Header Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-bold text-xs mb-1">
            <Globe className="h-4 w-4" />
            <span>{tr("State Unit", "സംസ്ഥാനം")}</span>
          </div>
          <p className="text-lg font-black text-foreground">1</p>
          <p className="text-[10.5px] text-muted-foreground">Kerala State</p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">
            <Layers className="h-4 w-4" />
            <span>{tr("Regions", "മേഖലകൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">3</p>
          <p className="text-[10.5px] text-muted-foreground">North, Central, South</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 dark:bg-slate-900/30 dark:border-slate-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold text-xs mb-1">
            <Landmark className="h-4 w-4" />
            <span>{tr("Revenue Dist", "റവന്യൂ ജില്ലകൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">14</p>
          <p className="text-[10.5px] text-muted-foreground">Revenue Districts</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs mb-1">
            <Building2 className="h-4 w-4" />
            <span>{tr("Org Districts", "സംഘടനാ ജില്ല")}</span>
          </div>
          <p className="text-lg font-black text-foreground">30</p>
          <p className="text-[10.5px] text-muted-foreground">Org Districts</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
            <MapPin className="h-4 w-4" />
            <span>{tr("Mandalams", "മണ്ഡലങ്ങൾ")}</span>
          </div>
          <p className="text-lg font-black text-foreground">140</p>
          <p className="text-[10.5px] text-muted-foreground">Assembly Mandalams</p>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-800 p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs mb-1">
            <Flag className="h-4 w-4" />
            <span>{tr("Areas & Booths", "ഏരിയ, ബൂത്ത്")}</span>
          </div>
          <p className="text-lg font-black text-foreground">2,100 / 25,000</p>
          <p className="text-[10.5px] text-muted-foreground">Areas & Booths</p>
        </div>
      </div>

      {/* Control Navigation Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
                viewMode === "tree"
                  ? "bg-orange-500 text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Network className="h-3.5 w-3.5" />
              {tr("Tree Canvas", "ട്രീ വ്യൂ")}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-orange-500 text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
              {tr("List Directory", "ലിസ്റ്റ് വ്യൂ")}
            </button>
          </div>

          {/* Region Filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-bold text-foreground focus:border-orange-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{tr("All 3 Regions", "എല്ലാ മേഖലകളും")}</option>
            <option value="REG-NORTH">{tr("Northern Region (10 Org Dist)", "വടക്കൻ മേഖല")}</option>
            <option value="REG-CENTRAL">{tr("Central Region (12 Org Dist)", "മധ്യ മേഖല")}</option>
            <option value="REG-SOUTH">{tr("Southern Region (8 Org Dist)", "തെക്കൻ മേഖല")}</option>
          </select>

          {/* Vacant Toggle */}
          <button
            type="button"
            onClick={() => setShowVacant(!showVacant)}
            className={cn(
              "h-8 rounded-lg px-2.5 text-xs font-bold border transition-colors cursor-pointer",
              showVacant
                ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {showVacant ? tr("Hide Vacant", "ഒഴിവുകൾ മറയ്ക്കുക") : tr("Show Vacant", "ഒഴിവുകൾ കാണിക്കുക")}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-52">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={tr("Search user, designation, location...", "തിരയുക...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Zoom controls for canvas */}
          {viewMode === "tree" && (
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
          )}

          {/* Expand/Collapse All */}
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
            onClick={handleExportChart}
            className="h-8 text-xs font-bold border-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            <span>{tr("Export", "പ്രിന്റ് / എക്സ്പോർട്ട്")}</span>
          </Button>
        </div>
      </div>

      {/* Main Organisational Canvas Container with subtle Dotted Pattern */}
      {viewMode === "tree" ? (
        <div
          ref={canvasRef}
          className="rounded-2xl border-2 border-border/80 bg-slate-50/50 dark:bg-slate-950/40 p-6 overflow-auto min-h-[600px] relative shadow-inner bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]"
        >
          <div
            className="inline-block min-w-full transition-transform duration-200 origin-top center py-4"
            style={{ transform: `scale(${zoomScale})` }}
          >
            <div className="flex justify-center">
              {renderTreeNode(COMPLETE_ORG_HIERARCHY)}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2 max-h-[650px] overflow-y-auto">
          {renderListItem(COMPLETE_ORG_HIERARCHY)}
        </div>
      )}

      {/* Unit Details Modal */}
      {selectedNode && (
        <Dialog open={Boolean(selectedNode)} onOpenChange={() => setSelectedNode(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-black text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  {selectedNode.code}
                </span>
                <DialogTitle className="text-base font-bold">
                  {isMalayalam ? selectedNode.nameMl : selectedNode.nameEn}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 border border-border/70">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tr("Organisation Level:", "ലെവൽ:")}</span>
                  <span className="font-extrabold text-foreground">{selectedNode.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tr("Office Bearers Count:", "ഭാരവാഹികളുടെ എണ്ണം:")}</span>
                  <span className="font-extrabold text-orange-600 dark:text-orange-400">
                    {selectedNode.officeBearers.length}
                  </span>
                </div>
                {selectedNode.unitCountLabel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tr("Sub-unit Summary:", "കീഴ്ഘടക വിവരം:")}</span>
                    <span className="font-semibold text-foreground">{selectedNode.unitCountLabel}</span>
                  </div>
                )}
              </div>

              {/* Office Bearers List */}
              <div className="space-y-2 border-t border-border pt-3">
                <h4 className="font-black text-foreground text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>{tr("Assigned Office Bearers", "നിയമിതരായ ഭാരവാഹികൾ")}</span>
                </h4>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedNode.officeBearers.length > 0 ? (
                    selectedNode.officeBearers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 shadow-2xs"
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
                          <p className="text-xs font-bold text-orange-600 dark:text-orange-400 truncate">
                            {isMalayalam ? user.designationMl : user.designationEn}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {isMalayalam ? user.locationMl : user.locationEn} • {user.mobile || "+91 98470 XXXXX"}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> {tr("Active", "സജീവം")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-2">
                      {tr("No office bearers assigned to this unit yet.", "ഭാരവാഹികൾ ഒന്നുമില്ല.")}
                    </p>
                  )}
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
                        <span className="font-bold text-foreground">
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
