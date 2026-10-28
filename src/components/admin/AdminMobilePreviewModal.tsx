import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Smartphone, Wifi, Battery, Signal, ChevronRight, ChevronLeft, ArrowLeft, Users, HeartHandshake, Database, Layers, Sparkles, MessageSquare, Clock3, UserCheck, LayoutDashboard, Sliders, Calendar, FileText, XCircle, CheckCircle2, Hourglass, MapPin, Trophy, AlertTriangle, Activity, Globe, Map, Network, Store, ShieldCheck, ChevronDown, Filter, Search, SearchCheck, Megaphone, CalendarDays, BellRing, Phone, RotateCcw, GraduationCap, Sprout, LayoutGrid, MoreVertical, AlertCircle, Star, Zap, Headphones, Edit, Upload, FileCheck, Loader2, SearchX, RefreshCw, Check, Lock, User, Eye, Send, Info, Plus, Inbox, FileSearch, HandCoins, UserRound, Paperclip, ClipboardList, Headset, Copy, Pencil, Download, FileImage, ExternalLink, CloudUpload } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import officialLotus from "@/assets/bjp-official-lotus.png";
import users3dIcon from "@/assets/kpi-3d/users.png";
import inReview3dIcon from "@/assets/kpi-3d/in-review.png";
import documentsPending3dIcon from "@/assets/kpi-3d/documents-pending.png";
import applications3dIcon from "@/assets/kpi-3d/applications.png";
import openApplication3dIcon from "@/assets/kpi-3d/open-application.png";
import submitted3dIcon from "@/assets/kpi-3d/submitted.png";
import readyToSubmit3dIcon from "@/assets/kpi-3d/ready-to-submit.png";
import assisted3dIcon from "@/assets/kpi-3d/assisted.png";
import pending3dIcon from "@/assets/kpi-3d/pending.png";
import followupsDue3dIcon from "@/assets/kpi-3d/followups-due.png";
import rejected3dIcon from "@/assets/kpi-3d/rejected.png";
import schemes3dIcon from "@/assets/kpi-3d/schemes.png";
import coveredBooth3dIcon from "@/assets/kpi-3d/covered-booth.png";
import sahaiAvatar from "@/assets/sahai-avatar-v3.png";
import { AdminMobileAppBottomNav, AdminMobileTab } from "./AdminMobileAppBottomNav";
import { AdminMobileAppHeader } from "./AdminMobileAppHeader";
import { MobileAuthFlow } from "./MobileAuthFlow";
import { MobileGuestEventsSection } from "./MobileGuestEventsSection";
import {
  MobileGuestEligibilityQuestionnaire,
  type GuestEligibilityAnswers,
} from "./MobileGuestEligibilityQuestionnaire";
import { schemes } from "@/data/schemes";
import { DatePickerModal } from "./DatePickerModal";
import { MobileUsersListTab } from "./MobileUsersListTab";
import { MobileAppliedFiltersScope, FilterChip } from "./MobileAppliedFiltersScope";
import { PartyFlagIcon } from "@/components/common/PartyFlagIcon";
import { districts, constituencies, panchayats, wards, getDistrictName, getConstituencyName, getWardsForLocalBody, getMappedConstituencyForWard, LocalBodyType, WardItem } from "@/data/geo";
import { LeaderboardTop3Podium } from "./LeaderboardTop3Podium";

interface AdminMobilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MobileSchemeFieldKey =
  | "bankAccountNumber"
  | "bankIfscCode"
  | "minorityStatus"
  | "disabilityStatus"
  | "studentStatus"
  | "bplStatus"
  | "residenceArea";

type MobileSchemeDocument = {
  id: string;
  labelEn: string;
  labelMl: string;
};

type MobileEligibleScheme = {
  id: string;
  titleEn: string;
  titleMl: string;
  benefitEn: string;
  benefitMl: string;
  matchLabelEn: string;
  matchLabelMl: string;
  deptEn: string;
  deptMl: string;
  categoryEn: string;
  categoryMl: string;
  requiredDocEn: string;
  requiredDocMl: string;
  requiredDocuments?: MobileSchemeDocument[];
  requiredFieldKeys: MobileSchemeFieldKey[];
};

type MobileMissingItem = {
  key: string;
  labelEn: string;
  labelMl: string;
  kind: "field" | "document";
};

type MobileCollectionStatus = "not_started" | "incomplete" | "complete" | "ready";

type PmKisanChoiceKey =
  | "ownsCultivableLand"
  | "landOwner"
  | "landRecorded"
  | "landAcquisitionMode"
  | "familyReceivesBenefit"
  | "institutionalLandholder";

type PmKisanCollectionDetails = {
  ownsCultivableLand: string;
  landOwner: string;
  landRecorded: string;
  landAcquiredDate: string;
  landAcquisitionNotSure: boolean;
  landAcquisitionMode: string;
  familyReceivesBenefit: string;
  institutionalLandholder: string;
};

type PmKisanQuestion =
  | {
      type: "choice";
      key: PmKisanChoiceKey;
      labelEn: string;
      labelMl: string;
      options: Array<{ value: string; labelEn: string; labelMl: string }>;
    }
  | {
      type: "date";
      key: "landAcquiredDate";
      labelEn: string;
      labelMl: string;
    };

const createEmptyPmKisanDetails = (): PmKisanCollectionDetails => ({
  ownsCultivableLand: "",
  landOwner: "",
  landRecorded: "",
  landAcquiredDate: "",
  landAcquisitionNotSure: false,
  landAcquisitionMode: "",
  familyReceivesBenefit: "",
  institutionalLandholder: "",
});

const pmKisanYesNoOptions = [
  { value: "yes", labelEn: "Yes", labelMl: "അതെ" },
  { value: "no", labelEn: "No", labelMl: "അല്ല" },
  { value: "not_sure", labelEn: "Not sure", labelMl: "ഉറപ്പില്ല" },
];

const pmKisanQuestions: PmKisanQuestion[] = [
  {
    type: "choice",
    key: "ownsCultivableLand",
    labelEn: "Does the farmer’s family own cultivable agricultural land?",
    labelMl: "കർഷക കുടുംബത്തിന് കൃഷിയോഗ്യമായ ഭൂമി ഉണ്ടോ?",
    options: pmKisanYesNoOptions,
  },
  {
    type: "choice",
    key: "landOwner",
    labelEn: "Who owns the land?",
    labelMl: "ഭൂമി ആരുടെ ഉടമസ്ഥതയിലാണ്?",
    options: [
      { value: "applicant", labelEn: "Applicant", labelMl: "അപേക്ഷകൻ" },
      { value: "spouse", labelEn: "Spouse", labelMl: "പങ്കാളി" },
      { value: "minor_child", labelEn: "Minor child", labelMl: "പ്രായപൂർത്തിയാകാത്ത കുട്ടി" },
      { value: "joint", labelEn: "Joint ownership", labelMl: "സംയുക്ത ഉടമസ്ഥത" },
      { value: "other", labelEn: "Other", labelMl: "മറ്റുള്ളവർ" },
      { value: "not_sure", labelEn: "Not sure", labelMl: "ഉറപ്പില്ല" },
    ],
  },
  {
    type: "choice",
    key: "landRecorded",
    labelEn: "Is the land recorded in the owner’s name?",
    labelMl: "ഭൂമി ഉടമയുടെ പേരിൽ രേഖപ്പെടുത്തിയിട്ടുണ്ടോ?",
    options: pmKisanYesNoOptions,
  },
  {
    type: "date",
    key: "landAcquiredDate",
    labelEn: "When was the land acquired?",
    labelMl: "ഭൂമി എപ്പോൾ സ്വന്തമാക്കി?",
  },
  {
    type: "choice",
    key: "landAcquisitionMode",
    labelEn: "How was the land acquired?",
    labelMl: "ഭൂമി എങ്ങനെയാണ് സ്വന്തമാക്കിയത്?",
    options: [
      { value: "inherited", labelEn: "Inherited", labelMl: "പാരമ്പര്യമായി ലഭിച്ചത്" },
      { value: "purchased", labelEn: "Purchased", labelMl: "വാങ്ങിയത്" },
      { value: "gifted", labelEn: "Gifted", labelMl: "സമ്മാനമായി ലഭിച്ചത്" },
      { value: "other", labelEn: "Other", labelMl: "മറ്റുള്ളവ" },
      { value: "not_sure", labelEn: "Not sure", labelMl: "ഉറപ്പില്ല" },
    ],
  },
  {
    type: "choice",
    key: "familyReceivesBenefit",
    labelEn: "Does anyone in the farmer’s family already receive PM-KISAN benefits?",
    labelMl: "കർഷക കുടുംബത്തിലെ ആർക്കെങ്കിലും ഇതിനകം പി.എം-കിസാൻ ആനുകൂല്യം ലഭിക്കുന്നുണ്ടോ?",
    options: pmKisanYesNoOptions,
  },
  {
    type: "choice",
    key: "institutionalLandholder",
    labelEn: "Is the land held by an institution?",
    labelMl: "ഭൂമി ഒരു സ്ഥാപനത്തിന്റെ കൈവശമാണോ?",
    options: pmKisanYesNoOptions,
  },
];

type MobileCollectionRecord = {
  reference: string;
  createdAt: string;
  applicantName: string;
  applicantLocationEn?: string;
  applicantLocationMl?: string;
  scheme: MobileEligibleScheme;
  status: MobileCollectionStatus;
  missingItems: MobileMissingItem[];
  followUpDate: string;
  followUpNotes: string;
  uploadedDocName: string;
  uploadedDocuments?: Record<string, string>;
  bankAccountNumber: string;
  bankIfscCode: string;
  minorityStatus: string;
  disabilityStatus: string;
  studentStatus: string;
  employmentStatus: string;
  bplStatus: string;
  financialHardshipStatus: string;
  annualFamilyIncome: string;
  residenceArea: string;
  pmKisanDetails?: PmKisanCollectionDetails;
  declarationAccepted: boolean;
  updatedAt: string;
};

type MobileCreateFlowStep =
  | "form"
  | "checking"
  | "eligibility_result"
  | "eligible_schemes"
  | "selected_schemes"
  | "scheme_details"
  | "collection_saved"
  | "follow_up_scheduled"
  | "collection_record"
  | "applicant_applications";

type MobileCollectionRecordReturnStep =
  | "form"
  | "collection_saved"
  | "follow_up_scheduled"
  | "needs_attention"
  | "selected_schemes"
  | "applicant_applications";

type MobileApplicationListStatus =
  | "application_received"
  | "document_verification_completed"
  | "applied"
  | "review"
  | "beneficiary"
  | "rejected"
  | "pending"
  | "assisted";

type MobileApplicationStatusFilter = "all" | MobileApplicationListStatus;

type MobileApplicationListVisibleStatus = Exclude<MobileApplicationListStatus, "pending" | "assisted">;

type MobileApplicationRecord = {
  ref: string;
  trackingId?: string;
  trackingUrl?: string;
  applicationPortalOpened?: boolean;
  schemeNameEn: string;
  schemeNameMl: string;
  categoryEn: string;
  categoryMl: string;
  status: "pending" | "in_review" | "approved" | "rejected" | "disbursed";
  applicantNameEn: string;
  applicantNameMl: string;
  aadhaar: string;
  phone: string;
  locationEn: string;
  locationMl: string;
  annualIncome: string;
  appliedDate: string;
  currentStep: number;
  pendingDocs: string[];
  nextActionEn: string;
  nextActionMl: string;
  auditLog: Array<{
    titleEn: string;
    titleMl: string;
    date: string;
    time?: string;
    actorEn?: string;
    actorMl?: string;
    notes?: string;
    status: "completed" | "current" | "upcoming";
  }>;
  workflowStatus?: MobileApplicationListStatus;
  decisionReason?: string;
  assistedByEn?: string;
  assistedByMl?: string;
};

type MobileApplicationRecordSeed = Omit<
  MobileApplicationRecord,
  "ref" | "status" | "currentStep" | "pendingDocs" | "nextActionEn" | "nextActionMl" | "auditLog" | "workflowStatus" | "decisionReason"
>;

const mobileApplicationRecordSeeds: MobileApplicationRecordSeed[] = [
  {
    schemeNameEn: "PM Kisan Samman Nidhi",
    schemeNameMl: "പിഎം-കിസാൻ സമ്മാൻ നിധി",
    categoryEn: "Agriculture",
    categoryMl: "കൃഷി",
    applicantNameEn: "K. Krishnan",
    applicantNameMl: "കെ. കൃഷ്ണൻ",
    aadhaar: "XXXX-XXXX-9001",
    phone: "+91 98463 87654",
    locationEn: "Palakkad North, Palakkad",
    locationMl: "പാലക്കാട് നോർത്ത്, പാലക്കാട്",
    annualIncome: "₹ 90,000",
    appliedDate: "18 Oct 2026",
    assistedByEn: "Anil Thomas",
    assistedByMl: "അനിൽ തോമസ്",
  },
  {
    schemeNameEn: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    schemeNameMl: "പ്രധാനമന്ത്രി ഫസൽ ബീമാ യോജന (PMFBY)",
    categoryEn: "Agriculture",
    categoryMl: "കൃഷി",
    applicantNameEn: "Muhammed Shafee",
    applicantNameMl: "മുഹമ്മദ് ഷാഫി",
    aadhaar: "XXXX-XXXX-9002",
    phone: "+91 97441 12389",
    locationEn: "Malappuram Central, Malappuram",
    locationMl: "മലപ്പുറം സെൻട്രൽ, മലപ്പുറം",
    annualIncome: "₹ 1,05,000",
    appliedDate: "17 Oct 2026",
    assistedByEn: "Suresh Kumar",
    assistedByMl: "സുരേഷ് കുമാർ",
  },
  {
    schemeNameEn: "Kisan Credit Card (KCC) Scheme",
    schemeNameMl: "കിസാൻ ക്രെഡിറ്റ് കാർഡ് (KCC) പദ്ധതി",
    categoryEn: "Agriculture Credit",
    categoryMl: "കാർഷിക വായ്പ",
    applicantNameEn: "Ravi Kumar",
    applicantNameMl: "രവി കുമാർ",
    aadhaar: "XXXX-XXXX-9003",
    phone: "+91 98950 44556",
    locationEn: "Ollur, Thrissur",
    locationMl: "ഒല്ലൂർ, തൃശൂർ",
    annualIncome: "₹ 1,30,000",
    appliedDate: "16 Oct 2026",
    assistedByEn: "Priya Menon",
    assistedByMl: "പ്രിയ മേനോൻ",
  },
  {
    schemeNameEn: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    schemeNameMl: "പ്രധാനമന്ത്രി ജൻ ധൻ യോജന (PMJDY)",
    categoryEn: "Banking",
    categoryMl: "ബാങ്കിംഗ്",
    applicantNameEn: "Sunitha Kumari",
    applicantNameMl: "സുനിത കുമാരി",
    aadhaar: "XXXX-XXXX-9004",
    phone: "+91 94462 54321",
    locationEn: "Kottayam East, Kottayam",
    locationMl: "കോട്ടയം ഈസ്റ്റ്, കോട്ടയം",
    annualIncome: "₹ 72,000",
    appliedDate: "15 Oct 2026",
    assistedByEn: "Maya Devi",
    assistedByMl: "മായാ ദേവി",
  },
  {
    schemeNameEn: "Atal Pension Yojana (APY)",
    schemeNameMl: "അടൽ പെൻഷൻ യോജന (APY)",
    categoryEn: "Banking & Pension",
    categoryMl: "ബാങ്കിംഗ് & പെൻഷൻ",
    applicantNameEn: "Devaki Amma",
    applicantNameMl: "ദേവകി അമ്മ",
    aadhaar: "XXXX-XXXX-9005",
    phone: "+91 94460 44556",
    locationEn: "Kannur Town, Kannur",
    locationMl: "കണ്ണൂർ ടൗൺ, കണ്ണൂർ",
    annualIncome: "₹ 58,000",
    appliedDate: "14 Oct 2026",
    assistedByEn: "Vineeth S.",
    assistedByMl: "വിനീത് എസ്.",
  },
  {
    schemeNameEn: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    schemeNameMl: "പ്രധാനമന്ത്രി ജീവൻ ജ്യോതി ബീമാ യോജന (PMJJBY)",
    categoryEn: "Insurance",
    categoryMl: "ഇൻഷുറൻസ്",
    applicantNameEn: "P. Thomas",
    applicantNameMl: "പി. തോമസ്",
    aadhaar: "XXXX-XXXX-9006",
    phone: "+91 97455 11224",
    locationEn: "Koyilandy, Kozhikode",
    locationMl: "കൊയിലാണ്ടി, കോഴിക്കോട്",
    annualIncome: "₹ 1,15,000",
    appliedDate: "13 Oct 2026",
    assistedByEn: "Anil Thomas",
    assistedByMl: "അനിൽ തോമസ്",
  },
  {
    schemeNameEn: "PM SVANidhi",
    schemeNameMl: "പി.എം സ്വനിധി",
    categoryEn: "Business",
    categoryMl: "ബിസിനസ്",
    applicantNameEn: "Abdul Rahman",
    applicantNameMl: "അബ്ദുൾ റഹ്മാൻ",
    aadhaar: "XXXX-XXXX-9007",
    phone: "+91 97451 98765",
    locationEn: "Kollam Port, Kollam",
    locationMl: "കൊല്ലം പോർട്ട്, കൊല്ലം",
    annualIncome: "₹ 1,40,000",
    appliedDate: "12 Oct 2026",
    assistedByEn: "Suresh Kumar",
    assistedByMl: "സുരേഷ് കുമാർ",
  },
  {
    schemeNameEn: "Pradhan Mantri Mudra Yojana (PMMY)",
    schemeNameMl: "പ്രധാനമന്ത്രി മുദ്രാ യോജന (PMMY)",
    categoryEn: "Business Loan",
    categoryMl: "ബിസിനസ് വായ്പ",
    applicantNameEn: "Radhamani V",
    applicantNameMl: "രാധാമണി വി",
    aadhaar: "XXXX-XXXX-9008",
    phone: "+91 94475 99001",
    locationEn: "Balaramapuram, Thiruvananthapuram",
    locationMl: "ബാലരാമപുരം, തിരുവനന്തപുരം",
    annualIncome: "₹ 1,65,000",
    appliedDate: "11 Oct 2026",
    assistedByEn: "Priya Menon",
    assistedByMl: "പ്രിയ മേനോൻ",
  },
  {
    schemeNameEn: "PM Vishwakarma Yojana",
    schemeNameMl: "പി.എം വിശ്വകർമ്മ യോജന",
    categoryEn: "Business & Skills",
    categoryMl: "ബിസിനസ് & നൈപുണ്യം",
    applicantNameEn: "Mathew Varghese",
    applicantNameMl: "മാത്യു വർഗീസ്",
    aadhaar: "XXXX-XXXX-9009",
    phone: "+91 94961 88990",
    locationEn: "Adimali, Idukki",
    locationMl: "അടിമാലി, ഇടുക്കി",
    annualIncome: "₹ 1,25,000",
    appliedDate: "10 Oct 2026",
    assistedByEn: "Maya Devi",
    assistedByMl: "മായാ ദേവി",
  },
  {
    schemeNameEn: "PM YASASVI Scholarship",
    schemeNameMl: "പിഎം യശസ്വി സ്കോളർഷിപ്പ്",
    categoryEn: "Scholarship",
    categoryMl: "സ്കോളർഷിപ്പ്",
    applicantNameEn: "Ananya Ramesh",
    applicantNameMl: "അനന്യ രമേശ്",
    aadhaar: "XXXX-XXXX-9010",
    phone: "+91 94950 33445",
    locationEn: "Kazhakkoottam, Thiruvananthapuram",
    locationMl: "കഴക്കൂട്ടം, തിരുവനന്തപുരം",
    annualIncome: "₹ 1,20,000",
    appliedDate: "09 Oct 2026",
    assistedByEn: "Vineeth S.",
    assistedByMl: "വിനീത് എസ്.",
  },
  {
    schemeNameEn: "Post Matric Scholarship for SC Students",
    schemeNameMl: "എസ്‌സി വിദ്യാർത്ഥികൾക്കുള്ള പോസ്റ്റ് മെട്രിക് സ്കോളർഷിപ്പ്",
    categoryEn: "Education",
    categoryMl: "വിദ്യാഭ്യാസം",
    applicantNameEn: "Saritha V",
    applicantNameMl: "സരിത വി",
    aadhaar: "XXXX-XXXX-9011",
    phone: "+91 98472 77889",
    locationEn: "Kasaragod South, Kasaragod",
    locationMl: "കാസർഗോഡ് സൗത്ത്, കാസർഗോഡ്",
    annualIncome: "₹ 85,000",
    appliedDate: "08 Oct 2026",
    assistedByEn: "Anil Thomas",
    assistedByMl: "അനിൽ തോമസ്",
  },
  {
    schemeNameEn: "PM Vidyalaxmi Scheme",
    schemeNameMl: "പി.എം വിദ്യാലക്ഷ്മി പദ്ധതി",
    categoryEn: "Education Loan",
    categoryMl: "വിദ്യാഭ്യാസ വായ്പ",
    applicantNameEn: "Arjun Das",
    applicantNameMl: "അർജുൻ ദാസ്",
    aadhaar: "XXXX-XXXX-9012",
    phone: "+91 98955 23451",
    locationEn: "Tripunithura, Ernakulam",
    locationMl: "തൃപ്പൂണിത്തുറ, എറണാകുളം",
    annualIncome: "₹ 1,75,000",
    appliedDate: "07 Oct 2026",
    assistedByEn: "Suresh Kumar",
    assistedByMl: "സുരേഷ് കുമാർ",
  },
  {
    schemeNameEn: "Ayushman Bharat - PM-JAY",
    schemeNameMl: "ആയുഷ്മാൻ ഭാരത് - പിഎം-ജയ്",
    categoryEn: "Health Insurance",
    categoryMl: "ആരോഗ്യ ഇൻഷുറൻസ്",
    applicantNameEn: "Lakshmi Amma",
    applicantNameMl: "ലക്ഷ്മി അമ്മ",
    aadhaar: "XXXX-XXXX-9013",
    phone: "+91 98470 11223",
    locationEn: "Vattiyoorkavu, Thiruvananthapuram",
    locationMl: "വട്ടിയൂർക്കാവ്, തിരുവനന്തപുരം",
    annualIncome: "₹ 75,000",
    appliedDate: "06 Oct 2026",
    assistedByEn: "Priya Menon",
    assistedByMl: "പ്രിയ മേനോൻ",
  },
  {
    schemeNameEn: "Pradhan Mantri National Dialysis Programme",
    schemeNameMl: "പ്രധാനമന്ത്രി ദേശീയ ഡയാലിസിസ് പദ്ധതി",
    categoryEn: "Health",
    categoryMl: "ആരോഗ്യം",
    applicantNameEn: "Thankamani K",
    applicantNameMl: "തങ്കമണി കെ",
    aadhaar: "XXXX-XXXX-9014",
    phone: "+91 94960 88771",
    locationEn: "Ambalapuzha, Alappuzha",
    locationMl: "അമ്പലപ്പുഴ, ആലപ്പുഴ",
    annualIncome: "₹ 68,000",
    appliedDate: "05 Oct 2026",
    assistedByEn: "Maya Devi",
    assistedByMl: "മായാ ദേവി",
  },
  {
    schemeNameEn: "Ayushman Bharat Digital Mission",
    schemeNameMl: "ആയുഷ്മാൻ ഭാരത് ഡിജിറ്റൽ മിഷൻ",
    categoryEn: "Digital Health",
    categoryMl: "ഡിജിറ്റൽ ആരോഗ്യം",
    applicantNameEn: "Nithin Raj",
    applicantNameMl: "നിതിൻ രാജ്",
    aadhaar: "XXXX-XXXX-9015",
    phone: "+91 98466 11220",
    locationEn: "Karunagappally, Kollam",
    locationMl: "കരുനാഗപ്പള്ളി, കൊല്ലം",
    annualIncome: "₹ 1,10,000",
    appliedDate: "04 Oct 2026",
    assistedByEn: "Vineeth S.",
    assistedByMl: "വിനീത് എസ്.",
  },
  {
    schemeNameEn: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
    schemeNameMl: "പ്രധാനമന്ത്രി ആവാസ് യോജന - ഗ്രാമീൺ (PMAY-G)",
    categoryEn: "Housing",
    categoryMl: "ഭവന നിർമ്മാണം",
    applicantNameEn: "Bindu Suresh",
    applicantNameMl: "ബിന്ദു സുരേഷ്",
    aadhaar: "XXXX-XXXX-9016",
    phone: "+91 94977 65432",
    locationEn: "Mananthavady, Wayanad",
    locationMl: "മാനന്തവാടി, വയനാട്",
    annualIncome: "₹ 62,000",
    appliedDate: "03 Oct 2026",
    assistedByEn: "Anil Thomas",
    assistedByMl: "അനിൽ തോമസ്",
  },
  {
    schemeNameEn: "Pradhan Mantri Awas Yojana - Urban 2.0",
    schemeNameMl: "പ്രധാനമന്ത്രി ആവാസ് യോജന - അർബൻ 2.0",
    categoryEn: "Housing",
    categoryMl: "ഭവന നിർമ്മാണം",
    applicantNameEn: "Joseph K",
    applicantNameMl: "ജോസഫ് കെ",
    aadhaar: "XXXX-XXXX-9017",
    phone: "+91 98952 66778",
    locationEn: "Chathannoor, Kollam",
    locationMl: "ചാത്തന്നൂർ, കൊല്ലം",
    annualIncome: "₹ 1,80,000",
    appliedDate: "02 Oct 2026",
    assistedByEn: "Suresh Kumar",
    assistedByMl: "സുരേഷ് കുമാർ",
  },
  {
    schemeNameEn: "PM Garib Kalyan Anna Yojana",
    schemeNameMl: "പിഎം ഗരീബ് കല്യാൺ അന്ന യോജന",
    categoryEn: "Food Security",
    categoryMl: "ഭക്ഷ്യ സുരക്ഷ",
    applicantNameEn: "Fathima Beevi",
    applicantNameMl: "ഫാത്തിമ ബീവി",
    aadhaar: "XXXX-XXXX-9018",
    phone: "+91 97448 55321",
    locationEn: "Fort Kochi, Ernakulam",
    locationMl: "ഫോർട്ട് കൊച്ചി, എറണാകുളം",
    annualIncome: "₹ 54,000",
    appliedDate: "01 Oct 2026",
    assistedByEn: "Priya Menon",
    assistedByMl: "പ്രിയ മേനോൻ",
  },
  {
    schemeNameEn: "Pradhan Mantri Ujjwala Yojana 2.0",
    schemeNameMl: "പ്രധാനമന്ത്രി ഉജ്ജ്വല യോജന 2.0",
    categoryEn: "Household Welfare",
    categoryMl: "ഗാർഹിക ക്ഷേമം",
    applicantNameEn: "Geetha Kumari",
    applicantNameMl: "ഗീത കുമാരി",
    aadhaar: "XXXX-XXXX-9019",
    phone: "+91 94958 77221",
    locationEn: "Thodupuzha, Idukki",
    locationMl: "തൊടുപുഴ, ഇടുക്കി",
    annualIncome: "₹ 66,000",
    appliedDate: "30 Sep 2026",
    assistedByEn: "Maya Devi",
    assistedByMl: "മായാ ദേവി",
  },
  {
    schemeNameEn: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
    schemeNameMl: "ഇന്ദിരാഗാന്ധി ദേശീയ വാർധക്യ പെൻഷൻ പദ്ധതി (IGNOAPS)",
    categoryEn: "Pension",
    categoryMl: "പെൻഷൻ",
    applicantNameEn: "Soman P",
    applicantNameMl: "സോമൻ പി",
    aadhaar: "XXXX-XXXX-9020",
    phone: "+91 94471 23456",
    locationEn: "Kazhakkoottam, Thiruvananthapuram",
    locationMl: "കഴക്കൂട്ടം, തിരുവനന്തപുരം",
    annualIncome: "₹ 60,000",
    appliedDate: "29 Sep 2026",
    assistedByEn: "Vineeth S.",
    assistedByMl: "വിനീത് എസ്.",
  },
];

const MOBILE_APPLICATION_TRACKING_URL = "https://www.pmsvanidhi.mohua.gov.in/Home/Search";

const MOBILE_APPLICATION_LIST_VISIBLE_STATUSES = [
  "application_received",
  "document_verification_completed",
  "applied",
  "review",
  "beneficiary",
  "rejected",
] as const satisfies readonly MobileApplicationListVisibleStatus[];

const mobileApplicationStageConfig: Record<
  MobileApplicationListVisibleStatus,
  {
    refStart: number;
    detailStatus: MobileApplicationRecord["status"];
    currentStep: number;
    pendingDocs: string[];
    nextActionEn: string;
    nextActionMl: string;
    includeTracking: boolean;
  }
> = {
  application_received: {
    refStart: 9201,
    detailStatus: "pending",
    currentStep: 1,
    pendingDocs: ["Aadhaar Card.pdf", "Income Certificate.pdf"],
    nextActionEn: "Application received. Document verification is pending.",
    nextActionMl: "അപേക്ഷ ലഭിച്ചു. രേഖാ പരിശോധന ബാക്കിയുണ്ട്.",
    includeTracking: false,
  },
  document_verification_completed: {
    refStart: 9221,
    detailStatus: "approved",
    currentStep: 2,
    pendingDocs: ["Aadhaar Card.pdf", "Income Certificate.pdf", "Residence Proof.pdf"],
    nextActionEn: "Documents verified. The application is ready to submit on the official scheme portal.",
    nextActionMl: "രേഖകൾ പരിശോധിച്ചു. ഔദ്യോഗിക സ്കീം പോർട്ടലിൽ അപേക്ഷ സമർപ്പിക്കാൻ തയ്യാറാണ്.",
    includeTracking: false,
  },
  applied: {
    refStart: 9241,
    detailStatus: "approved",
    currentStep: 3,
    pendingDocs: ["Aadhaar Card.pdf", "Bank Passbook.pdf", "Supporting Certificate.pdf"],
    nextActionEn: "Application submitted to the official scheme portal. Awaiting review.",
    nextActionMl: "ഔദ്യോഗിക സ്കീം പോർട്ടലിൽ അപേക്ഷ സമർപ്പിച്ചു. പരിശോധനയ്ക്കായി കാത്തിരിക്കുന്നു.",
    includeTracking: true,
  },
  review: {
    refStart: 9261,
    detailStatus: "in_review",
    currentStep: 4,
    pendingDocs: ["Aadhaar Card.pdf", "Bank Passbook.pdf", "Supporting Certificate.pdf"],
    nextActionEn: "Application is under review by the scheme authority.",
    nextActionMl: "സ്കീം അധികാരികൾ അപേക്ഷ പരിശോധിക്കുന്നു.",
    includeTracking: true,
  },
  beneficiary: {
    refStart: 9281,
    detailStatus: "disbursed",
    currentStep: 5,
    pendingDocs: ["Aadhaar Card.pdf", "Bank Passbook.pdf", "Sanction Letter.pdf"],
    nextActionEn: "Benefit receipt confirmed for this application.",
    nextActionMl: "ഈ അപേക്ഷയുടെ ആനുകൂല്യ ലഭ്യത സ്ഥിരീകരിച്ചു.",
    includeTracking: true,
  },
  rejected: {
    refStart: 9301,
    detailStatus: "rejected",
    currentStep: 4,
    pendingDocs: ["Aadhaar Card.pdf", "Income Certificate.pdf"],
    nextActionEn: "Application rejected. Review the decision notes for details.",
    nextActionMl: "അപേക്ഷ നിരസിച്ചു. വിശദാംശങ്ങൾക്ക് തീരുമാന കുറിപ്പുകൾ പരിശോധിക്കുക.",
    includeTracking: true,
  },
};

const formatMobileApplicationStageDate = (baseDate: string, offsetDays: number) => {
  const date = new Date(`${baseDate} 00:00:00`);
  if (Number.isNaN(date.getTime())) return baseDate;
  date.setDate(date.getDate() + offsetDays);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const buildMobileApplicationRecord = (
  seed: MobileApplicationRecordSeed,
  workflowStatus: MobileApplicationListVisibleStatus,
  index: number
): MobileApplicationRecord => {
  const stage = mobileApplicationStageConfig[workflowStatus];
  const refNumber = stage.refStart + index;
  const auditLog: MobileApplicationRecord["auditLog"] = [
    {
      titleEn: "Application received",
      titleMl: "അപേക്ഷ ലഭിച്ചു",
      date: formatMobileApplicationStageDate(seed.appliedDate, 0),
      time: "10:20 AM",
      actorEn: seed.applicantNameEn,
      actorMl: seed.applicantNameMl,
      status: "completed",
    },
  ];

  if (workflowStatus !== "application_received") {
    auditLog.push({
      titleEn: "Documents verified",
      titleMl: "രേഖകൾ പരിശോധിച്ചു",
      date: formatMobileApplicationStageDate(seed.appliedDate, 1),
      time: "11:05 AM",
      actorEn: "Anjali Nair",
      actorMl: "അഞ്ജലി നായർ",
      status: "completed",
    });
  }

  if (workflowStatus === "applied" || workflowStatus === "review" || workflowStatus === "beneficiary" || workflowStatus === "rejected") {
    auditLog.push({
      titleEn: "Application submitted on official portal",
      titleMl: "ഔദ്യോഗിക പോർട്ടലിൽ അപേക്ഷ സമർപ്പിച്ചു",
      date: formatMobileApplicationStageDate(seed.appliedDate, 2),
      time: "02:40 PM",
      actorEn: seed.assistedByEn,
      actorMl: seed.assistedByMl,
      status: "completed",
    });
  }

  if (workflowStatus === "review") {
    auditLog.push({
      titleEn: "Application under review",
      titleMl: "അപേക്ഷ പരിശോധനയിൽ",
      date: formatMobileApplicationStageDate(seed.appliedDate, 3),
      time: "09:30 AM",
      actorEn: "Scheme Review Committee",
      actorMl: "സ്കീം അവലോകന സമിതി",
      status: "current",
    });
  }

  if (workflowStatus === "beneficiary") {
    auditLog.push(
      {
        titleEn: "Application approved",
        titleMl: "അപേക്ഷ അംഗീകരിച്ചു",
        date: formatMobileApplicationStageDate(seed.appliedDate, 3),
        time: "09:30 AM",
        actorEn: "Scheme Review Committee",
        actorMl: "സ്കീം അവലോകന സമിതി",
        status: "completed",
      },
      {
        titleEn: "Benefit received",
        titleMl: "ആനുകൂല്യം ലഭിച്ചു",
        date: formatMobileApplicationStageDate(seed.appliedDate, 5),
        time: "01:15 PM",
        actorEn: "Scheme Disbursement Desk",
        actorMl: "സ്കീം വിതരണ ഡെസ്ക്",
        status: "completed",
      }
    );
  }

  if (workflowStatus === "rejected") {
    auditLog.push(
      {
        titleEn: "Application reviewed",
        titleMl: "അപേക്ഷ പരിശോധിച്ചു",
        date: formatMobileApplicationStageDate(seed.appliedDate, 3),
        time: "09:30 AM",
        actorEn: "Scheme Review Committee",
        actorMl: "സ്കീം അവലോകന സമിതി",
        status: "completed",
      },
      {
        titleEn: "Application rejected",
        titleMl: "അപേക്ഷ നിരസിച്ചു",
        date: formatMobileApplicationStageDate(seed.appliedDate, 4),
        time: "03:10 PM",
        actorEn: "Scheme Review Committee",
        actorMl: "സ്കീം അവലോകന സമിതി",
        notes: "Eligibility could not be confirmed after document verification.",
        status: "completed",
      }
    );
  }

  return {
    ...seed,
    ref: `APP-2026-${refNumber}`,
    trackingId: stage.includeTracking ? `PMSV-2026-${refNumber}` : undefined,
    trackingUrl: stage.includeTracking ? MOBILE_APPLICATION_TRACKING_URL : undefined,
    status: stage.detailStatus,
    currentStep: stage.currentStep,
    pendingDocs: stage.pendingDocs,
    nextActionEn: stage.nextActionEn,
    nextActionMl: stage.nextActionMl,
    auditLog,
    workflowStatus,
    decisionReason:
      workflowStatus === "rejected"
        ? "Eligibility could not be confirmed after document verification."
        : undefined,
  };
};

const mobileApplicationRecordsByStatus = MOBILE_APPLICATION_LIST_VISIBLE_STATUSES.reduce(
  (records, status) => {
    records[status] = mobileApplicationRecordSeeds.map((seed, index) =>
      buildMobileApplicationRecord(seed, status, index)
    );
    return records;
  },
  {} as Record<MobileApplicationListVisibleStatus, MobileApplicationRecord[]>
);

const mobileApplicationAllPreviewRecords = Array.from({ length: 20 }, (_, index) => {
  const status = MOBILE_APPLICATION_LIST_VISIBLE_STATUSES[index % MOBILE_APPLICATION_LIST_VISIBLE_STATUSES.length];
  return mobileApplicationRecordsByStatus[status][index];
});

const mobileApplicationStatusMeta: Record<
  MobileApplicationListStatus,
  { labelEn: string; labelMl: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  application_received: {
    labelEn: "Received",
    labelMl: "ലഭിച്ചു",
    icon: Inbox,
    className: "border-slate-200/90 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200",
  },
  document_verification_completed: {
    labelEn: "Documents Verified",
    labelMl: "രേഖകൾ പരിശോധിച്ചു",
    icon: FileCheck,
    className: "border-teal-200/80 bg-teal-50 text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300",
  },
  applied: {
    labelEn: "Applied",
    labelMl: "അപേക്ഷിച്ചു",
    icon: Send,
    className: "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
  },
  review: {
    labelEn: "Under Review",
    labelMl: "പരിശോധനയിൽ",
    icon: FileSearch,
    className: "border-orange-200/90 bg-orange-50 text-[#ff5500] dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300",
  },
  beneficiary: {
    labelEn: "Benefit Received",
    labelMl: "ആനുകൂല്യം ലഭിച്ചു",
    icon: HandCoins,
    className: "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  rejected: {
    labelEn: "Rejected",
    labelMl: "നിരസിച്ചു",
    icon: XCircle,
    className: "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300",
  },
  pending: {
    labelEn: "Received",
    labelMl: "ലഭിച്ചു",
    icon: Inbox,
    className: "border-slate-200/90 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200",
  },
  assisted: {
    labelEn: "Approved",
    labelMl: "അംഗീകരിച്ചു",
    icon: CheckCircle2,
    className: "border-blue-200/80 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
  },
};

type MobileApplicationCollectedDetails = {
  dateOfBirth: string;
  gender: string;
  religion: string;
  caste: string;
  maritalStatus: string;
  occupation: string;
  email: string;
  houseName: string;
  streetLocality: string;
  pincode: string;
  district: string;
  localBodyType: string;
  localBody: string;
  ward: string;
  mandalam: string;
  minorityStatus: string;
  disabilityStatus: string;
  studentStatus: string;
  employmentStatus: string;
  bplStatus: string;
  financialHardshipStatus: string;
  annualFamilyIncome: string;
  incomeRange: string;
  residenceArea: string;
  bankAccountNumber: string;
  bankIfscCode: string;
};

const mobileApplicationCollectedDetails: Record<string, MobileApplicationCollectedDetails> = {
  "APP-2026-8910": {
    dateOfBirth: "14/03/2004",
    gender: "Female",
    religion: "Hindu",
    caste: "OBC",
    maritalStatus: "Unmarried",
    occupation: "Student",
    email: "ananya.ramesh@example.com",
    houseName: "Sree Nilayam",
    streetLocality: "Kazhakkoottam Junction",
    pincode: "695582",
    district: "Thiruvananthapuram",
    localBodyType: "Grama Panchayat",
    localBody: "Kazhakkoottam",
    ward: "Ward 12 - Kazhakkoottam",
    mandalam: "Kazhakkoottam",
    minorityStatus: "No",
    disabilityStatus: "No",
    studentStatus: "Yes",
    employmentStatus: "Unemployed",
    bplStatus: "No",
    financialHardshipStatus: "Yes",
    annualFamilyIncome: "₹1,20,000",
    incomeRange: "₹1,00,000 - ₹2,50,000",
    residenceArea: "Urban",
    bankAccountNumber: "XXXX XXXX 4410",
    bankIfscCode: "SIBL0000452",
  },
  "APP-2026-8922": {
    dateOfBirth: "02/07/1958",
    gender: "Female",
    religion: "Hindu",
    caste: "General",
    maritalStatus: "Widowed",
    occupation: "Homemaker",
    email: "lakshmi.amma@example.com",
    houseName: "Thara",
    streetLocality: "Vattiyoorkavu",
    pincode: "695013",
    district: "Thiruvananthapuram",
    localBodyType: "Municipal Corporation",
    localBody: "Thiruvananthapuram",
    ward: "Ward 24 - Vattiyoorkavu",
    mandalam: "Vattiyoorkavu",
    minorityStatus: "No",
    disabilityStatus: "Yes",
    studentStatus: "No",
    employmentStatus: "Unemployed",
    bplStatus: "Yes",
    financialHardshipStatus: "Yes",
    annualFamilyIncome: "₹75,000",
    incomeRange: "₹50,000 - ₹1,00,000",
    residenceArea: "Urban",
    bankAccountNumber: "XXXX XXXX 2210",
    bankIfscCode: "SBIN0070028",
  },
  "APP-2026-8925": {
    dateOfBirth: "09/11/1969",
    gender: "Male",
    religion: "Hindu",
    caste: "OBC",
    maritalStatus: "Married",
    occupation: "Farmer",
    email: "krishnan.k@example.com",
    houseName: "Krishna Bhavan",
    streetLocality: "Palakkad North",
    pincode: "678001",
    district: "Palakkad",
    localBodyType: "Municipality",
    localBody: "Palakkad",
    ward: "Ward 8 - Palakkad North",
    mandalam: "Palakkad",
    minorityStatus: "No",
    disabilityStatus: "No",
    studentStatus: "No",
    employmentStatus: "Self-employed",
    bplStatus: "No",
    financialHardshipStatus: "No",
    annualFamilyIncome: "₹90,000",
    incomeRange: "₹50,000 - ₹1,00,000",
    residenceArea: "Rural",
    bankAccountNumber: "XXXX XXXX 7781",
    bankIfscCode: "SBIN0070231",
  },
  "APP-2026-8928": {
    dateOfBirth: "21/06/1982",
    gender: "Male",
    religion: "Hindu",
    caste: "General",
    maritalStatus: "Married",
    occupation: "Farmer",
    email: "ravi.kumar@example.com",
    houseName: "Ambady",
    streetLocality: "Ollur",
    pincode: "680306",
    district: "Thrissur",
    localBodyType: "Municipality",
    localBody: "Ollur",
    ward: "Ward 5 - Ollur",
    mandalam: "Ollur",
    minorityStatus: "No",
    disabilityStatus: "No",
    studentStatus: "No",
    employmentStatus: "Self-employed",
    bplStatus: "No",
    financialHardshipStatus: "No",
    annualFamilyIncome: "₹1,05,000",
    incomeRange: "₹1,00,000 - ₹2,50,000",
    residenceArea: "Rural",
    bankAccountNumber: "XXXX XXXX 3345",
    bankIfscCode: "HDFC0001245",
  },
  "APP-2026-8927": {
    dateOfBirth: "17/01/1975",
    gender: "Male",
    religion: "Christian",
    caste: "General",
    maritalStatus: "Married",
    occupation: "Driver",
    email: "joseph.k@example.com",
    houseName: "St. Thomas",
    streetLocality: "Chathannoor",
    pincode: "691572",
    district: "Kollam",
    localBodyType: "Grama Panchayat",
    localBody: "Chathannoor",
    ward: "Ward 9 - Chathannoor",
    mandalam: "Chathannoor",
    minorityStatus: "Yes",
    disabilityStatus: "No",
    studentStatus: "No",
    employmentStatus: "Employed",
    bplStatus: "No",
    financialHardshipStatus: "No",
    annualFamilyIncome: "₹1,80,000",
    incomeRange: "₹1,00,000 - ₹2,50,000",
    residenceArea: "Rural",
    bankAccountNumber: "XXXX XXXX 9902",
    bankIfscCode: "FDRL0001278",
  },
  "APP-2026-8921": {
    dateOfBirth: "05/04/1952",
    gender: "Male",
    religion: "Hindu",
    caste: "General",
    maritalStatus: "Widowed",
    occupation: "Retired",
    email: "soman.p@example.com",
    houseName: "Soumya",
    streetLocality: "Kazhakkoottam",
    pincode: "695582",
    district: "Thiruvananthapuram",
    localBodyType: "Grama Panchayat",
    localBody: "Kazhakkoottam",
    ward: "Ward 14 - Kazhakkoottam",
    mandalam: "Kazhakkoottam",
    minorityStatus: "No",
    disabilityStatus: "No",
    studentStatus: "No",
    employmentStatus: "Unemployed",
    bplStatus: "Yes",
    financialHardshipStatus: "Yes",
    annualFamilyIncome: "₹60,000",
    incomeRange: "₹50,000 - ₹1,00,000",
    residenceArea: "Urban",
    bankAccountNumber: "XXXX XXXX 6620",
    bankIfscCode: "SBIN0070028",
  },
};

type MobileDocumentKind = "pdf" | "word" | "jpg" | "png";

const mobileDocumentKindMeta: Record<
  MobileDocumentKind,
  { label: string; extension: string; tileClass: string; chipClass: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  pdf: {
    label: "PDF",
    extension: "pdf",
    tileClass: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300",
    chipClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    Icon: FileText,
  },
  word: {
    label: "WORD",
    extension: "docx",
    tileClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300",
    chipClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    Icon: FileText,
  },
  jpg: {
    label: "JPG",
    extension: "jpg",
    tileClass: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300",
    chipClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    Icon: FileImage,
  },
  png: {
    label: "PNG",
    extension: "png",
    tileClass: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300",
    chipClass: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
    Icon: FileImage,
  },
};

const getMobileDocumentKind = (fileName: string): MobileDocumentKind => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "word";
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "jpg";
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.includes("passbook")) return "png";
  if (lower.includes("aadhaar") || lower.includes("ration") || lower.includes("photo")) return "jpg";
  return "pdf";
};

const getMobileDocumentDisplayName = (fileName: string) => {
  if (/\.(pdf|docx?|jpe?g|png)$/i.test(fileName)) return fileName;
  return `${fileName}.${mobileDocumentKindMeta[getMobileDocumentKind(fileName)].extension}`;
};

const getMobileDocumentSize = (fileName: string) => {
  let hash = 0;
  for (let index = 0; index < fileName.length; index += 1) {
    hash = (hash * 31 + fileName.charCodeAt(index)) % 100000;
  }
  const kilobytes = 160 + (hash % 1350);
  return kilobytes >= 1024 ? `${(kilobytes / 1024).toFixed(1)} MB` : `${kilobytes} KB`;
};

const MOBILE_SCHEME_WEBSITE_URLS: Record<string, string> = {
  "pm kisan samman nidhi": "https://pmkisan.gov.in",
  "ayushman bharat pm-jay": "https://pmjay.gov.in",
  "ayushman bharat - pm-jay": "https://pmjay.gov.in",
  "ayushman bharat - pm-jay health protection": "https://pmjay.gov.in",
  "pradhan mantri awas yojana (pmay housing)": "https://pmaymis.gov.in",
  "pradhan mantri awas yojana - gramin (pmay-g)": "https://pmayg.nic.in",
  "pradhan mantri awas yojana - urban (pmay-u)": "https://pmaymis.gov.in",
  "indira gandhi national old age pension (ignoap)": "https://nsap.nic.in",
  "indira gandhi national old age pension scheme (ignoaps)": "https://nsap.nic.in",
  "pm yasasvi scholarship": "https://yet.nta.ac.in",
  "kisan credit card (kcc) scheme": "https://www.pmkisan.gov.in",
  "pradhan mantri fasal bima yojana (pmfby)": "https://pmfby.gov.in",
};

const getMobileSchemeWebsiteUrl = (schemeName: string) =>
  MOBILE_SCHEME_WEBSITE_URLS[schemeName.trim().toLowerCase()] ?? "";

const getMobileCategoryIconSrc = (category: string) => {
  const normalized = category.trim().toLowerCase();
  if (/(scholarship|education|learning|student)/.test(normalized)) {
    return "/images/category-icons/cat_education.png";
  }
  if (/(agricultur|farmer|farming)/.test(normalized)) {
    return "/images/category-icons/cat_agriculture.png";
  }
  if (/(health|medical|insurance)/.test(normalized)) {
    return "/images/category-icons/cat_health.png";
  }
  if (/(hous|shelter)/.test(normalized)) {
    return "/images/category-icons/cat_housing.png";
  }
  if (/(bank|finance|loan)/.test(normalized)) {
    return "/images/category-icons/cat_banking.png";
  }
  if (/(business|entrepreneur|msme|startup)/.test(normalized)) {
    return "/images/category-icons/cat_business.png";
  }
  if (/(law|justice|legal|rights)/.test(normalized)) {
    return "/images/category-icons/cat_law_justice.png";
  }
  if (/(science|tech|digital)/.test(normalized)) {
    return "/images/category-icons/cat_science.png";
  }
  return schemes3dIcon;
};

const getEligibleSchemeLogo = (scheme: MobileEligibleScheme) => {
  const title = scheme.titleEn.toLowerCase();
  if (/(kisan|farmer|agri|crop)/.test(title)) {
    return "/images/category-icons/cat_agriculture.png";
  }
  if (/(karunya|arogya|health|hospital)/.test(title)) {
    return "/images/category-icons/cat_health.png";
  }
  if (/(life mission|housing|home|shelter|awas)/.test(title)) {
    return "/images/category-icons/cat_housing.png";
  }
  if (/(pension|vayoshreshtha)/.test(title)) {
    return "/images/category-icons/cat_banking.png";
  }
  return getMobileCategoryIconSrc(scheme.categoryEn);
};

function MobileApplicationStatusBadge({
  status,
  lang,
  size = "compact",
  labelEn,
  labelMl,
}: {
  status: MobileApplicationListStatus;
  lang: string;
  size?: "compact" | "medium" | "prominent";
  labelEn?: string;
  labelMl?: string;
}) {
  const meta = mobileApplicationStatusMeta[status];
  const Icon = meta.icon;
  const isProminent = size === "prominent";
  const isMedium = size === "medium";
  const iconSizeClass = isProminent ? "h-[18px] w-[18px]" : isMedium ? "h-4 w-4" : "h-3.5 w-3.5";
  const checkSizeClass = isProminent ? "h-2.5 w-2.5" : "h-2 w-2";

  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap border font-extrabold leading-none ${meta.className} ${
        isProminent
          ? "h-9 gap-1.5 rounded-lg px-2.5 text-[12px]"
          : isMedium
            ? "h-6 gap-1.5 rounded-full px-2.5 text-[10.5px]"
            : "h-5 gap-1 rounded-full px-2 text-[9.5px]"
      }`}
    >
      {status === "beneficiary" ? (
        <span className={`relative inline-flex shrink-0 items-center justify-center ${iconSizeClass}`}>
          <HandCoins className={`${iconSizeClass} stroke-[2]`} />
          <Check className={`absolute -bottom-0.5 -right-0.5 stroke-[3] ${checkSizeClass}`} />
        </span>
      ) : (
        <Icon className={`shrink-0 stroke-[2] ${iconSizeClass}`} />
      )}
      <span>{lang === "ml" ? (labelMl ?? meta.labelMl) : (labelEn ?? meta.labelEn)}</span>
    </span>
  );
}

const getLocalIsoDate = (date: Date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const formatCollectionDate = (isoDate: string) => {
  if (!isoDate) return "—";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatCollectionDateTime = (isoDateTime: string) => {
  if (!isoDateTime) return "—";
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return isoDateTime;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getActivityTimeLabel = (date: Date = new Date()) =>
  date
    .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })
    .toUpperCase();

const createActivityEntry = (
  entry: {
    titleEn: string;
    titleMl: string;
    actorEn?: string;
    actorMl?: string;
    notes?: string;
    status?: "completed" | "current" | "upcoming";
  },
  timestamp: Date = new Date(),
) => ({
  titleEn: entry.titleEn,
  titleMl: entry.titleMl,
  date: formatCollectionDate(getLocalIsoDate(timestamp)),
  time: getActivityTimeLabel(timestamp),
  actorEn: entry.actorEn,
  actorMl: entry.actorMl,
  notes: entry.notes?.trim() ? entry.notes.trim() : undefined,
  status: entry.status ?? ("completed" as const),
});

const getMobileAuditFallbackActor = ({
  event,
  index,
  applicantName,
  assistedBy,
  lang,
}: {
  event: { titleEn: string; titleMl: string };
  index: number;
  applicantName: string;
  assistedBy: string;
  lang: "ml" | "en";
}) => {
  const eventTitle = `${event.titleEn} ${event.titleMl}`.toLowerCase();
  const pick = (en: string, ml: string) => (lang === "ml" ? ml : en);

  if (eventTitle.includes("field")) {
    return pick("Village Officer", "വില്ലേജ് ഓഫീസർ");
  }
  if (eventTitle.includes("medical")) {
    return pick("District Medical Board", "ജില്ലാ മെഡിക്കൽ ബോർഡ്");
  }
  if (eventTitle.includes("document")) {
    return pick("Anjali Nair", "അഞ്ജലി നായർ");
  }
  if (
    eventTitle.includes("benefit") ||
    eventTitle.includes("disburs") ||
    eventTitle.includes("pension")
  ) {
    return pick("Scheme Disbursement Desk", "സ്കീം വിതരണ ഡെസ്ക്");
  }
  if (
    eventTitle.includes("review") ||
    eventTitle.includes("approval") ||
    eventTitle.includes("reject") ||
    eventTitle.includes("decision") ||
    eventTitle.includes("sanction")
  ) {
    return pick("Scheme Review Committee", "സ്കീം അവലോകന സമിതി");
  }
  if (
    eventTitle.includes("submitted") ||
    eventTitle.includes("apply scheme") ||
    eventTitle.includes("tracking")
  ) {
    return assistedBy;
  }
  if (eventTitle.includes("received") || eventTitle.includes("details")) {
    return applicantName;
  }
  return index === 0 ? applicantName : assistedBy;
};

const getApplicantInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const mockBeneficiariesFullList = [
  { id: "BEN-8921", name: "Soman P", nameMl: "സോമൻ പി", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Kazhakkoottam, TVM", scheme: "IGNOAPS Pension", status: "Verified", date: "2026-10-04", phone: "+91 94471 23456" },
  { id: "BEN-8922", name: "Lakshmi Amma", nameMl: "ലക്ഷ്മി അമ്മ", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Vattiyoorkavu, TVM", scheme: "Ayushman Bharat PM-JAY", status: "Verified", date: "2026-10-03", phone: "+91 98470 11223" },
  { id: "BEN-8923", name: "Abdul Rahman", nameMl: "അബ്ദുൾ റഹ്മാൻ", category: "BJP Member", categoryMl: "ബി.ജെ.പി അംഗം", location: "Kollam Port, KLM", scheme: "PM Matsya Sampada Yojana", status: "Verified", date: "2026-10-05", phone: "+91 97451 98765" },
  { id: "BEN-8924", name: "Sunitha Kumari", nameMl: "സുനിത കുമാരി", category: "Politician", categoryMl: "രാഷ്ട്രീയ നേതാവ്", location: "Kottayam East, KTM", scheme: "PM SVANidhi", status: "Verified", date: "2026-10-02", phone: "+91 94462 54321" },
  { id: "BEN-8925", name: "K. Krishnan", nameMl: "കെ. കൃഷ്ണൻ", category: "People’s Representative", categoryMl: "ജനപ്രതിനിധി", location: "Palakkad North, PKD", scheme: "PM Kisan Samman Nidhi", status: "Verified", date: "2026-10-01", phone: "+91 98463 87654" },
  { id: "BEN-8926", name: "Ananya Ramesh", nameMl: "അനന്യ രമേശ്", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Tripunithura, EKM", scheme: "PM YASASVI Scholarship", status: "Verified", date: "2026-10-05", phone: "+91 94950 33445" },
  { id: "BEN-8927", name: "Joseph K", nameMl: "ജോസഫ് കെ", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Chathannoor, KLM", scheme: "PMAY - Urban", status: "Verified", date: "2026-09-29", phone: "+91 98952 66778" },
  { id: "BEN-8928", name: "Radhamani V", nameMl: "രാധാമണി വി", category: "BJP Member", categoryMl: "ബി.ജെ.പി അംഗം", location: "Balaramapuram, TVM", scheme: "National Handloom Development Programme", status: "Verified", date: "2026-09-28", phone: "+91 94475 99001" },
  { id: "BEN-8929", name: "Muhammed Shafee", nameMl: "മുഹമ്മദ് ഷാഫി", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Malappuram Central, MLP", scheme: "PM Fasal Bima Yojana", status: "Verified", date: "2026-09-27", phone: "+91 97441 12389" },
  { id: "BEN-8930", name: "Devaki Amma", nameMl: "ദേവകി അമ്മ", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Kannur Town, KNR", scheme: "Atal Pension Yojana", status: "Verified", date: "2026-09-26", phone: "+91 94460 44556" },
  { id: "BEN-8931", name: "Saritha V", nameMl: "സരിത വി", category: "BJP Member", categoryMl: "ബി.ജെ.പി അംഗം", location: "Kasaragod South, KSD", scheme: "Menstrual Hygiene Scheme (NHM)", status: "Verified", date: "2026-09-25", phone: "+91 98472 77889" },
  { id: "BEN-8932", name: "Mathew Varghese", nameMl: "മാത്യു വർഗീസ്", category: "Politician", categoryMl: "രാഷ്ട്രീയ നേതാവ്", location: "Adimali, IDK", scheme: "PM Krishi Sinchayee Yojana", status: "Verified", date: "2026-09-24", phone: "+91 94961 88990" },
  { id: "BEN-8933", name: "P. Thomas", nameMl: "പി. തോമസ്", category: "People’s Representative", categoryMl: "ജനപ്രതിനിധി", location: "Koyilandy, CLT", scheme: "Coconut Development Board Schemes", status: "Verified", date: "2026-09-23", phone: "+91 97455 11224" },
  { id: "BEN-8934", name: "Suja Nair", nameMl: "സുജ നായർ", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Thrissur Town, TSR", scheme: "PM YASASVI Scholarship", status: "Verified", date: "2026-09-22", phone: "+91 98950 55667" },
];

const schemeCategories2Row = [
  {
    id: "agriculture",
    labelEn: "Agriculture",
    labelMl: "കൃഷി",
    schemesCount: "948 Schemes",
    schemesCountMl: "948 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_agriculture.png",
    detail: {
      id: "agriculture",
      count: 18,
      categoryLabelEn: "Agriculture & Farmers Welfare",
      categoryLabelMl: "കർഷക ക്ഷേമം",
      titleEn: "Agriculture & Farming Schemes",
      titleMl: "കാർഷിക & കർഷക ക്ഷേമ പദ്ധതികൾ",
    },
  },
  {
    id: "banking",
    labelEn: "Banking &\nInsurance",
    labelMl: "ബാങ്കിംഗ് &\nഇൻഷുറൻസ്",
    schemesCount: "358 Schemes",
    schemesCountMl: "358 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_banking.png",
    detail: {
      id: "banking",
      count: 14,
      categoryLabelEn: "Banking & Insurance",
      categoryLabelMl: "ബാങ്കിംഗ് & ഇൻഷുറൻസ്",
      titleEn: "Banking, Insurance & Credit Schemes",
      titleMl: "ബാങ്കിംഗ്, ഇൻഷുറൻസ് & വായ്പാ പദ്ധതികൾ",
    },
  },
  {
    id: "business",
    labelEn: "Business &\nEntrepreneurship",
    labelMl: "ബിസിനസ് &\nസംരംഭകത്വം",
    schemesCount: "831 Schemes",
    schemesCountMl: "831 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_business.png",
    detail: {
      id: "business",
      count: 22,
      categoryLabelEn: "Business & Entrepreneurship",
      categoryLabelMl: "സംരംഭകത്വം",
      titleEn: "Business & Startup Initiatives",
      titleMl: "ബിസിനസ് & സംരംഭകത്വ പദ്ധതികൾ",
    },
  },
  {
    id: "education",
    labelEn: "Education &\nLearning",
    labelMl: "വിദ്യാഭ്യാസം &\nപഠനം",
    schemesCount: "1,184 Schemes",
    schemesCountMl: "1,184 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_education.png",
    detail: {
      id: "education",
      count: 26,
      categoryLabelEn: "Education & Scholarships",
      categoryLabelMl: "വിദ്യാഭ്യാസം & സ്കോളർഷിപ്പ്",
      titleEn: "Education & Skill Learning Schemes",
      titleMl: "വിദ്യാഭ്യാസ & പഠന സ്കോളർഷിപ്പ് പദ്ധതികൾ",
    },
  },
  {
    id: "health",
    labelEn: "Health &\nWellness",
    labelMl: "ആരോഗ്യം &\nക്ഷേമം",
    schemesCount: "296 Schemes",
    schemesCountMl: "296 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_health.png",
    detail: {
      id: "healthcare",
      count: 15,
      categoryLabelEn: "Health & Medical",
      categoryLabelMl: "ആരോഗ്യം & വ്യക്തിഗത പരിരക്ഷ",
      titleEn: "Health & Family Insurance Schemes",
      titleMl: "ആരോഗ്യ പരിരക്ഷാ & മെഡിക്കൽ പദ്ധതികൾ",
    },
  },
  {
    id: "housing",
    labelEn: "Housing &\nShelter",
    labelMl: "ഭവനം &\nപാർപ്പിടം",
    schemesCount: "145 Schemes",
    schemesCountMl: "145 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_housing.png",
    detail: {
      id: "housing",
      count: 12,
      categoryLabelEn: "Housing & Infrastructure",
      categoryLabelMl: "ഭവനം & പാർപ്പിടം",
      titleEn: "Housing & Shelter Assistance Schemes",
      titleMl: "ഭവന നിർമ്മാണ & ലൈഫ് മിഷൻ പദ്ധതികൾ",
    },
  },
  {
    id: "law",
    labelEn: "Law &\nJustice",
    labelMl: "നിയമവും\nനീതിയും",
    schemesCount: "35 Schemes",
    schemesCountMl: "35 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_law_justice.png",
    detail: {
      id: "law",
      count: 9,
      categoryLabelEn: "Law, Justice & Rights",
      categoryLabelMl: "നിയമം & അവകാശങ്ങൾ",
      titleEn: "Legal Aid & Justice Protection Schemes",
      titleMl: "നിയമസഹായ & അവകാശ സംരക്ഷണ പദ്ധതികൾ",
    },
  },
  {
    id: "science",
    labelEn: "Science &\nIT",
    labelMl: "ശാസ്ത്രം &\nഐ.ടി",
    schemesCount: "134 Schemes",
    schemesCountMl: "134 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_science.png",
    detail: {
      id: "science",
      count: 11,
      categoryLabelEn: "Science, Tech & IT",
      categoryLabelMl: "ശാസ്ത്രം & ഐ.ടി",
      titleEn: "Science & Technology Innovation Grants",
      titleMl: "ശാസ്ത്ര സാങ്കേതിക & ഐ.ടി വികസന പദ്ധതികൾ",
    },
  },
];


const popularSchemesList = [
  { id: "pm_jay", nameEn: "Ayushman Bharat", nameMl: "ആയുഷ്മാൻ ഭാരത്", logo: "/images/popular-schemes/pm_jay.png", categoryId: "healthcare" },
  { id: "digital_india", nameEn: "Digital India", nameMl: "ഡിജിറ്റൽ ഇന്ത്യ", logo: "/images/popular-schemes/digital_india.png", categoryId: "science" },
  { id: "pmkvy", nameEn: "PM Kaushal Vikas", nameMl: "പിഎം കൗശൽ വികാസ്", logo: "/images/popular-schemes/pmkvy.png", categoryId: "education" },
  { id: "khelo_india", nameEn: "Khelo India", nameMl: "ഖേലോ ഇന്ത്യ", logo: "/images/popular-schemes/khelo_india.png", categoryId: "education" },
  { id: "mid_day_meal", nameEn: "Mid-Day Meal", nameMl: "ഉച്ചഭക്ഷണ പദ്ധതി", logo: "/images/popular-schemes/mid_day_meal.png", categoryId: "education" },
  { id: "pm_matru_vandana", nameEn: "PM Matru Vandana", nameMl: "പിഎം മാതൃ വന്ദന", logo: "/images/popular-schemes/pm_matru_vandana.png", categoryId: "healthcare" },
  { id: "atal_pension", nameEn: "Atal Pension", nameMl: "അടൽ പെൻഷൻ", logo: "/images/popular-schemes/atal_pension.png", categoryId: "pension" },
  { id: "stand_up_india", nameEn: "Stand Up India", nameMl: "സ്റ്റാൻഡ് അപ് ഇന്ത്യ", logo: "/images/popular-schemes/stand_up_india.png", categoryId: "business" },
  { id: "smart_city", nameEn: "Smart City", nameMl: "സ്മാർട്ട് സിറ്റി", logo: "/images/popular-schemes/smart_city.png", categoryId: "housing" },
];

type MobileCentralSchemeCard = {
  titleEn: string;
  titleMl: string;
  deptEn: string;
  deptMl: string;
  benefitEn: string;
  benefitMl: string;
  eligibilityEn: string;
  eligibilityMl: string;
};

const mobileCentralSchemeCardsByCategory: Record<string, MobileCentralSchemeCard[]> = {
  agriculture: [
    {
      titleEn: "PM Kisan Samman Nidhi",
      titleMl: "പിഎം-കിസാൻ സമ്മാൻ നിധി",
      deptEn: "Ministry of Agriculture & Farmers Welfare, Govt of India",
      deptMl: "കൃഷി കർഷകക്ഷേമ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "₹6,000 / year direct bank transfer (3 installments)",
      benefitMl: "പ്രതിവർഷം ₹6,000 (3 ഗഡുക്കളായി)",
      eligibilityEn: "Small & marginal farmers holding cultivable land",
      eligibilityMl: "കൃഷിഭൂമിയുള്ള ചെറുകിട-നാമമാത്ര കർഷകർ",
    },
    {
      titleEn: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      titleMl: "പ്രധാനമന്ത്രി ഫസൽ ബീമാ യോജന (PMFBY)",
      deptEn: "Ministry of Agriculture & Farmers Welfare, Govt of India",
      deptMl: "കൃഷി കർഷകക്ഷേമ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Up to ₹2 Lakh crop insurance cover with subsidised premium",
      benefitMl: "വിള ഇൻഷുറൻസിന് ₹2 ലക്ഷം വരെ പരിരക്ഷ, സബ്‍സിഡി പ്രീമിയം",
      eligibilityEn: "All farmers including tenant & sharecropper farmers",
      eligibilityMl: "പാട്ടക്കർഷകർ ഉൾപ്പെടെ എല്ലാ കർഷകരും",
    },
    {
      titleEn: "Kisan Credit Card (KCC) Scheme",
      titleMl: "കിസാൻ ക്രെഡിറ്റ് കാർഡ് (KCC) പദ്ധതി",
      deptEn: "Department of Agriculture & Farmers Welfare, Govt of India",
      deptMl: "കൃഷി കർഷകക്ഷേമ വകുപ്പ്, ഭാരത സർക്കാർ",
      benefitEn: "Crop loan up to ₹3 Lakh at 4% effective interest",
      benefitMl: "₹3 ലക്ഷം വരെ വിളവായ്പ, 4% ഫലപ്രദ പലിശ",
      eligibilityEn: "Farmers, tenant farmers & SHG/JLG members",
      eligibilityMl: "കർഷകർ, പാട്ടക്കർഷകർ, സ്വയം സഹായ സംഘങ്ങൾ",
    },
  ],
  banking: [
    {
      titleEn: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
      titleMl: "പ്രധാനമന്ത്രി ജൻ ധൻ യോജന (PMJDY)",
      deptEn: "Ministry of Finance, Govt of India",
      deptMl: "ധനകാര്യ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Zero-balance account with RuPay card & ₹2 Lakh accident cover",
      benefitMl: "സീറോ ബാലൻസ് അക്കൗണ്ട്, RuPay കാർഡ്, ₹2 ലക്ഷം അപകട പരിരക്ഷ",
      eligibilityEn: "Any citizen aged 10+ without a bank account",
      eligibilityMl: "ബാങ്ക് അക്കൗണ്ട് ഇല്ലാത്ത 10 വയസ്സിന് മുകളിലുള്ള പൗരന്മാർ",
    },
    {
      titleEn: "Atal Pension Yojana (APY)",
      titleMl: "അടൽ പെൻഷൻ യോജന (APY)",
      deptEn: "Ministry of Finance / PFRDA, Govt of India",
      deptMl: "ധനകാര്യ മന്ത്രാലയം / PFRDA, ഭാരത സർക്കാർ",
      benefitEn: "Guaranteed pension of ₹1,000–₹5,000 per month after 60",
      benefitMl: "60 വയസ്സിന് ശേഷം പ്രതിമാസം ₹1,000–₹5,000 ഉറപ്പായ പെൻഷൻ",
      eligibilityEn: "Citizens aged 18–40 with a savings bank account",
      eligibilityMl: "18–40 വയസ്സുള്ള സേവിംഗ്സ് അക്കൗണ്ട് ഉടമകൾ",
    },
    {
      titleEn: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
      titleMl: "പ്രധാനമന്ത്രി ജീവൻ ജ്യോതി ബീമാ യോജന (PMJJBY)",
      deptEn: "Ministry of Finance, Govt of India",
      deptMl: "ധനകാര്യ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "₹2 Lakh life cover at ₹436 annual premium",
      benefitMl: "പ്രതിവർഷം ₹436 പ്രീമിയത്തിൽ ₹2 ലക്ഷം ജീവൻ പരിരക്ഷ",
      eligibilityEn: "Bank account holders aged 18–50",
      eligibilityMl: "18–50 വയസ്സുള്ള ബാങ്ക് അക്കൗണ്ട് ഉടമകൾ",
    },
  ],
  business: [
    {
      titleEn: "PM SVANidhi",
      titleMl: "പിഎം സ്വനിധി",
      deptEn: "Ministry of Housing & Urban Affairs, Govt of India",
      deptMl: "പാർപ്പിട നഗരകാര്യ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Collateral-free working capital loan up to ₹50,000",
      benefitMl: "ഈടില്ലാത്ത ₹50,000 വരെ വായ്പ",
      eligibilityEn: "Street vendors holding a vending certificate",
      eligibilityMl: "വെൻഡിംഗ് സർട്ടിഫിക്കറ്റുള്ള തെരുവ് വ്യാപാരികൾ",
    },
    {
      titleEn: "Pradhan Mantri Mudra Yojana (PMMY)",
      titleMl: "പ്രധാനമന്ത്രി മുദ്ര യോജന (PMMY)",
      deptEn: "Department of Financial Services, Govt of India",
      deptMl: "ധനകാര്യ സേവന വകുപ്പ്, ഭാരത സർക്കാർ",
      benefitEn: "Business loans up to ₹10 Lakh (Shishu / Kishor / Tarun)",
      benefitMl: "ശിശു / കിഷോർ / തരുൺ ഘട്ടങ്ങളിൽ ₹10 ലക്ഷം വരെ വായ്പ",
      eligibilityEn: "Non-farm micro & small enterprises",
      eligibilityMl: "കൃഷി ഇതര സൂക്ഷ്മ-ചെറുകിട സംരംഭങ്ങൾ",
    },
    {
      titleEn: "PM Vishwakarma Yojana",
      titleMl: "പിഎം വിശ്വകർമ്മ യോജന",
      deptEn: "Ministry of MSME, Govt of India",
      deptMl: "സൂക്ഷ്മ-ചെറുകിട സംരംഭ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "₹15,000 toolkit grant & collateral-free loan up to ₹3 Lakh",
      benefitMl: "₹15,000 ടൂൾകിറ്റ് ഗ്രാൻറും ₹3 ലക്ഷം വരെ വായ്പയും",
      eligibilityEn: "Traditional artisans & craftspeople",
      eligibilityMl: "പരമ്പരാഗത കൈത്തൊഴിൽ വിദഗ്ധർ",
    },
  ],
  education: [
    {
      titleEn: "PM YASASVI Scholarship",
      titleMl: "പിഎം യശസ്വി സ്കോളർഷിപ്പ്",
      deptEn: "Ministry of Social Justice & Empowerment, Govt of India",
      deptMl: "സാമൂഹിക നീതി ശാക്തീകരണ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Scholarship for OBC / EBC / DNT students in classes 9 to 12",
      benefitMl: "9 മുതൽ 12 വരെ ക്ലാസുകളിലെ OBC / EBC / DNT വിദ്യാർത്ഥികൾക്ക് സ്കോളർഷിപ്പ്",
      eligibilityEn: "OBC / EBC / DNT students meeting the income limit",
      eligibilityMl: "വരുമാന പരിധി പാലിക്കുന്ന OBC / EBC / DNT വിദ്യാർത്ഥികൾ",
    },
    {
      titleEn: "Post Matric Scholarship for SC Students",
      titleMl: "എസ്‍സി വിദ്യാർത്ഥികൾക്കുള്ള പോസ്റ്റ് മെട്രിക് സ്കോളർഷിപ്പ്",
      deptEn: "Ministry of Social Justice & Empowerment, Govt of India",
      deptMl: "സാമൂഹിക നീതി ശാക്തീകരണ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Tuition fee and maintenance allowance for SC students",
      benefitMl: "എസ്‍സി വിദ്യാർത്ഥികൾക്ക് ട്യൂഷൻ ഫീസും ഉപജീവന സഹായവും",
      eligibilityEn: "SC students pursuing post-matric courses",
      eligibilityMl: "പോസ്റ്റ് മെട്രിക് പഠനം നടത്തുന്ന എസ്‍സി വിദ്യാർത്ഥികൾ",
    },
    {
      titleEn: "PM Vidyalaxmi Scheme",
      titleMl: "പിഎം വിദ്യാലക്ഷ്മി പദ്ധതി",
      deptEn: "Ministry of Education, Govt of India",
      deptMl: "വിദ്യാഭ്യാസ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Collateral-free education loan up to ₹10 Lakh",
      benefitMl: "ഈടില്ലാത്ത ₹10 ലക്ഷം വരെ വിദ്യാഭ്യാസ വായ്പ",
      eligibilityEn: "Students admitted to recognised higher education institutions",
      eligibilityMl: "അംഗീകൃത ഉന്നത വിദ്യാഭ്യാസ സ്ഥാപനങ്ങളിൽ പ്രവേശനം ലഭിച്ച വിദ്യാർത്ഥികൾ",
    },
  ],
  healthcare: [
    {
      titleEn: "Ayushman Bharat - PM-JAY Health Protection",
      titleMl: "ആയുഷ്മാൻ ഭാരത് - പിഎം-ജയ്",
      deptEn: "National Health Authority, Govt of India",
      deptMl: "ദേശീയ ആരോഗ്യ അതോറിറ്റി, ഭാരത സർക്കാർ",
      benefitEn: "₹5,00,000 / family / year cashless hospital cover",
      benefitMl: "കുടുംബത്തിന് പ്രതിവർഷം ₹5,00,000 ക്യാഷ്‍ലെസ് ചികിത്സാ പരിരക്ഷ",
      eligibilityEn: "Low-income & SECC priority household members",
      eligibilityMl: "താഴ്ന്ന വരുമാന & SECC മുൻഗണനാ കുടുംബങ്ങൾ",
    },
    {
      titleEn: "Pradhan Mantri National Dialysis Programme",
      titleMl: "പ്രധാനമന്ത്രി ദേശീയ ഡയാലിസിസ് പദ്ധതി",
      deptEn: "Ministry of Health & Family Welfare, Govt of India",
      deptMl: "ആരോഗ്യ കുടുംബക്ഷേമ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Free dialysis sessions at district hospitals",
      benefitMl: "ജില്ലാ ആശുപത്രികളിൽ സൗജന്യ ഡയാലിസിസ്",
      eligibilityEn: "BPL patients requiring dialysis support",
      eligibilityMl: "ഡയാലിസിസ് ആവശ്യമുള്ള ബിപിഎൽ രോഗികൾ",
    },
    {
      titleEn: "Ayushman Bharat Digital Mission",
      titleMl: "ആയുഷ്മാൻ ഭാരത് ഡിജിറ്റൽ മിഷൻ",
      deptEn: "Ministry of Health & Family Welfare, Govt of India",
      deptMl: "ആരോഗ്യ കുടുംബക്ഷേമ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Digital health ID with linked health records",
      benefitMl: "ഡിജിറ്റൽ ആരോഗ്യ ഐഡിയും ബന്ധിപ്പിച്ച ആരോഗ്യ രേഖകളും",
      eligibilityEn: "All citizens (voluntary enrolment)",
      eligibilityMl: "എല്ലാ പൗരന്മാർക്കും (സ്വമേധയാ രജിസ്ട്രേഷൻ)",
    },
  ],
  housing: [
    {
      titleEn: "Pradhan Mantri Awas Yojana (PMAY Housing)",
      titleMl: "പിഎംഎവൈ ഭവന പദ്ധതി (ഗ്രാമീൺ / അർബൻ)",
      deptEn: "Ministry of Housing & Urban Affairs, Govt of India",
      deptMl: "പാർപ്പിട നഗരകാര്യ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Up to ₹2.50 Lakh financial assistance for house construction",
      benefitMl: "വീട് നിർമ്മാണത്തിന് ₹2.50 ലക്ഷം വരെ ധനസഹായം",
      eligibilityEn: "Homeless or EWS households without pucca housing",
      eligibilityMl: "സ്വന്തമായി പക്കാ വീടില്ലാത്ത താഴ്ന്ന വരുമാനക്കാർ",
    },
    {
      titleEn: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
      titleMl: "പ്രധാനമന്ത്രി ആവാസ് യോജന - ഗ്രാമീൺ",
      deptEn: "Ministry of Rural Development, Govt of India",
      deptMl: "ഗ്രാമവികസന മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "₹1.20 Lakh assistance for pucca house construction",
      benefitMl: "പക്കാ വീട് നിർമ്മാണത്തിന് ₹1.20 ലക്ഷം സഹായം",
      eligibilityEn: "Houseless & kutcha-house families as per SECC",
      eligibilityMl: "SECC പ്രകാരം ഭവനരഹിത & കച്ചാ വീടുകളിലുള്ള കുടുംബങ്ങൾ",
    },
    {
      titleEn: "Pradhan Mantri Awas Yojana - Urban 2.0",
      titleMl: "പ്രധാനമന്ത്രി ആവാസ് യോജന - അർബൻ 2.0",
      deptEn: "Ministry of Housing & Urban Affairs, Govt of India",
      deptMl: "പാർപ്പിട നഗരകാര്യ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Interest subsidy & affordable rental housing support",
      benefitMl: "പലിശ സബ്‍സിഡിയും താങ്ങാനാവുന്ന വാടക ഭവന പിന്തുണയും",
      eligibilityEn: "Urban EWS / MIG families without a pucca house",
      eligibilityMl: "പക്കാ വീടില്ലാത്ത നഗര EWS / MIG കുടുംബങ്ങൾ",
    },
  ],
  law: [
    {
      titleEn: "NALSA Free Legal Aid",
      titleMl: "ദേശീയ നിയമ സേവന അതോറിറ്റി സൗജന്യ നിയമ സഹായം",
      deptEn: "Department of Justice, Govt of India",
      deptMl: "നീതി വകുപ്പ്, ഭാരത സർക്കാർ",
      benefitEn: "Free legal aid and representation in court",
      benefitMl: "കോടതിയിൽ സൗജന്യ നിയമ സഹായവും പ്രാതിനിധ്യവും",
      eligibilityEn: "Women, children, SC / ST & low-income citizens",
      eligibilityMl: "സ്ത്രീകൾ, കുട്ടികൾ, SC / ST, താഴ്ന്ന വരുമാന പൗരന്മാർ",
    },
    {
      titleEn: "Legal Aid Defence Counsel Scheme",
      titleMl: "നിയമ സഹായ പ്രതിരോധ അഭിഭാഷക പദ്ധതി",
      deptEn: "National Legal Services Authority, Govt of India",
      deptMl: "ദേശീയ നിയമ സേവന അതോറിറ്റി, ഭാരത സർക്കാർ",
      benefitEn: "Free defence counsel in criminal proceedings",
      benefitMl: "ക്രിമിനൽ കേസുകളിൽ സൗജന്യ പ്രതിരോധ അഭിഭാഷകൻ",
      eligibilityEn: "Undertrial & accused persons unable to afford counsel",
      eligibilityMl: "അഭിഭാഷക ചെലവ് താങ്ങാനാവാത്ത പ്രതികൾ",
    },
    {
      titleEn: "Victim Compensation Scheme",
      titleMl: "ഇരകൾക്കുള്ള നഷ്ടപരിഹാര പദ്ധതി",
      deptEn: "Ministry of Home Affairs, Govt of India",
      deptMl: "ആഭ്യന്തര മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Financial compensation for victims of crime",
      benefitMl: "കുറ്റകൃത്യങ്ങളിൽ ഇരകൾക്ക് സാമ്പത്തിക നഷ്ടപരിഹാരം",
      eligibilityEn: "Victims of notified crimes & their dependents",
      eligibilityMl: "നിർദ്ദിഷ്ട കുറ്റകൃത്യങ്ങളുടെ ഇരകളും ആശ്രിതരും",
    },
  ],
  science: [
    {
      titleEn: "Digital India Programme",
      titleMl: "ഡിജിറ്റൽ ഇന്ത്യ പദ്ധതി",
      deptEn: "Ministry of Electronics & IT, Govt of India",
      deptMl: "ഇലക്ട്രോണിക്സ് & ഐടി മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Digital public services & citizen e-governance access",
      benefitMl: "ഡിജിറ്റൽ പൊതു സേവനങ്ങളും ഇ-ഗവേണൻസ് പ്രവേശനവും",
      eligibilityEn: "All citizens & registered digital service users",
      eligibilityMl: "എല്ലാ പൗരന്മാരും രജിസ്റ്റർ ചെയ്ത ഡിജിറ്റൽ സേവന ഉപയോക്താക്കളും",
    },
    {
      titleEn: "PM Kaushal Vikas Yojana (PMKVY)",
      titleMl: "പിഎം കൗശൽ വികാസ് യോജന (PMKVY)",
      deptEn: "Ministry of Skill Development & Entrepreneurship, Govt of India",
      deptMl: "നൈപുണ്യ വികസന സംരംഭകത്വ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Free short-term skill training with certification",
      benefitMl: "സൗജന്യ ഹ്രസ്വകാല നൈപുണ്യ പരിശീലനവും സർട്ടിഫിക്കേഷനും",
      eligibilityEn: "Youth aged 15–45 seeking skill certification",
      eligibilityMl: "നൈപുണ്യ സർട്ടിഫിക്കേഷൻ തേടുന്ന 15–45 വയസ്സുള്ള യുവാക്കൾ",
    },
    {
      titleEn: "National Apprenticeship Promotion Scheme",
      titleMl: "ദേശീയ അപ്രന്റീസ്ഷിപ്പ് പ്രോത്സാഹന പദ്ധതി",
      deptEn: "Ministry of Skill Development & Entrepreneurship, Govt of India",
      deptMl: "നൈപുണ്യ വികസന സംരംഭകത്വ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Apprenticeship stipend support for trainees",
      benefitMl: "പരിശീലനാർത്ഥികൾക്ക് സ്റ്റൈപ്പൻഡ് പിന്തുണ",
      eligibilityEn: "Employers & ITI / diploma candidates",
      eligibilityMl: "തൊഴിലുടമകളും ITI / ഡിപ്ലോമ സ്ഥാനാർത്ഥികളും",
    },
  ],
  default: [
    {
      titleEn: "National Welfare & Financial Support Program",
      titleMl: "കേന്ദ്ര സർക്കാർ സുരക്ഷാ പദ്ധതി",
      deptEn: "Central Nodal Department, Govt of India",
      deptMl: "കേന്ദ്ര വികസന മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Direct financial assistance & subsidy transfer",
      benefitMl: "നേരിട്ടുള്ള സാമ്പത്തിക സഹായം & സബ്‍സിഡി",
      eligibilityEn: "Eligible resident citizens of India",
      eligibilityMl: "യോഗ്യരായ ഇന്ത്യൻ പൗരന്മാർ",
    },
    {
      titleEn: "PM Garib Kalyan Anna Yojana",
      titleMl: "പിഎം ഗരീബ് കല്യാൺ അന്ന യോജന",
      deptEn: "Department of Food & Public Distribution, Govt of India",
      deptMl: "ഭക്ഷ്യ-പൊതു വിതരണ വകുപ്പ്, ഭാരത സർക്കാർ",
      benefitEn: "Free foodgrain for priority household families",
      benefitMl: "മുൻഗണനാ കുടുംബങ്ങൾക്ക് സൗജന്യ ഭക്ഷ്യധാന്യം",
      eligibilityEn: "Priority household ration card holders",
      eligibilityMl: "മുൻഗണനാ റേഷൻ കാർഡ് ഉടമകൾ",
    },
    {
      titleEn: "Pradhan Mantri Ujjwala Yojana 2.0",
      titleMl: "പ്രധാനമന്ത്രി ഉജ്ജ്വല യോജന 2.0",
      deptEn: "Ministry of Petroleum & Natural Gas, Govt of India",
      deptMl: "പെട്രോളിയം-പ്രകൃതിവാതക മന്ത്രാലയം, ഭാരത സർക്കാർ",
      benefitEn: "Free LPG connection with subsidised refills",
      benefitMl: "സൗജന്യ എൽപിജി കണക്ഷനും സബ്‍സിഡി റീഫില്ലും",
      eligibilityEn: "BPL women from eligible households",
      eligibilityMl: "യോഗ്യരായ ബിപിഎൽ കുടുംബങ്ങളിലെ വനിതകൾ",
    },
  ],
};

const getMobileCentralSchemeCards = (categoryId: string) =>
  mobileCentralSchemeCardsByCategory[categoryId] ?? mobileCentralSchemeCardsByCategory.default;

const metricsByPeriod: Record<
  string,
  {
    users: number;
    beneficiaries: number;
    pending: number;
    assisted: number;
    rejected: number;
    schemes: number;
    boothCoverage: string;
    convertedBooths: string;
    slaBreaches: number;
  }
> = {
  today: {
    users: 1420,
    beneficiaries: 450,
    pending: 180,
    assisted: 410,
    rejected: 15,
    schemes: 740,
    boothCoverage: "94.2%",
    convertedBooths: "27,850",
    slaBreaches: 3,
  },
  this_week: {
    users: 12850,
    beneficiaries: 4120,
    pending: 1240,
    assisted: 3980,
    rejected: 115,
    schemes: 740,
    boothCoverage: "94.2%",
    convertedBooths: "28,210",
    slaBreaches: 18,
  },
  this_month: {
    users: 142850,
    beneficiaries: 48250,
    pending: 6160,
    assisted: 8000,
    rejected: 1420,
    schemes: 740,
    boothCoverage: "94.2%",
    convertedBooths: "28,726",
    slaBreaches: 68,
  },
  this_quarter: {
    users: 385400,
    beneficiaries: 135400,
    pending: 32800,
    assisted: 128500,
    rejected: 4300,
    schemes: 740,
    boothCoverage: "94.2%",
    convertedBooths: "29,400",
    slaBreaches: 142,
  },
  custom: {
    users: 210500,
    beneficiaries: 72100,
    pending: 18400,
    assisted: 68900,
    rejected: 2200,
    schemes: 740,
    boothCoverage: "94.2%",
    convertedBooths: "28,726",
    slaBreaches: 85,
  },
};

export function AdminMobilePreviewModal({ isOpen, onClose }: AdminMobilePreviewModalProps) {
  const { lang } = useLang();
  const [userRole, setUserRole] = useState<"state_admin" | "party_worker">("state_admin");
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isSahAiOpen, setIsSahAiOpen] = useState<boolean>(false);
  const [isGuestEligibilityOpen, setIsGuestEligibilityOpen] = useState<boolean>(false);
  const [isMobileAuthOpen, setIsMobileAuthOpen] = useState<boolean>(false);

  const handleLogout = () => {
    setIsGuest(true);
    setIsGuestEligibilityOpen(false);
    setActiveTab("overview");
    setMobileSubPage("none");
    setShowFilterMenu(false);
    setShowMoreMenu(false);
  };

  const handleLogin = () => {
    setIsGuest(false);
    setIsGuestEligibilityOpen(false);
    setActiveTab("overview");
    setMobileSubPage("none");
  };

  const openGuestEligibility = () => {
    setIsSahAiOpen(false);
    setIsGuestEligibilityOpen(true);
    setIsMobileAuthOpen(false);
    setMobileSubPage("none");
  };

  const openMobileAuth = () => {
    setIsSahAiOpen(false);
    setIsGuestEligibilityOpen(false);
    setMobileSubPage("none");
    setIsMobileAuthOpen(true);
  };

  const closeMobileAuthToGuest = () => {
    setIsMobileAuthOpen(false);
    setIsGuest(true);
    setIsGuestEligibilityOpen(false);
    setMobileSubPage("none");
  };

  const completeMobileAuth = () => {
    setIsMobileAuthOpen(false);
    handleLogin();
  };

  const handleGuestHelpRequestSent = () => {
    setIsGuest(true);
    setIsGuestEligibilityOpen(false);
    setIsSahAiOpen(false);
    setActiveTab("overview");
    setMobileSubPage("none");
  };
  const [partyWorkerTab, setPartyWorkerTab] = useState<"my_work" | "team">("my_work");
  const [activeTab, setActiveTab] = useState<AdminMobileTab>("overview");

  // Create Application Form State
  const [createFullName, setCreateFullName] = useState<string>("");
  const [createAadhaar, setCreateAadhaar] = useState<string>("");
  const [createCountryCode, setCreateCountryCode] = useState<string>("+91");
  const [createPhone, setCreatePhone] = useState<string>("");
  const [createEmail, setCreateEmail] = useState<string>("");
  const [createDob, setCreateDob] = useState<string>("");
  const [createGender, setCreateGender] = useState<string>("");
  const [createReligion, setCreateReligion] = useState<string>("");
  const [createCaste, setCreateCaste] = useState<string>("");
  const [createMaritalStatus, setCreateMaritalStatus] = useState<string>("");
  const [createOccupation, setCreateOccupation] = useState<string>("");
  const [createIncomeRange, setCreateIncomeRange] = useState<string>("");

  // Address Section
  const [createDistrict, setCreateDistrict] = useState<string>("");
  const [createLocalBodyType, setCreateLocalBodyType] = useState<LocalBodyType | "">("");
  const [createLocalBody, setCreateLocalBody] = useState<string>("");
  const [createWard, setCreateWard] = useState<string>("");
  const [createMandalam, setCreateMandalam] = useState<string>("");
  const [createHouseName, setCreateHouseName] = useState<string>("");
  const [createStreetLocality, setCreateStreetLocality] = useState<string>("");
  const [createPin, setCreatePin] = useState<string>("");
  const createState = "Kerala";

  // Address Modal Bottom Sheets & Helpers
  const [activeAddressSheet, setActiveAddressSheet] = useState<"district" | "localBody" | "ward" | "mandalam" | null>(null);
  const [addressSheetSearch, setAddressSheetSearch] = useState<string>("");
  const [isMandalamAutoFilled, setIsMandalamAutoFilled] = useState<boolean>(false);

  // Address Cascading Handlers
  const handleDistrictSelect = (districtEn: string) => {
    setCreateDistrict(districtEn);
    setCreateLocalBody("");
    setCreateWard("");
    setCreateMandalam("");
    setIsMandalamAutoFilled(false);
    setActiveAddressSheet(null);
    setAddressSheetSearch("");
  };

  const renderPartyMemberDashboard = () => {
    const activeWorkerName = lang === "ml" ? "ധ്യാനി എം എസ്" : "Dhyan M S";
    const activeWorkerRole = lang === "ml" ? "ബൂത്ത് പ്രസിഡന്റ്" : "Booth President";
    const activeWorkerLocation = lang === "ml" ? "ബൂത്ത് 1, കഴക്കൂട്ടം തിരുവനന്തപുരം" : "Booth 1, Kazhakkootam Trivandrum";

    return (
      <div className="space-y-2 animate-in fade-in duration-200">
        {/* Logged in User Header (Party Worker Mode Only) */}
        <div className="pt-0.5 pb-1 px-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-display text-sm sm:text-base font-black text-foreground truncate leading-snug">
              {lang === "ml" ? "സ്വാഗതം, " : "Welcome Back, "}{activeWorkerName}
            </h4>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              {activeWorkerRole}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-muted-foreground truncate mt-0.5">
            {activeWorkerLocation}
          </p>
        </div>

        {/* Top Underline Tabs: My Work | Team */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 -mx-3.5 px-3.5 pt-1 mb-1">
          <div className="flex items-center justify-around gap-4">
            <button
              type="button"
              onClick={() => setPartyWorkerTab("my_work")}
              className={`flex-1 flex items-center justify-center gap-1.5 pb-2.5 text-xs sm:text-sm transition-all cursor-pointer border-b-2 font-black ${
                partyWorkerTab === "my_work"
                  ? "border-[#ff5500] text-[#ff5500]"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <FileText className={`h-4 w-4 stroke-[2.2] ${partyWorkerTab === "my_work" ? "text-[#ff5500]" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{lang === "ml" ? "എന്റെ ജോലി" : "My Work"}</span>
            </button>

            <button
              type="button"
              onClick={() => setPartyWorkerTab("team")}
              className={`flex-1 flex items-center justify-center gap-1.5 pb-2.5 text-xs sm:text-sm transition-all cursor-pointer border-b-2 font-black ${
                partyWorkerTab === "team"
                  ? "border-[#ff5500] text-[#ff5500]"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Users className={`h-4 w-4 stroke-[2.2] ${partyWorkerTab === "team" ? "text-[#ff5500]" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{lang === "ml" ? "ടീം" : "Team"}</span>
            </button>
          </div>
        </div>

        {partyWorkerTab === "my_work" ? (
          <div className="space-y-2">
            {/* Header Row: Date Title Left + Action Buttons Right (<, >, Calendar, Filter) - Matching Admin View */}
            <div className="flex items-center justify-between gap-2 pt-0.5 pb-0.5 my-0">
              {/* Left Side: Bold Date/Period Title */}
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className="font-display text-[11px] sm:text-[13px] font-extrabold text-[#0a0f1d] dark:text-white tracking-tight leading-none text-left hover:text-[#ff5500] transition-colors cursor-pointer whitespace-nowrap truncate min-w-0"
                title="Click to Open Date Picker"
              >
                {getFormattedPeriodDisplay()}
              </button>

              {/* Right Side: Circular Action Buttons (Previous, Next, Calendar, Filter) */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Left Arrow (Previous Period) */}
                <button
                  type="button"
                  onClick={() => handleStepPeriod(-1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                  title="Previous Period"
                >
                  <ChevronLeft className="h-3 w-3 stroke-[2.5]" />
                </button>

                {/* Right Arrow (Next Period) */}
                <button
                  type="button"
                  onClick={() => handleStepPeriod(1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                  title="Next Period"
                >
                  <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                </button>

                {/* Calendar Icon Button */}
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(true)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer shadow-2xs"
                  title="Open Date Picker"
                >
                  <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
                </button>

                {/* Filter Button */}
                <button
                  type="button"
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer ${
                    showFilterMenu || appliedFilterChips.length > 0
                      ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30"
                      : "border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-orange-500 hover:bg-orange-50"
                  }`}
                  title="Toggle Filters"
                >
                  <Filter className={`h-3 w-3 stroke-[2.2] ${appliedFilterChips.length > 0 || showFilterMenu ? "text-white" : "text-orange-500"}`} />

                  {appliedFilterChips.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white ring-1.5 ring-white dark:ring-slate-900 animate-pulse">
                      {appliedFilterChips.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Applied Filters & Current Scope UI */}
            <MobileAppliedFiltersScope
              currentScopeTitle={filterGeoScope !== "state" ? activeLocationLabel : "All Kerala • State Level"}
              currentScopeSubLabel={filterGeoScope !== "state" ? "Sector 1, Kazhakuttam" : "All 14 Districts & 140 Constituencies"}
              onResetScope={filterGeoScope !== "state" ? () => setFilterGeoScope("state") : undefined}
              appliedFilters={dashboardFilterChips}
              onResetAllFilters={() => {
                setFilterSchemeType("all");
                setFilterSchemeCategory("all");
                setFilterDepartment("all");
                setFilterPerformance("all");
                setFilterGeoScope("state");
              }}
            />

            {/* Core Analytics KPI Grid (6 cards matching Booth Level sample counts for Party Worker) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* 1. Application Received */}
              <div
                onClick={() => {
                  setActiveTab("applications");
                  setMobileSubPage("none");
                  setApplicationStatusFilter("all");
                  setApplicationSearchQuery("");
                }}
                className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-blue-500/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate leading-tight">
                    {lang === "ml" ? "ലഭിച്ച അപേക്ഷകൾ" : "Applications Received"}
                  </span>
                  <img src={openApplication3dIcon} alt="Applications Received" className="h-6 w-6 object-contain shrink-0" />
                </div>
                <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-0.5">
                  45
                </p>
              </div>

              {/* 2. Submitted */}
              <div
                onClick={() => {
                  setActiveTab("applications");
                  setMobileSubPage("none");
                  setApplicationStatusFilter("applied");
                }}
                className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-sky-500/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                    {lang === "ml" ? "സമർപ്പിച്ചവ" : "Submitted"}
                  </span>
                  <img src={readyToSubmit3dIcon} alt="Submitted" className="h-6 w-6 object-contain shrink-0" />
                </div>
                <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-0.5">
                  32
                </p>
              </div>

              {/* 3. Beneficiaries */}
              <div
                onClick={() => setMobileSubPage("beneficiaries")}
                className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-emerald-500/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                    {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                  </span>
                  <img src={assisted3dIcon} alt="Beneficiaries" className="h-6 w-6 object-contain shrink-0" />
                </div>
                <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-0.5">
                  24
                </p>
              </div>

              {/* 4. In Review */}
              <div
                onClick={() => {
                  setActiveTab("applications");
                  setMobileSubPage("none");
                  setApplicationStatusFilter("review");
                }}
                className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-indigo-500/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                    {lang === "ml" ? "പരിശോധനയിലുള്ളവ" : "In Review"}
                  </span>
                  <img src={documentsPending3dIcon} alt="In Review" className="h-6 w-6 object-contain shrink-0" />
                </div>
                <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-0.5">
                  06
                </p>
              </div>

              {/* 5. Pending Submission */}
              <div
                onClick={() => {
                  setActiveTab("applications");
                  setMobileSubPage("none");
                  setApplicationStatusFilter("application_received");
                }}
                className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-amber-500/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                    {lang === "ml" ? "പെൻഡിംഗ് സമർപ്പണം" : "Pending Submission"}
                  </span>
                  <img src={followupsDue3dIcon} alt="Pending Submission" className="h-6 w-6 object-contain shrink-0" />
                </div>
                <p className="font-display text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 leading-none mt-0.5">
                  13
                </p>
              </div>

              {/* 6. Rejected */}
              <div
                onClick={() => {
                  setActiveTab("applications");
                  setMobileSubPage("none");
                  setApplicationStatusFilter("rejected");
                }}
                className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-rose-500/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                    {lang === "ml" ? "നിരസിച്ചവ" : "Rejected"}
                  </span>
                  <img src={rejected3dIcon} alt="Rejected" className="h-6 w-6 object-contain shrink-0" />
                </div>
                <p className="font-display text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 leading-none mt-0.5">
                  02
                </p>
              </div>
            </div>

            {/* SECTION: Events & Announcements - Matching Admin View */}
            <div className="space-y-1.5 pt-1">
              {/* Section Header */}
              <div className="flex items-center justify-between px-0.5 pb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                    <Megaphone className="h-3.5 w-3.5 stroke-[2.2]" />
                  </span>
                  <h3 className="font-display text-xs sm:text-[13px] font-black text-[#0a0f1d] dark:text-white tracking-tight truncate">
                    {lang === "ml" ? "പരിപാടികളും അറിയിപ്പുകളും" : "Events & Announcements"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSubPage("events_announcements")}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#ff5500] hover:text-orange-600 transition-colors cursor-pointer shrink-0"
                >
                  <span>{lang === "ml" ? "എല്ലാം" : "View All"}</span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3b30] text-white text-[9.5px] font-black shadow-2xs">
                    3
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#ff5500] stroke-[2.5]" />
                </button>
              </div>

              {/* Single Unified Carousel */}
              {(() => {
                const mergedSlides = [
                  {
                    type: "banner_image",
                    bannerImg: "/images/pm_schemes_explore_now.png",
                    title: "Explore PM Schemes",
                    isUnread: true,
                  },
                  {
                    type: "event",
                    dateMonth: "OCT",
                    dateDay: "15",
                    dateYear: "2026",
                    ribbon: "BOOTH CONVENTION",
                    ribbonMl: "ബൂത്ത് സമ്മേളനം",
                    title: "VIKASITA KERALAM SAMMELAN 2026",
                    subtitle: "Statewide Mega Booth Worker Convention in TVM",
                    subtitleMl: "സംസ്ഥാനതല മെഗാ ബൂത്ത് സമ്മേളനം",
                    ctaText: "REGISTER NOW",
                    ctaTextMl: "രജിസ്റ്റർ ചെയ്യുക",
                    rightGradient: "from-[#800f13] via-[#a3161a] to-[#4f080b]",
                    accentBorder: "border-[#800f13]",
                    dateBadgeBg: "bg-white text-[#800f13]",
                    yearTagBg: "bg-red-50 text-[#800f13] border-red-200/80",
                    isUnread: true,
                  },
                  {
                    type: "announcement",
                    ribbon: "MODI'S GUARANTEE",
                    ribbonMl: "മോദിയുടെ ഗ്യാരണ്ടി",
                    ribbonBg: "bg-red-500 text-white font-black",
                    title: "SABKA SAATH · SABKA VIKAS",
                    subtitle: "Sabka Vishwas · Sabka Prayaas (2047 Vision)",
                    subtitleMl: "സബ്കാ സാഥ്, സബ്കാ വികാസ്, സബ്കാ വിശ്വാസ്",
                    cardStyle: "bg-gradient-to-r from-[#800f13] via-[#a3161a] to-[#590a0d] text-white shadow-md border border-red-900/50",
                    titleColor: "text-white font-extrabold",
                    subTitleColor: "text-red-100/95 font-medium",
                    rightGraphicBg: "bg-red-950/70 border-red-400/40",
                    isUnread: true,
                  },
                  {
                    type: "event",
                    dateMonth: "NOV",
                    dateDay: "02",
                    dateYear: "2026",
                    ribbon: "YOUTH RALLY",
                    ribbonMl: "യുവമോർച്ച റാലി",
                    title: "YUVA VIKAS YATRA & CONCLAVE",
                    subtitle: "50,000+ Youth Leaders Gathering in TVM",
                    subtitleMl: "തിരുവനന്തപുരത്ത് 50,000+ യുവ പ്രതിനിധികൾ",
                    ctaText: "JOIN YATRA",
                    ctaTextMl: "പങ്കെടുക്കുക",
                    rightGradient: "from-[#ea580c] via-[#c2410c] to-[#9a3412]",
                    accentBorder: "border-[#ea580c]",
                    dateBadgeBg: "bg-white text-[#c2410c]",
                    yearTagBg: "bg-orange-50 text-[#c2410c] border-orange-200/80",
                    isUnread: true,
                  },
                  {
                    type: "announcement",
                    ribbon: "PM KISAN SAMMAN",
                    ribbonMl: "പി.എം കിസാൻ",
                    ribbonBg: "bg-amber-400 text-amber-950 font-black",
                    title: "DIRECT BENEFIT TRANSFER ₹6,000",
                    subtitle: "Empowering 35 Lakh Farmers Across Kerala",
                    subtitleMl: "കേരളത്തിലെ 35 ലക്ഷം കർഷകർക്ക് നേട്ടങ്ങൾ",
                    cardStyle: "bg-gradient-to-r from-[#15803d] via-emerald-700 to-[#065f46] text-white shadow-md border border-emerald-600/50",
                    titleColor: "text-white font-extrabold",
                    subTitleColor: "text-emerald-100/95 font-medium",
                    rightGraphicBg: "bg-emerald-950/70 border-amber-300/40",
                    isUnread: false,
                  },
                  {
                    type: "event",
                    dateMonth: "NOV",
                    dateDay: "20",
                    dateYear: "2026",
                    ribbon: "BENEFICIARY MEET",
                    ribbonMl: "ഗുണഭോക്തൃ സംഗമം",
                    title: "CENTRAL SCHEMES EXPO",
                    subtitle: "Interactive Session with Union Ministers at Kochi",
                    subtitleMl: "കേന്ദ്ര മന്ത്രിമാരുമായുള്ള ഗുണഭോക്തൃ സംവാദം",
                    ctaText: "ATTEND EXPO",
                    ctaTextMl: "സന്ദർശിക്കുക",
                    rightGradient: "from-[#0d9488] via-[#0f766e] to-[#115e59]",
                    accentBorder: "border-[#0d9488]",
                    dateBadgeBg: "bg-white text-[#0f766e]",
                    yearTagBg: "bg-teal-50 text-[#0f766e] border-teal-200/80",
                    isUnread: false,
                  },
                  {
                    type: "announcement",
                    ribbon: "AYUSHMAN BHARAT",
                    ribbonMl: "ആയുഷ്മാൻ ഭാരത്",
                    ribbonBg: "bg-[#ff5500] text-white font-black",
                    title: "FREE HEALTH COVERAGE UP TO ₹5 LAKH",
                    subtitle: "Cashless Medical Treatment for All Families",
                    subtitleMl: "സൗജന്യ സമഗ്ര കുടുംബ ആരോഗ്യ സുരക്ഷാ പദ്ധതി",
                    cardStyle: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/90 dark:border-slate-800",
                    titleColor: "text-slate-900 dark:text-white font-extrabold",
                    subTitleColor: "text-slate-700 dark:text-slate-200 font-medium",
                    rightGraphicBg: "bg-orange-50 dark:bg-slate-800 border-orange-200 dark:border-slate-700",
                    isUnread: false,
                  },
                  {
                    type: "event",
                    dateMonth: "DEC",
                    dateDay: "10",
                    dateYear: "2026",
                    ribbon: "MAHILA SAMMELAN",
                    ribbonMl: "മഹിളാ സമ്മേളനം",
                    title: "NARI SHAKTI VIKAS CONCLAVE",
                    subtitle: "Empowering Women Entrepreneurs in Kozhikode",
                    subtitleMl: "വനിതാ സംരംഭകത്വ സംസ്ഥാന സമ്മേളനം",
                    ctaText: "GET PASS",
                    ctaTextMl: "പാസ് നേടുക",
                    rightGradient: "from-[#15803d] via-[#166534] to-[#14532d]",
                    accentBorder: "border-[#15803d]",
                    dateBadgeBg: "bg-white text-[#166534]",
                    yearTagBg: "bg-emerald-50 text-[#166534] border-emerald-200/80",
                    isUnread: false,
                  },
                ];

                const slide = mergedSlides[announcementIndex % mergedSlides.length];

                if (slide.type === "banner_image") {
                  return (
                    <div
                      onClick={() => setMobileSubPage("events_announcements")}
                      className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs h-[80px] w-full cursor-pointer group transition-all duration-500"
                    >
                      <img
                        src={slide.bannerImg}
                        alt="Explore PM Schemes - Viksit Bharat"
                        className="h-full w-full object-fill group-hover:scale-102 transition-transform duration-300"
                      />
                      {slide.isUnread && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block shadow-xs" />
                        </div>
                      )}
                    </div>
                  );
                }

                if (slide.type === "event") {
                  return (
                    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-[80px] flex items-center justify-between transition-all duration-500">
                      {/* Left Content Area (White background with black pill CTA) */}
                      <div className="flex-1 min-w-0 h-full p-2.5 pl-3 pr-3 flex flex-col justify-between z-10">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h4 className="font-display text-[11.5px] sm:text-[12px] font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate">
                              {slide.title}
                            </h4>
                            {slide.isUnread && (
                              <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block" />
                            )}
                          </div>
                          <p className="text-[9.5px] font-medium text-slate-600 dark:text-slate-300 leading-tight line-clamp-1">
                            {lang === "ml" ? slide.subtitleMl : slide.subtitle}
                          </p>
                        </div>
                        <div className="pt-0.5">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("recent_activity")}
                            className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8px] font-black tracking-wider uppercase shadow-xs transition-transform active:scale-95 cursor-pointer"
                          >
                            {lang === "ml" ? slide.ctaTextMl : slide.ctaText}
                          </button>
                        </div>
                      </div>

                      {/* Right Angular Geometric Section */}
                      <div className="relative h-full w-[38%] shrink-0 flex items-center justify-center overflow-hidden pr-0.5">
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.rightGradient} [clip-path:polygon(20%_0%,100%_0%,100%_100%,0%_100%,15%_50%)]`} />
                        <div className={`absolute inset-0 border-l-2 ${slide.accentBorder} opacity-80 [clip-path:polygon(20%_0%,25%_0%,20%_50%,25%_100%,20%_100%,15%_50%)]`} />

                        <div className={`relative z-10 rounded-lg px-2 py-0.5 flex flex-col items-center justify-center text-center ${slide.dateBadgeBg} min-w-[48px] shadow-md border border-white/60`}>
                          <span className="block text-[8px] font-black uppercase tracking-wider leading-none">{slide.dateMonth}</span>
                          <span className="block text-[15px] font-black leading-tight my-0.5 tracking-tight">{slide.dateDay}</span>
                          <span className={`block text-[7px] font-black tracking-widest leading-none px-1 py-0.5 rounded-xs border ${slide.yearTagBg}`}>
                            {slide.dateYear}
                          </span>
                        </div>

                        <div className="absolute top-1 right-1 z-20 h-5 w-5 rounded-full bg-amber-400 border border-white/80 p-0.5 flex items-center justify-center shadow-xs">
                          <img src={officialLotus} alt="Lotus" className="h-3.5 w-3.5 object-contain" />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className={`relative overflow-hidden rounded-xl ${slide.cardStyle} p-2 px-2.5 h-[80px] flex flex-col justify-between transition-all duration-500`}>
                    {/* Top Right Ribbon */}
                    <div className="absolute top-0 right-0 z-10">
                      <div className={`rounded-bl-md px-2 py-0.5 text-[7px] font-black uppercase tracking-wider shadow-xs ${slide.ribbonBg}`}>
                        {lang === "ml" ? slide.ribbonMl : slide.ribbon}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 flex-1 min-h-0">
                      <div className={`shrink-0 h-9 w-9 rounded-full border ${slide.rightGraphicBg} p-0.5 flex items-center justify-center shadow-xs overflow-hidden`}>
                        <img
                          src={officialLotus}
                          alt="Lotus Emblem"
                          className="h-5.5 w-5.5 object-contain drop-shadow-xs"
                        />
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col justify-center h-full pr-1 text-left space-y-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className={`font-display text-[12px] sm:text-[12.5px] font-extrabold leading-tight tracking-tight truncate ${slide.titleColor}`}>
                            {slide.title}
                          </h4>
                          {slide.isUnread && (
                            <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block" />
                          )}
                        </div>
                        <p className={`text-[9.5px] leading-tight line-clamp-2 ${slide.subTitleColor}`}>
                          {lang === "ml" ? slide.subtitleMl : slide.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {renderLatestSavedApplicationsSection()}

            {/* SECTION: Needs attention - Matching Admin View */}
            <div className="space-y-1.5 pt-1">
              {/* Section Header */}
              <div className="flex items-center justify-between px-0.5 pb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                    <AlertCircle className="h-3.5 w-3.5 stroke-[2.2]" />
                  </span>
                  <h3 className="font-display text-xs sm:text-[13px] font-black text-[#0a0f1d] dark:text-white tracking-tight truncate">
                    {lang === "ml" ? "ശ്രദ്ധ ആവശ്യമുണ്ട്" : "Needs attention"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("applications")}
                  className="flex items-center gap-0.5 text-[11px] font-bold text-[#f95700] hover:underline cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><span>{lang === "ml" ? "എല്ലാം" : "View all"}</span><span className="rounded-full bg-orange-500/10 dark:bg-orange-950/40 text-[#f95700] px-1.5 py-0.5 text-[9.5px] font-black leading-none border border-orange-200/80 dark:border-orange-900/50">{2 + followUpCollectionRecords.length}</span></span>
                  <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Needs Attention Items */}
              <div className="space-y-2">
                {followUpCollectionRecords.map((record) => (
                  <div
                    key={record.reference}
                    onClick={() => openCollectionRecordView(record, "needs_attention")}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-xs shrink-0">
                        {getApplicantInitials(record.applicantName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-[12px] sm:text-[12.5px] text-slate-900 dark:text-white leading-tight truncate">
                          {record.applicantName}
                        </h4>
                        <p className="font-medium text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                          {lang === "ml" ? record.scheme.titleMl : record.scheme.titleEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="flex items-center gap-1.5 rounded-full bg-[#fff4ed] dark:bg-orange-950/50 border border-[#ffebd9] dark:border-orange-900/50 px-2.5 py-1 text-[10px] font-bold text-[#f95700] dark:text-orange-400">
                        <Calendar className="h-3.5 w-3.5 text-[#f95700]" />
                        <span className="whitespace-nowrap">
                          {record.followUpDate
                            ? formatCollectionDate(record.followUpDate)
                            : lang === "ml"
                              ? `${record.missingItems.length} ബാക്കി`
                              : `${record.missingItems.length} missing`}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}

                {/* Item 1: Meera Nair */}
                <div
                  onClick={() => setActiveTab("applications")}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 font-extrabold text-xs shrink-0">
                      MN
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-[12px] sm:text-[12.5px] text-slate-900 dark:text-white leading-tight truncate">
                        {lang === "ml" ? "മീര നായർ" : "Meera Nair"}
                      </h4>
                      <p className="font-medium text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                        {lang === "ml" ? "പി.എം വിശ്വകർമ്മ" : "PM Vishwakarma"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-[#fff4ed] dark:bg-orange-950/50 border border-[#ffebd9] dark:border-orange-900/50 px-2.5 py-1 text-[10px] font-bold text-[#f95700] dark:text-orange-400">
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#f95700] text-white text-[8.5px] font-black leading-none">!</span>
                      <span>{lang === "ml" ? "1 രേഖ വിട്ടുപോയി" : "1 document missing"}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Item 2: Ravi Kumar */}
                <div
                  onClick={() => setActiveTab("applications")}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-xs shrink-0">
                      RK
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-[12px] sm:text-[12.5px] text-slate-900 dark:text-white leading-tight truncate">
                        {lang === "ml" ? "രവി കുമാർ" : "Ravi Kumar"}
                      </h4>
                      <p className="font-medium text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                        {lang === "ml" ? "പി.എം സ്വനിധി" : "PM SVANidhi"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-[#fff4ed] dark:bg-orange-950/50 border border-[#ffebd9] dark:border-orange-900/50 px-2.5 py-1 text-[10px] font-bold text-[#f95700] dark:text-orange-400">
                      <Calendar className="h-3.5 w-3.5 text-[#f95700]" />
                      <span>{lang === "ml" ? "ഇന്ന് തുടർനടപടി" : "Follow-up due today"}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Team Tab Content */
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5 pt-0.5">
              <h2 className="font-display text-sm sm:text-base font-black text-[#0a0f1d] dark:text-white tracking-tight">
                {lang === "ml" ? "ടീം പ്രവർത്തനം" : "Team Performance"}
              </h2>
              <span className="text-xs font-extrabold text-[#ea580c] bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full">
                Booth 42
              </span>
            </div>

            {/* Team Metrics Summary */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Workers</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">18</p>
              </div>
              <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Applications Done</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">142</p>
              </div>
            </div>

            {/* Leaderboard Callout */}
            <div
              onClick={() => setMobileSubPage("leaderboard")}
              className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-3 text-white shadow-md cursor-pointer hover:opacity-95 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="h-6 w-6 text-amber-200 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm">Booth Leaderboard #1</h4>
                  <p className="text-[11px] text-orange-100 font-medium">Kazhakkoottam Mandalam</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white shrink-0" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleLocalBodyTypeSelect = (type: LocalBodyType) => {
    setCreateLocalBodyType(type);
    setCreateLocalBody("");
    setCreateWard("");
    setCreateMandalam("");
    setIsMandalamAutoFilled(false);
  };

    const handleLocalBodySelect = (lbName: string) => {
    setCreateLocalBody(lbName);
    setCreateWard("");
    setCreateMandalam("");
    setIsMandalamAutoFilled(false);
    setActiveAddressSheet(null);
    setAddressSheetSearch("");
  };

    const handleWardSelect = (wardItem: WardItem) => {
    const wardDisplay = `Ward ${wardItem.number} - ${lang === "ml" ? wardItem.nameMl : wardItem.nameEn}`;
    setCreateWard(wardDisplay);

    // Auto-map Assembly Mandalam if single reliable mapping
    const mappedConst = getMappedConstituencyForWard(createLocalBody, wardDisplay);
    if (mappedConst) {
      setCreateMandalam(mappedConst.en);
      setIsMandalamAutoFilled(true);
    } else {
      if (isMandalamAutoFilled) {
        setCreateMandalam("");
      }
      setIsMandalamAutoFilled(false);
    }

    setActiveAddressSheet(null);
    setAddressSheetSearch("");
  };

    const handleMandalamSelect = (mandalamEn: string) => {
    setCreateMandalam(mandalamEn);
    setIsMandalamAutoFilled(false);
    setActiveAddressSheet(null);
    setAddressSheetSearch("");
  };

    const isCreateFormValid = Boolean(
    createFullName.trim() &&
    createAadhaar.trim() &&
    createPhone.trim() &&
    createDob.trim() &&
    createGender.trim() &&
    createReligion.trim() &&
    createCaste.trim() &&
    createMaritalStatus.trim() &&
    createOccupation.trim() &&
    createIncomeRange.trim() &&
    createDistrict.trim() &&
    createLocalBodyType &&
    createLocalBody.trim() &&
    createWard.trim() &&
    createMandalam.trim() &&
    createHouseName.trim() &&
    createStreetLocality.trim() &&
    createPin.trim()
  );

  // Create Application Flow Steps State
  const [createFlowStep, setCreateFlowStep] = useState<MobileCreateFlowStep>("form");
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<boolean>(false);
  const [eligibleSchemesSearchQuery, setEligibleSchemesSearchQuery] = useState<string>("");
  const [isSingleSchemeEligible, setIsSingleSchemeEligible] = useState<boolean>(true);
  const [showEligibilityDetails, setShowEligibilityDetails] = useState<boolean>(true);
  const [selectedEligibleScheme, setSelectedEligibleScheme] = useState<MobileEligibleScheme | null>(null);
  const [selectedEligibleSchemeIds, setSelectedEligibleSchemeIds] = useState<string[]>([]);
  const [schemeDetailsReturnStep, setSchemeDetailsReturnStep] = useState<"eligibility_result" | "eligible_schemes" | "selected_schemes" | "applicant_applications" | "app_detail">("eligible_schemes");
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, string>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [bankAccountNumber, setBankAccountNumber] = useState<string>("");
  const [bankIfscCode, setBankIfscCode] = useState<string>("");
  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(false);
  const [finalMinorityStatus, setFinalMinorityStatus] = useState<string>("");
  const [finalDisabilityStatus, setFinalDisabilityStatus] = useState<string>("");
  const [finalStudentStatus, setFinalStudentStatus] = useState<string>("");
  const [finalEmploymentStatus, setFinalEmploymentStatus] = useState<string>("");
  const [finalBplStatus, setFinalBplStatus] = useState<string>("");
  const [finalFinancialHardshipStatus, setFinalFinancialHardshipStatus] = useState<string>("");
  const [finalAnnualFamilyIncome, setFinalAnnualFamilyIncome] = useState<string>("");
  const [finalResidenceArea, setFinalResidenceArea] = useState<string>("");
  const [pmKisanDetails, setPmKisanDetails] = useState<PmKisanCollectionDetails>(createEmptyPmKisanDetails);
  const [finalDetailsInvalidFields, setFinalDetailsInvalidFields] = useState<string[]>([]);
  const [finalDetailsSaveNotice, setFinalDetailsSaveNotice] = useState<"invalid" | "incomplete" | null>(null);
  const [mobileCollectionRecords, setMobileCollectionRecords] = useState<MobileCollectionRecord[]>([]);
  const [latestSavedApplicationRefs, setLatestSavedApplicationRefs] = useState<string[]>([]);
  const [savedApplicationRecords, setSavedApplicationRecords] = useState<MobileApplicationRecord[]>([]);
  const [activeCollectionReference, setActiveCollectionReference] = useState<string>("");
  const [activeApplicantApplicationRefs, setActiveApplicantApplicationRefs] = useState<string[]>([]);
  const [collectionRecordReturnStep, setCollectionRecordReturnStep] = useState<MobileCollectionRecordReturnStep>("collection_saved");
  const [isFollowUpSheetOpen, setIsFollowUpSheetOpen] = useState<boolean>(false);
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [followUpNotes, setFollowUpNotes] = useState<string>("");
  const [followUpMissingItems, setFollowUpMissingItems] = useState<MobileMissingItem[]>([]);
  const [followUpDateError, setFollowUpDateError] = useState<string>("");
  const collectionReferenceCounter = useRef<number>(849202);
  const savedApplicationRefCounter = useRef<number>(9401);
  const mobileContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mobileContentRef.current?.scrollTo({ top: 0 });
  }, [createFlowStep]);

  const mockEligibleSchemesList: MobileEligibleScheme[] = [
    {
      id: "SCH-001",
      titleEn: "PM Kisan Samman Nidhi",
      titleMl: "പി.എം. കിസാൻ സമ്മാൻ നിധി",
      benefitEn: "₹6,000 / year direct benefit transfer in 3 installments for eligible farmers.",
      benefitMl: "കർഷകർക്ക് പ്രതിവർഷം ₹6,000 ധനസഹായം (3 ഗഡുക്കളായി നേരിട്ട് ബാങ്ക് അക്കൗണ്ടിലേക്ക്).",
      matchLabelEn: "100% Match",
      matchLabelMl: "100% യോഗ്യത",
      deptEn: "Agriculture Department",
      deptMl: "കൃഷി വകുപ്പ്",
      categoryEn: "Central Government",
      categoryMl: "കേന്ദ്ര സർക്കാർ",
      requiredDocEn: "Land Record / Revenue Tax Receipt Copy",
      requiredDocMl: "കരം അടച്ച രസീത് / ഭൂമി ഉടമസ്ഥാവകാശ രേഖ",
      requiredFieldKeys: [],
    },
    {
      id: "SCH-002",
      titleEn: "Ayushman Bharat PM-JAY",
      titleMl: "ആയുഷ്മാൻ ഭാരത് പിഎം-ജയ്",
      benefitEn: "Up to ₹5,00,000 per family per year for secondary and tertiary hospitalization.",
      benefitMl: "കുടുംബത്തിന് പ്രതിവർഷം ₹5,00,000 വരെയുള്ള സൗജന്യ ആശുപത്രി ചികിത്സാ പരിരക്ഷ.",
      matchLabelEn: "96% Match",
      matchLabelMl: "96% യോഗ്യത",
      deptEn: "National Health Authority",
      deptMl: "ദേശീയ ആരോഗ്യ അതോറിറ്റി",
      categoryEn: "Central Government",
      categoryMl: "കേന്ദ്ര സർക്കാർ",
      requiredDocEn: "Ration Card / SECC Verification Copy",
      requiredDocMl: "റേഷൻ കാർഡ് / SECC സ്ഥിരീകരണ പകർപ്പ്",
      requiredFieldKeys: ["bankAccountNumber", "bankIfscCode", "bplStatus", "residenceArea"],
    },
    {
      id: "SCH-003",
      titleEn: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
      titleMl: "പ്രധാനമന്ത്രി ആവാസ് യോജന - ഗ്രാമീൺ (PMAY-G)",
      benefitEn: "Up to ₹1,20,000 assistance for constructing a pucca house for eligible rural families.",
      benefitMl: "യോഗ്യരായ ഗ്രാമീണ കുടുംബങ്ങൾക്ക് പക്കാ വീട് നിർമ്മാണത്തിന് ₹1,20,000 വരെ ധനസഹായം.",
      matchLabelEn: "92% Match",
      matchLabelMl: "92% യോഗ്യത",
      deptEn: "Ministry of Rural Development",
      deptMl: "ഗ്രാമവികസന മന്ത്രാലയം",
      categoryEn: "Central Government",
      categoryMl: "കേന്ദ്ര സർക്കാർ",
      requiredDocEn: "Land Ownership Title / Possessory Certificate",
      requiredDocMl: "ഭൂമി ഉടമസ്ഥാവകാശ സാക്ഷ്യപത്രം",
      requiredFieldKeys: ["bankAccountNumber", "bankIfscCode", "bplStatus", "residenceArea"],
    },
    {
      id: "SCH-004",
      titleEn: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
      titleMl: "ഇന്ദിരാഗാന്ധി ദേശീയ വാർദ്ധക്യ പെൻഷൻ പദ്ധതി (IGNOAPS)",
      benefitEn: "Monthly central pension assistance for BPL senior citizens aged 60 and above.",
      benefitMl: "60 വയസ്സിന് മുകളിലുള്ള ബിപിഎൽ മുതിർന്ന പൗരന്മാർക്ക് പ്രതിമാസ കേന്ദ്ര പെൻഷൻ സഹായം.",
      matchLabelEn: "88% Match",
      matchLabelMl: "88% യോഗ്യത",
      deptEn: "Ministry of Rural Development",
      deptMl: "ഗ്രാമവികസന മന്ത്രാലയം",
      categoryEn: "Central Government",
      categoryMl: "കേന്ദ്ര സർക്കാർ",
      requiredDocEn: "Aadhaar / Age Proof & Bank Passbook Copy",
      requiredDocMl: "വയസ് തെളിയിക്കുന്ന രേഖ & ബാങ്ക് പാസ്ബുക്ക് പകർപ്പ്",
      requiredDocuments: [
        {
          id: "ageProof",
          labelEn: "Aadhaar / Age Proof Copy",
          labelMl: "ആധാർ / വയസ് തെളിയിക്കുന്ന രേഖയുടെ പകർപ്പ്",
        },
        {
          id: "bankPassbook",
          labelEn: "Bank Passbook Copy",
          labelMl: "ബാങ്ക് പാസ്ബുക്ക് പകർപ്പ്",
        },
      ],
      requiredFieldKeys: ["bankAccountNumber", "bankIfscCode", "minorityStatus", "disabilityStatus", "studentStatus", "bplStatus", "residenceArea"],
    },
  ];

  const toggleEligibleSchemeSelection = (schemeId: string) => {
    setSelectedEligibleSchemeIds((current) =>
      current.includes(schemeId)
        ? current.filter((id) => id !== schemeId)
        : [...current, schemeId]
    );
  };

  const mobileFieldLabels: Record<MobileSchemeFieldKey, { labelEn: string; labelMl: string }> = {
    bankAccountNumber: { labelEn: "Bank account number", labelMl: "ബാങ്ക് അക്കൗണ്ട് നമ്പർ" },
    bankIfscCode: { labelEn: "Bank IFSC code", labelMl: "ബാങ്ക് IFSC കോഡ്" },
    minorityStatus: { labelEn: "Minority status", labelMl: "ന്യൂനപക്ഷ പദവി" },
    disabilityStatus: { labelEn: "Person with a disability", labelMl: "വൈകല്യമുള്ള വ്യക്തി" },
    studentStatus: { labelEn: "Student status", labelMl: "വിദ്യാർത്ഥി പദവി" },
    bplStatus: { labelEn: "BPL status", labelMl: "ബിപിഎൽ നില" },
    residenceArea: { labelEn: "Area of residence", labelMl: "താമസ മേഖല" },
  };

  const getSchemeCategoryLabel = (scheme: MobileEligibleScheme) => {
    if (scheme.id === "SCH-001") return { en: "Agriculture", ml: "കൃഷി" };
    if (scheme.id === "SCH-002") return { en: "Health & Wellness", ml: "ആരോഗ്യവും ക്ഷേമവും" };
    if (scheme.id === "SCH-003") return { en: "Housing", ml: "ഭവനം" };
    if (scheme.id === "SCH-004") return { en: "Social Welfare", ml: "സാമൂഹിക ക്ഷേമം" };
    return { en: scheme.categoryEn, ml: scheme.categoryMl };
  };

  const getSchemeRequiredFieldKeys = (scheme: MobileEligibleScheme | null) => {
    if (isPmKisanScheme(scheme)) return [];
    return scheme?.requiredFieldKeys || (Object.keys(mobileFieldLabels) as MobileSchemeFieldKey[]);
  };

  const getSchemeRequiredDocuments = (scheme: MobileEligibleScheme | null): MobileSchemeDocument[] => {
    if (!scheme) return [];
    if (scheme.requiredDocuments?.length) return scheme.requiredDocuments;
    return [{ id: "requiredDocument", labelEn: scheme.requiredDocEn, labelMl: scheme.requiredDocMl }];
  };

  const isPmKisanScheme = (scheme: MobileEligibleScheme | null) =>
    scheme?.id === "SCH-001" || /pm[\s-]*kisan/i.test(scheme?.titleEn ?? "");

  const pmKisanReviewCutoffDate = "2019-02-01";

  const getPmKisanMissingItems = (details: PmKisanCollectionDetails): MobileMissingItem[] =>
    pmKisanQuestions.flatMap((question) => {
      if (question.type === "choice") {
        return details[question.key]
          ? []
          : [{ key: `pmKisan:${question.key}`, labelEn: question.labelEn, labelMl: question.labelMl, kind: "field" as const }];
      }
      return details.landAcquiredDate || details.landAcquisitionNotSure
        ? []
        : [{ key: `pmKisan:${question.key}`, labelEn: question.labelEn, labelMl: question.labelMl, kind: "field" as const }];
    });

  const isPmKisanAcquisitionAfterCutoff = (details: PmKisanCollectionDetails) =>
    Boolean(details.landAcquiredDate) && details.landAcquiredDate > pmKisanReviewCutoffDate;

  const getPmKisanAnswerLabel = (
    details: PmKisanCollectionDetails,
    question: PmKisanQuestion,
    displayLang: "en" | "ml"
  ) => {
    if (question.type === "date") {
      if (details.landAcquisitionNotSure) return displayLang === "ml" ? "ഉറപ്പില്ല" : "Not sure";
      return details.landAcquiredDate ? formatCollectionDate(details.landAcquiredDate) : "—";
    }
    const option = question.options.find((item) => item.value === details[question.key]);
    if (!option) return "—";
    return displayLang === "ml" ? option.labelMl : option.labelEn;
  };

  const getUploadedDocumentsForRecord = (record: MobileCollectionRecord | null) => {
    const requiredDocuments = getSchemeRequiredDocuments(record?.scheme ?? null);
    const storedDocuments = record?.uploadedDocuments ? { ...record.uploadedDocuments } : {};
    const firstRequiredDocument = requiredDocuments[0];
    if (record?.uploadedDocName && firstRequiredDocument && !storedDocuments[firstRequiredDocument.id]) {
      storedDocuments[firstRequiredDocument.id] = record.uploadedDocName;
    }
    return storedDocuments;
  };

  const getDocumentMissingItem = (document: MobileSchemeDocument): MobileMissingItem => ({
    key: `document:${document.id}`,
    labelEn: `Required document: ${document.labelEn}`,
    labelMl: `ആവശ്യമായ രേഖ: ${document.labelMl}`,
    kind: "document",
  });

  const getRequiredItemsForScheme = (scheme: MobileEligibleScheme): MobileMissingItem[] => [
    ...getSchemeRequiredDocuments(scheme).map(getDocumentMissingItem),
    ...(isPmKisanScheme(scheme) ? getPmKisanMissingItems(createEmptyPmKisanDetails()) : []),
    ...getSchemeRequiredFieldKeys(scheme).map((key) => ({
      key,
      labelEn: mobileFieldLabels[key].labelEn,
      labelMl: mobileFieldLabels[key].labelMl,
      kind: "field" as const,
    })),
    { key: "declaration", labelEn: "Declaration confirmation", labelMl: "സത്യവാങ്മൂലം സ്ഥിരീകരണം", kind: "field" },
  ];

  const getApplicationRecordForScheme = (schemeId: string) => {
    const applicantName = createFullName.trim() || "Applicant";
    const scopedRecords = mobileCollectionRecords.filter((record) => record.scheme.id === schemeId);
    return (
      scopedRecords.find((record) => activeApplicantApplicationRefs.includes(record.reference))
      || scopedRecords.find((record) => record.applicantName === applicantName)
      || null
    );
  };

  const hydrateDetailsFromRecord = (
    record: MobileCollectionRecord | null,
    sharedRecord?: MobileCollectionRecord | null
  ) => {
    setUploadedDocuments(getUploadedDocumentsForRecord(record));
    setUploadErrors({});
    setBankAccountNumber(record?.bankAccountNumber || sharedRecord?.bankAccountNumber || "");
    setBankIfscCode(record?.bankIfscCode || sharedRecord?.bankIfscCode || "");
    setFinalMinorityStatus(record?.minorityStatus || sharedRecord?.minorityStatus || "");
    setFinalDisabilityStatus(record?.disabilityStatus || sharedRecord?.disabilityStatus || "");
    setFinalStudentStatus(record?.studentStatus || sharedRecord?.studentStatus || "");
    setFinalEmploymentStatus(record?.employmentStatus || sharedRecord?.employmentStatus || "");
    setFinalBplStatus(record?.bplStatus || sharedRecord?.bplStatus || "");
    setFinalFinancialHardshipStatus(record?.financialHardshipStatus || sharedRecord?.financialHardshipStatus || "");
    setFinalAnnualFamilyIncome(record?.annualFamilyIncome || sharedRecord?.annualFamilyIncome || "");
    setFinalResidenceArea(record?.residenceArea || sharedRecord?.residenceArea || "");
    setPmKisanDetails(record?.pmKisanDetails ? { ...record.pmKisanDetails } : createEmptyPmKisanDetails());
    setDeclarationAccepted(record?.declarationAccepted ?? false);
    setFollowUpDate(record?.followUpDate || "");
    setFollowUpNotes(record?.followUpNotes || "");
    setFollowUpMissingItems(record?.missingItems || []);
    setFinalDetailsInvalidFields([]);
    const hasCollectedData = Boolean(
      record
      && (record.uploadedDocName || Object.values(getUploadedDocumentsForRecord(record)).some(Boolean)
        || record.bankAccountNumber || record.bankIfscCode
        || record.minorityStatus || record.declarationAccepted || record.followUpDate
        || Boolean(record.pmKisanDetails && Object.values(record.pmKisanDetails).some((value) => Boolean(value))))
    );
    setFinalDetailsSaveNotice(hasCollectedData && record?.status === "incomplete" ? "incomplete" : null);
    setIsFollowUpSheetOpen(false);
  };

  const startSelectedSchemesCollection = (
    schemeIds: string[] = selectedEligibleSchemeIds,
    destination: "collection" | "home" = "collection"
  ) => {
    const selectableSchemes = selectedEligibleScheme
      ? [selectedEligibleScheme, ...mockEligibleSchemesList.filter((scheme) => scheme.id !== selectedEligibleScheme.id)]
      : mockEligibleSchemesList;
    const selectedSchemes = schemeIds
      .filter((schemeId, index) => schemeIds.indexOf(schemeId) === index)
      .map((schemeId) => selectableSchemes.find((scheme) => scheme.id === schemeId))
      .filter((scheme): scheme is MobileEligibleScheme => Boolean(scheme));
    if (selectedSchemes.length === 0) return;

    const applicantName = createFullName.trim() || "Applicant";
    const applicantLocationEn =
      [createMandalam.trim(), createDistrict.trim()].filter(Boolean).join(", ") || "Kerala";
    const applicantLocationMl =
      [
        createMandalam ? getConstituencyName(createMandalam, "ml") : "",
        createDistrict ? getDistrictName(createDistrict, "ml") : "",
      ].filter(Boolean).join(", ") || "കേരളം";
    const existingForApplicant = mobileCollectionRecords.filter(
      (record) => activeApplicantApplicationRefs.includes(record.reference) || record.applicantName === applicantName
    );

    const nextReferences: string[] = [];
    const recordsForSelection: MobileCollectionRecord[] = [];
    const newRecords: MobileCollectionRecord[] = [];

    selectedSchemes.forEach((scheme) => {
      const existing = existingForApplicant.find((record) => record.scheme.id === scheme.id);
      if (existing) {
        nextReferences.push(existing.reference);
        recordsForSelection.push(existing);
        return;
      }

      const reference = `VK-COL-2026-${collectionReferenceCounter.current++}`;
      nextReferences.push(reference);
      const newRecord: MobileCollectionRecord = {
        reference,
        createdAt: new Date().toISOString(),
        applicantName,
        applicantLocationEn,
        applicantLocationMl,
        scheme: { ...scheme },
        status: "not_started",
        missingItems: getRequiredItemsForScheme(scheme),
        followUpDate: "",
        followUpNotes: "",
        uploadedDocName: "",
        uploadedDocuments: {},
        bankAccountNumber: "",
        bankIfscCode: "",
        minorityStatus: "",
        disabilityStatus: "",
        studentStatus: "",
        employmentStatus: "",
        bplStatus: "",
        financialHardshipStatus: "",
        annualFamilyIncome: "",
        residenceArea: "",
        pmKisanDetails: isPmKisanScheme(scheme) ? createEmptyPmKisanDetails() : undefined,
        declarationAccepted: false,
        updatedAt: new Date().toISOString(),
      };
      newRecords.push(newRecord);
      recordsForSelection.push(newRecord);
    });

    if (newRecords.length > 0) {
      setMobileCollectionRecords((current) => [...newRecords, ...current]);
    }
    setActiveApplicantApplicationRefs(nextReferences);
    setFinalDetailsInvalidFields([]);
    setFinalDetailsSaveNotice(null);
    setIsFollowUpSheetOpen(false);

    if (destination === "home") {
      const phoneDigits = createPhone.replace(/\D/g, "").slice(-10);
      const phoneDisplay =
        phoneDigits.length === 10
          ? `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`
          : `${createCountryCode} ${createPhone.trim()}`.trim() || "—";
      const aadhaarDigits = createAadhaar.replace(/\D/g, "");
      const aadhaarDisplay = aadhaarDigits.length >= 4 ? `XXXX-XXXX-${aadhaarDigits.slice(-4)}` : "—";
      const assistingWorkerEn = userRole === "party_worker" ? "Dhyan M S" : "Jayasurya";
      const assistingWorkerMl = userRole === "party_worker" ? "ധ്യാൻ എം എസ്" : "ജയസൂര്യ";

      const createdApplicationRefs: string[] = [];
      const newApplicationRecords: MobileApplicationRecord[] = [];

      recordsForSelection.forEach((record) => {
        const existingApplication = savedApplicationRecords.find(
          (item) =>
            item.applicantNameEn === record.applicantName && item.schemeNameEn === record.scheme.titleEn
        );
        if (existingApplication) {
          createdApplicationRefs.push(existingApplication.ref);
          return;
        }

        const savedDate = formatCollectionDate(record.createdAt.slice(0, 10));
        const applicationRef = `APP-2026-${savedApplicationRefCounter.current++}`;
        createdApplicationRefs.push(applicationRef);
        newApplicationRecords.push({
          ref: applicationRef,
          schemeNameEn: record.scheme.titleEn,
          schemeNameMl: record.scheme.titleMl,
          categoryEn: record.scheme.categoryEn,
          categoryMl: record.scheme.categoryMl,
          status: "pending",
          applicantNameEn: record.applicantName,
          applicantNameMl: record.applicantName,
          aadhaar: aadhaarDisplay,
          phone: phoneDisplay,
          locationEn: record.applicantLocationEn || "Kerala",
          locationMl: record.applicantLocationMl || "കേരളം",
          annualIncome: createIncomeRange || "—",
          appliedDate: savedDate,
          currentStep: 1,
          pendingDocs: getSchemeRequiredDocuments(record.scheme).map((document) => document.labelEn),
          nextActionEn: "Application received. Document verification is pending.",
          nextActionMl: "അപേക്ഷ ലഭിച്ചു. രേഖാ പരിശോധന ബാക്കിയുണ്ട്.",
          auditLog: [
            {
              titleEn: "Application received",
              titleMl: "അപേക്ഷ ലഭിച്ചു",
              date: savedDate,
              time: getActivityTimeLabel(new Date(record.createdAt)),
              actorEn: record.applicantName,
              actorMl: record.applicantName,
              status: "completed",
            },
          ],
          workflowStatus: "application_received",
          assistedByEn: assistingWorkerEn,
          assistedByMl: assistingWorkerMl,
        });
      });

      if (newApplicationRecords.length > 0) {
        setSavedApplicationRecords((current) => [...newApplicationRecords, ...current]);
      }
      setLatestSavedApplicationRefs(createdApplicationRefs);
      setActiveCollectionReference("");
      setSelectedEligibleSchemeIds([]);
      setSchemeDetailsReturnStep("eligible_schemes");
      setCreateFlowStep("form");
      setActiveTab("overview");
      setMobileSubPage("none");
      return;
    }

    if (recordsForSelection.length === 1) {
      const record = recordsForSelection[0];
      const sharedRecord = existingForApplicant.find((item) => item.reference !== record.reference) || null;
      setSelectedEligibleScheme({ ...record.scheme });
      setSchemeDetailsReturnStep("eligible_schemes");
      setActiveCollectionReference(record.reference);
      hydrateDetailsFromRecord(record, sharedRecord);
      setCreateFlowStep("scheme_details");
      return;
    }

    setActiveCollectionReference("");
    setCreateFlowStep("selected_schemes");
  };

  const openSchemeDetails = (
    schemeId: string,
    returnStep: "selected_schemes" | "applicant_applications" = "selected_schemes"
  ) => {
    const scheme = mockEligibleSchemesList.find((item) => item.id === schemeId)
      || mobileCollectionRecords.find((item) => item.scheme.id === schemeId)?.scheme;
    if (!scheme) return;

    const record = getApplicationRecordForScheme(schemeId);
    const sharedRecord = mobileCollectionRecords.find(
      (item) => item.reference !== record?.reference && activeApplicantApplicationRefs.includes(item.reference)
    );

    setSelectedEligibleScheme({ ...scheme });
    setSchemeDetailsReturnStep(returnStep);
    setActiveCollectionReference(record?.reference || "");
    hydrateDetailsFromRecord(record, sharedRecord);
    setCreateFlowStep("scheme_details");
  };

  const activeCollectionRecord = mobileCollectionRecords.find(
    (record) => record.reference === activeCollectionReference
  ) ?? null;

  const activeCollectionRecordUploadedDocuments = activeCollectionRecord
    ? getUploadedDocumentsForRecord(activeCollectionRecord)
    : {};

  const followUpCollectionRecords = mobileCollectionRecords.filter(
    (record) => record.status === "incomplete"
  );

  const currentApplicantApplications = activeApplicantApplicationRefs
    .map((reference) => mobileCollectionRecords.find((record) => record.reference === reference))
    .filter((record): record is MobileCollectionRecord => Boolean(record));

  const latestSavedApplications = latestSavedApplicationRefs
    .map((reference) => savedApplicationRecords.find((record) => record.ref === reference))
    .filter((record): record is MobileApplicationRecord => Boolean(record));

  const applicantFollowUpCount = currentApplicantApplications.filter(
    (record) => record.status === "incomplete"
  ).length;
  const applicantCompleteCount = currentApplicantApplications.filter(
    (record) => record.status === "complete" || record.status === "ready"
  ).length;
  const applicantNotStartedCount = currentApplicantApplications.filter(
    (record) => record.status === "not_started"
  ).length;
  const activeApplicationIndex = currentApplicantApplications.findIndex(
    (record) => record.reference === activeCollectionReference
  );
  const nextSelectedApplication = activeApplicationIndex >= 0
    ? currentApplicantApplications[activeApplicationIndex + 1] || null
    : currentApplicantApplications.find((record) => record.reference !== activeCollectionReference) || null;

  const activeSchemePosition = Math.max(
    1,
    currentApplicantApplications.findIndex((record) => record.reference === activeCollectionReference) + 1
  );

  const getApplicationStatusMeta = (record: MobileCollectionRecord) => {
    if (record.status === "incomplete" && record.followUpDate) {
      return {
        labelEn: "Follow-up Required",
        labelMl: "തുടർനടപടി ആവശ്യം",
        className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900",
      };
    }
    return getCollectionStatusMeta(record.status);
  };

  const getCollectionStatusMeta = (status: MobileCollectionStatus) => {
    if (status === "not_started") {
      return {
        labelEn: "Not started",
        labelMl: "ആരംഭിച്ചിട്ടില്ല",
        className: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/50 dark:text-slate-300 dark:border-slate-800",
      };
    }
    if (status === "ready") {
      return {
        labelEn: "Ready for Processing",
        labelMl: "നടപടികൾക്ക് തയ്യാർ",
        className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900",
      };
    }
    if (status === "complete") {
      return {
        labelEn: "Collection Complete",
        labelMl: "വിവരങ്ങൾ പൂർത്തിയായി",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900",
      };
    }
    return {
      labelEn: "Collection Incomplete",
      labelMl: "ശേഖരണം അപൂർണ്ണം",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900",
    };
  };

  const getSchemeVisual = (schemeId: string) => {
    if (schemeId === "SCH-001") {
      return { Icon: Sprout, tileClass: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/60" };
    }
    if (schemeId === "SCH-002") {
      return { Icon: HeartHandshake, tileClass: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/60" };
    }
    if (schemeId === "SCH-003") {
      return { Icon: LayoutGrid, tileClass: "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-900/60" };
    }
    return { Icon: Users, tileClass: "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-900/60" };
  };

  const getApplicantAge = () => {
    if (!createDob) return null;
    const birthDate = new Date(`${createDob}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }
    return age > 0 ? age : null;
  };

  const renderApplicantSummaryCard = (
    onEdit?: () => void,
    actionLabel?: string,
    supportingLine?: string
  ) => {
    const applicantName = createFullName.trim() || "Applicant";
    const initials = applicantName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
    const age = getApplicantAge();
    const locationLabel = createDistrict ? `${createDistrict}, Kerala` : "Kerala";
    return (
      <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-orange-200 bg-gradient-to-br from-orange-100 to-amber-50 text-[15px] font-black text-orange-700 dark:border-orange-900 dark:from-orange-950/70 dark:to-amber-950/40 dark:text-orange-300">
            {initials || "A"}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[14px] font-extrabold text-foreground">{applicantName}</p>
            <p className="mt-0.5 truncate text-[11.5px] font-medium text-muted-foreground">
              {age ? `Age ${age} · ` : ""}{locationLabel}
            </p>
            {supportingLine && (
              <p className="mt-0.5 truncate text-[10px] font-medium text-muted-foreground/90">
                {supportingLine}
              </p>
            )}
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="min-h-10 shrink-0 px-1 text-[11.5px] font-extrabold text-orange-600 hover:text-orange-700 cursor-pointer dark:text-orange-400"
            >
              {actionLabel || (lang === "ml" ? "തിരുത്തുക" : "Edit")}
            </button>
          )}
        </div>
      </div>
    );
  };

  const handleDocumentFileSelect = (documentId: string, file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const isSupported = ["pdf", "jpg", "jpeg", "png"].includes(extension);
    if (!isSupported) {
      setUploadErrors((current) => ({
        ...current,
        [documentId]: lang === "ml"
          ? "PDF, JPG അല്ലെങ്കിൽ PNG ഫയൽ മാത്രം അപ്‌ലോഡ് ചെയ്യുക."
          : "Upload a PDF, JPG or PNG file only.",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors((current) => ({
        ...current,
        [documentId]: lang === "ml"
          ? "ഫയൽ വലുപ്പം 5MB-ൽ കുറവായിരിക്കണം."
          : "File size must be under 5MB.",
      }));
      return;
    }

    setUploadedDocuments((current) => ({ ...current, [documentId]: file.name }));
    setUploadErrors((current) => {
      const next = { ...current };
      delete next[documentId];
      return next;
    });
    setFinalDetailsSaveNotice(null);
  };

  const removeDocumentUpload = (documentId: string) => {
    setUploadedDocuments((current) => {
      const next = { ...current };
      delete next[documentId];
      return next;
    });
    setUploadErrors((current) => {
      const next = { ...current };
      delete next[documentId];
      return next;
    });
    setFinalDetailsSaveNotice(null);
  };

  const updatePmKisanDetails = (patch: Partial<PmKisanCollectionDetails>) => {
    setPmKisanDetails((current) => ({ ...current, ...patch }));
    setFinalDetailsSaveNotice(null);
  };

  const getFinalDetailsValidation = () => {
    const missingItems: MobileMissingItem[] = [];
    const invalidFields: string[] = [];
    const requiredFieldKeys = getSchemeRequiredFieldKeys(selectedEligibleScheme);
    const requiresField = (key: MobileSchemeFieldKey) => requiredFieldKeys.includes(key);
    const addMissingField = (key: MobileSchemeFieldKey | "employmentStatus" | "financialHardshipStatus" | "annualFamilyIncome", labelEn: string, labelMl: string) => {
      missingItems.push({ key, labelEn, labelMl, kind: "field" });
    };

    getSchemeRequiredDocuments(selectedEligibleScheme).forEach((document) => {
      if (!uploadedDocuments[document.id]) missingItems.push(getDocumentMissingItem(document));
    });

    if (requiresField("bankAccountNumber")) {
      if (!bankAccountNumber.trim()) {
        addMissingField("bankAccountNumber", mobileFieldLabels.bankAccountNumber.labelEn, mobileFieldLabels.bankAccountNumber.labelMl);
      } else if (!/^\d{9,18}$/.test(bankAccountNumber.trim())) {
        invalidFields.push("bankAccountNumber");
      }
    }

    if (requiresField("bankIfscCode")) {
      if (!bankIfscCode.trim()) {
        addMissingField("bankIfscCode", mobileFieldLabels.bankIfscCode.labelEn, mobileFieldLabels.bankIfscCode.labelMl);
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankIfscCode.trim())) {
        invalidFields.push("bankIfscCode");
      }
    }

    if (requiresField("minorityStatus") && !finalMinorityStatus) {
      addMissingField("minorityStatus", mobileFieldLabels.minorityStatus.labelEn, mobileFieldLabels.minorityStatus.labelMl);
    }
    if (requiresField("disabilityStatus") && !finalDisabilityStatus) {
      addMissingField("disabilityStatus", mobileFieldLabels.disabilityStatus.labelEn, mobileFieldLabels.disabilityStatus.labelMl);
    }
    if (requiresField("studentStatus")) {
      if (!finalStudentStatus) {
        addMissingField("studentStatus", mobileFieldLabels.studentStatus.labelEn, mobileFieldLabels.studentStatus.labelMl);
      } else if (finalStudentStatus === "no" && !finalEmploymentStatus) {
        addMissingField("employmentStatus", "Employment status", "തൊഴിൽ നില");
      }
    }

    if (requiresField("bplStatus")) {
      if (!finalBplStatus) {
        addMissingField("bplStatus", mobileFieldLabels.bplStatus.labelEn, mobileFieldLabels.bplStatus.labelMl);
      } else if (finalBplStatus === "yes" && !finalFinancialHardshipStatus) {
        addMissingField("financialHardshipStatus", "Financial hardship status", "സാമ്പത്തിക ബുദ്ധിമുട്ട് നില");
      } else if (finalBplStatus === "no") {
        if (!finalAnnualFamilyIncome.trim()) {
          addMissingField("annualFamilyIncome", "Annual family income", "വാർഷിക കുടുംബ വരുമാനം");
        } else if (!Number.isFinite(Number(finalAnnualFamilyIncome)) || Number(finalAnnualFamilyIncome) < 0) {
          invalidFields.push("annualFamilyIncome");
        }
      }
    }

    if (requiresField("residenceArea") && !finalResidenceArea) {
      addMissingField("residenceArea", mobileFieldLabels.residenceArea.labelEn, mobileFieldLabels.residenceArea.labelMl);
    }
    if (isPmKisanScheme(selectedEligibleScheme)) {
      missingItems.push(...getPmKisanMissingItems(pmKisanDetails));
    }
    if (!declarationAccepted) {
      missingItems.push({ key: "declaration", labelEn: "Declaration confirmation", labelMl: "സത്യവാങ്മൂലം സ്ഥിരീകരണം", kind: "field" });
    }

    return {
      missingItems,
      invalidFields,
      isValid: missingItems.length === 0 && invalidFields.length === 0,
    };
  };

  const buildCollectionRecord = (
    status: MobileCollectionStatus,
    missingItems: MobileMissingItem[]
  ): MobileCollectionRecord | null => {
    if (!selectedEligibleScheme) return null;

    const existingRecord = mobileCollectionRecords.find(
      (record) => record.reference === activeCollectionReference
    );
    const reference = existingRecord?.reference || `VK-COL-2026-${collectionReferenceCounter.current++}`;
    if (!existingRecord) {
      setActiveApplicantApplicationRefs((current) =>
        current.includes(reference) ? current : [...current, reference]
      );
    }
    const isComplete = status === "complete" || status === "ready";
    const requiredDocuments = getSchemeRequiredDocuments(selectedEligibleScheme);
    const normalizedUploadedDocuments = requiredDocuments.reduce<Record<string, string>>((documents, document) => {
      const fileName = uploadedDocuments[document.id];
      if (fileName) documents[document.id] = fileName;
      return documents;
    }, {});
    const record: MobileCollectionRecord = {
      reference,
      createdAt: existingRecord?.createdAt || new Date().toISOString(),
      applicantName: createFullName.trim() || "Applicant",
      scheme: { ...selectedEligibleScheme },
      status,
      missingItems,
      followUpDate: isComplete ? "" : followUpDate,
      followUpNotes: isComplete ? "" : followUpNotes,
      uploadedDocName: requiredDocuments
        .map((document) => uploadedDocuments[document.id])
        .filter(Boolean)
        .join(", "),
      uploadedDocuments: normalizedUploadedDocuments,
      bankAccountNumber,
      bankIfscCode,
      minorityStatus: finalMinorityStatus,
      disabilityStatus: finalDisabilityStatus,
      studentStatus: finalStudentStatus,
      employmentStatus: finalEmploymentStatus,
      bplStatus: finalBplStatus,
      financialHardshipStatus: finalFinancialHardshipStatus,
      annualFamilyIncome: finalAnnualFamilyIncome,
      residenceArea: finalResidenceArea,
      pmKisanDetails: isPmKisanScheme(selectedEligibleScheme) ? { ...pmKisanDetails } : undefined,
      declarationAccepted,
      updatedAt: new Date().toISOString(),
    };

    setMobileCollectionRecords((current) =>
      current.some((item) => item.reference === reference)
        ? current.map((item) => (item.reference === reference ? record : item))
        : [record, ...current]
    );
    setActiveCollectionReference(reference);
    return record;
  };

  const handleFinalDetailsSave = () => {
    const validation = getFinalDetailsValidation();
    setFinalDetailsInvalidFields(validation.invalidFields);

    if (validation.isValid) {
      const savedRecord = buildCollectionRecord("complete", []);
      setFollowUpDate("");
      setFollowUpNotes("");
      setFollowUpMissingItems([]);
      setFinalDetailsSaveNotice(null);
      setIsFollowUpSheetOpen(false);

      if (savedRecord) {
        const category = getSchemeCategoryLabel(savedRecord.scheme);
        const phoneDigits = createPhone.replace(/\D/g, "").slice(-10);
        const phoneDisplay =
          phoneDigits.length === 10
            ? `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`
            : `${createCountryCode} ${createPhone.trim()}`.trim() || "—";
        const aadhaarDigits = createAadhaar.replace(/\D/g, "");
        const locationEn =
          [createMandalam.trim(), createDistrict.trim()].filter(Boolean).join(", ") || "Kerala";
        const locationMl =
          [
            createMandalam ? getConstituencyName(createMandalam, "ml") : "",
            createDistrict ? getDistrictName(createDistrict, "ml") : "",
          ]
            .filter(Boolean)
            .join(", ") || "കേരളം";
        const receivedDate = formatCollectionDate(savedRecord.createdAt.slice(0, 10));
        const verifiedDate = formatCollectionDate(savedRecord.updatedAt.slice(0, 10));
        const uploadedFiles = Object.values(savedRecord.uploadedDocuments ?? {}).filter(Boolean);
        const assistingWorkerEn = userRole === "party_worker" ? "Dhyan M S" : "Jayasurya";
        const assistingWorkerMl = userRole === "party_worker" ? "ധ്യാൻ എം എസ്" : "ജയസൂര്യ";

        setSelectedApplicationRecord({
          ref: savedRecord.reference,
          schemeNameEn: savedRecord.scheme.titleEn,
          schemeNameMl: savedRecord.scheme.titleMl,
          categoryEn: category.en,
          categoryMl: category.ml,
          status: "pending",
          applicantNameEn: savedRecord.applicantName,
          applicantNameMl: savedRecord.applicantName,
          aadhaar: aadhaarDigits.length >= 4 ? `XXXX-XXXX-${aadhaarDigits.slice(-4)}` : "—",
          phone: phoneDisplay,
          locationEn,
          locationMl,
          annualIncome: createIncomeRange || "—",
          appliedDate: receivedDate,
          currentStep: 2,
          pendingDocs: uploadedFiles,
          nextActionEn: "Ready for submission to the scheme portal",
          nextActionMl: "സ്കീം പോർട്ടലിൽ സമർപ്പിക്കാൻ തയ്യാർ",
          auditLog: [
            {
              titleEn: "Application received",
              titleMl: "അപേക്ഷ ലഭിച്ചു",
              date: receivedDate,
              time: getActivityTimeLabel(new Date(savedRecord.createdAt)),
              actorEn: savedRecord.applicantName,
              actorMl: savedRecord.applicantName,
              status: "completed",
            },
            {
              titleEn: "Documents checked",
              titleMl: "രേഖകൾ പരിശോധിച്ചു",
              date: verifiedDate,
              time: getActivityTimeLabel(new Date(savedRecord.updatedAt)),
              actorEn: assistingWorkerEn,
              actorMl: assistingWorkerMl,
              status: "completed",
            },
          ],
          workflowStatus: "document_verification_completed",
          assistedByEn: assistingWorkerEn,
          assistedByMl: assistingWorkerMl,
        });
      }

      setActiveTab("applications");
      setMobileSubPage("app_detail");
      setAppDetailView("overview");
      setAppDetailMenuOpen(false);
      setEditingApplicationRef("");
      setCreateFlowStep("form");
      mobileContentRef.current?.scrollTo({ top: 0 });
      showDocumentActionNotice(lang === "ml" ? "വിവരങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു." : "Details saved successfully.");
      return;
    }

    const savedRecord = buildCollectionRecord("incomplete", validation.missingItems);
    if (validation.missingItems.length > 0) {
      setFollowUpMissingItems(validation.missingItems);
      setFollowUpDate(savedRecord?.followUpDate || activeCollectionRecord?.followUpDate || "");
      setFollowUpNotes(savedRecord?.followUpNotes || activeCollectionRecord?.followUpNotes || "");
      setFollowUpDateError("");
      setFinalDetailsSaveNotice("incomplete");
      setIsFollowUpSheetOpen(true);
    } else {
      setFinalDetailsSaveNotice("invalid");
    }
  };

  const handleContinueToNextScheme = () => {
    if (nextSelectedApplication) {
      openSchemeDetails(nextSelectedApplication.scheme.id);
      return;
    }
    setCreateFlowStep("applicant_applications");
  };

  const handleAddAnotherScheme = () => {
    setSelectedEligibleSchemeIds(currentApplicantApplications.map((record) => record.scheme.id));
    setSelectedEligibleScheme(null);
    setPmKisanDetails(createEmptyPmKisanDetails());
    setCreateFlowStep("eligible_schemes");
  };

  const openFollowUpSheet = (missingItems?: MobileMissingItem[]) => {
    const validation = getFinalDetailsValidation();
    const nextMissingItems = missingItems
      || (createFlowStep === "scheme_details" ? validation.missingItems : activeCollectionRecord?.missingItems || []);

    setFollowUpMissingItems(nextMissingItems);
    setFollowUpDate(activeCollectionRecord?.followUpDate || followUpDate);
    setFollowUpNotes(activeCollectionRecord?.followUpNotes || followUpNotes);
    setFollowUpDateError("");
    setIsFollowUpSheetOpen(true);
  };

  const handleSaveFollowUp = () => {
    if (!followUpDate) {
      setFollowUpDateError("required");
      return;
    }
    if (followUpDate < getLocalIsoDate()) {
      setFollowUpDateError("past");
      return;
    }
    if (!activeCollectionRecord) return;

    const currentValidation = createFlowStep === "scheme_details"
      ? getFinalDetailsValidation()
      : null;
    const outstandingItems = currentValidation?.missingItems || followUpMissingItems;
    const updatedRecord: MobileCollectionRecord = {
      ...activeCollectionRecord,
      status: "incomplete",
      missingItems: outstandingItems,
      followUpDate,
      followUpNotes: followUpNotes.trim(),
      updatedAt: new Date().toISOString(),
    };

    setMobileCollectionRecords((current) =>
      current.map((record) => record.reference === updatedRecord.reference ? updatedRecord : record)
    );
    setFollowUpMissingItems(outstandingItems);
    setFollowUpDateError("");
    setIsFollowUpSheetOpen(false);
    setFinalDetailsSaveNotice(null);
    setCreateFlowStep("follow_up_scheduled");
  };

  const openCollectionRecordView = (
    record: MobileCollectionRecord,
    returnStep: MobileCollectionRecordReturnStep
  ) => {
    setActiveCollectionReference(record.reference);
    setCollectionRecordReturnStep(returnStep);
    setActiveTab("create");
    setMobileSubPage("none");
    setCreateFlowStep("collection_record");
  };

  const handleEditActiveCollectionRecord = () => {
    if (!activeCollectionRecord) return;

    setSelectedEligibleScheme({ ...activeCollectionRecord.scheme });
    setSelectedEligibleSchemeIds([activeCollectionRecord.scheme.id]);
    setCreateFullName(activeCollectionRecord.applicantName === "Applicant" ? "" : activeCollectionRecord.applicantName);
    setUploadedDocuments(getUploadedDocumentsForRecord(activeCollectionRecord));
    setUploadErrors({});
    setBankAccountNumber(activeCollectionRecord.bankAccountNumber);
    setBankIfscCode(activeCollectionRecord.bankIfscCode);
    setFinalMinorityStatus(activeCollectionRecord.minorityStatus);
    setFinalDisabilityStatus(activeCollectionRecord.disabilityStatus);
    setFinalStudentStatus(activeCollectionRecord.studentStatus);
    setFinalEmploymentStatus(activeCollectionRecord.employmentStatus);
    setFinalBplStatus(activeCollectionRecord.bplStatus);
    setFinalFinancialHardshipStatus(activeCollectionRecord.financialHardshipStatus);
    setFinalAnnualFamilyIncome(activeCollectionRecord.annualFamilyIncome);
    setFinalResidenceArea(activeCollectionRecord.residenceArea);
    setPmKisanDetails(activeCollectionRecord.pmKisanDetails ? { ...activeCollectionRecord.pmKisanDetails } : createEmptyPmKisanDetails());
    setDeclarationAccepted(activeCollectionRecord.declarationAccepted);
    setFollowUpDate(activeCollectionRecord.followUpDate);
    setFollowUpNotes(activeCollectionRecord.followUpNotes);
    setFollowUpMissingItems(activeCollectionRecord.missingItems);
    setFinalDetailsInvalidFields([]);
    setFinalDetailsSaveNotice(activeCollectionRecord.status === "incomplete" ? "incomplete" : null);
    setActiveApplicantApplicationRefs((current) =>
      current.includes(activeCollectionRecord.reference)
        ? current
        : [activeCollectionRecord.reference, ...current]
    );
    setSchemeDetailsReturnStep("applicant_applications");
    setCreateFlowStep("scheme_details");
  };

  const handleAddAnotherApplicant = () => {
    setEditingApplicationRef("");
    setCreateFullName("");
    setCreateAadhaar("");
    setCreateCountryCode("+91");
    setCreatePhone("");
    setCreateEmail("");
    setCreateDob("");
    setCreateGender("");
    setCreateReligion("");
    setCreateCaste("");
    setCreateMaritalStatus("");
    setCreateOccupation("");
    setCreateIncomeRange("");
    setCreateDistrict("");
    setCreateLocalBodyType("");
    setCreateLocalBody("");
    setCreateWard("");
    setCreateMandalam("");
    setCreateHouseName("");
    setCreateStreetLocality("");
    setCreatePin("");
    setIsMandalamAutoFilled(false);
    setSelectedSchemeName("");
    setSelectedEligibleScheme(null);
    setSelectedEligibleSchemeIds([]);
    setUploadedDocuments({});
    setUploadErrors({});
    setPmKisanDetails(createEmptyPmKisanDetails());
    setBankAccountNumber("");
    setBankIfscCode("");
    setFinalMinorityStatus("");
    setFinalDisabilityStatus("");
    setFinalStudentStatus("");
    setFinalEmploymentStatus("");
    setFinalBplStatus("");
    setFinalFinancialHardshipStatus("");
    setFinalAnnualFamilyIncome("");
    setFinalResidenceArea("");
    setPmKisanDetails(createEmptyPmKisanDetails());
    setDeclarationAccepted(false);
    setFinalDetailsInvalidFields([]);
    setFinalDetailsSaveNotice(null);
    setFollowUpDate("");
    setFollowUpNotes("");
    setFollowUpMissingItems([]);
    setFollowUpDateError("");
    setIsFollowUpSheetOpen(false);
    setActiveCollectionReference("");
    setActiveApplicantApplicationRefs([]);
    setActiveTab("create");
    setMobileSubPage("none");
    setCreateFlowStep("form");
  };

  const handleStartEligibilityCheck = () => {
    if (!isCreateFormValid || isCheckingEligibility) return;
    setCreateFlowStep("checking");
    setIsCheckingEligibility(true);

    setTimeout(() => {
      setIsCheckingEligibility(false);
      if (selectedSchemeName) {
        const matchedScheme: MobileEligibleScheme = mockEligibleSchemesList.find(
          (s) => s.titleEn.toLowerCase().includes(selectedSchemeName.toLowerCase()) || selectedSchemeName.toLowerCase().includes(s.titleEn.toLowerCase())
        ) || {
          id: "SCH-SPECIFIC",
          titleEn: selectedSchemeName,
          titleMl: selectedSchemeName,
          benefitEn: "Official government scheme financial assistance and welfare benefits.",
          benefitMl: "സർക്കാർ പദ്ധതി സാമ്പത്തിക ആനുകൂല്യങ്ങളും ക്ഷേമ സഹായങ്ങളും.",
          matchLabelEn: "100% Match",
          matchLabelMl: "100% യോഗ്യത",
          deptEn: "Government of India Department",
          deptMl: "ഭാരത സർക്കാർ വകുപ്പ്",
          categoryEn: "Central Government",
          categoryMl: "കേന്ദ്ര സർക്കാർ",
          requiredDocEn: "Aadhaar Card / Income Certificate Copy",
          requiredDocMl: "ആധാർ കാർഡ് / വരുമാന സർട്ടിഫിക്കറ്റ് പകർപ്പ്",
          requiredFieldKeys: ["bankAccountNumber", "bankIfscCode", "minorityStatus", "disabilityStatus", "studentStatus", "bplStatus", "residenceArea"],
        };

        setSelectedEligibleScheme(matchedScheme);
        setSelectedEligibleSchemeIds([matchedScheme.id]);
        setUploadedDocuments({});
        setUploadErrors({});
        setPmKisanDetails(createEmptyPmKisanDetails());
        setSchemeDetailsReturnStep("eligibility_result");
        setIsSingleSchemeEligible(true);
        setCreateFlowStep("eligibility_result");
      } else {
        setSelectedEligibleScheme(null);
        setSelectedEligibleSchemeIds([]);
        setPmKisanDetails(createEmptyPmKisanDetails());
        setCreateFlowStep("eligible_schemes");
      }
    }, 2200);
  };

  const handleGuestSchemeSelect = (schemeId: string, guestAnswers: GuestEligibilityAnswers) => {
    const scheme = schemes.find((item) => item.id === schemeId);
    if (!scheme) return;

    const mobileScheme: MobileEligibleScheme = {
      id: scheme.id,
      titleEn: scheme.en,
      titleMl: scheme.ml,
      benefitEn: scheme.benefit.en,
      benefitMl: scheme.benefit.ml,
      matchLabelEn: "Preliminary match",
      matchLabelMl: "പ്രാഥമിക പൊരുത്തം",
      deptEn: scheme.ministry.en,
      deptMl: scheme.ministry.ml,
      categoryEn: scheme.category,
      categoryMl: scheme.category,
      requiredDocEn: "Identity and supporting documents as required",
      requiredDocMl: "ആവശ്യമായ തിരിച്ചറിയൽ രേഖകൾ",
      requiredFieldKeys: ["bankAccountNumber", "bankIfscCode", "minorityStatus", "disabilityStatus", "studentStatus", "bplStatus", "residenceArea"],
    };

    setSelectedSchemeName(scheme.en);
    setSelectedEligibleScheme(mobileScheme);
    setSelectedEligibleSchemeIds([scheme.id]);
    setUploadedDocuments({});
    setUploadErrors({});
    setPmKisanDetails(createEmptyPmKisanDetails());

    const genderMap: Record<string, string> = {
      male: "Male",
      female: "Female",
      transgender: "Transgender / Other",
    };
    if (genderMap[guestAnswers.gender]) setCreateGender(genderMap[guestAnswers.gender]);
    if (guestAnswers.dob) setCreateDob(guestAnswers.dob);

    const casteMap: Record<string, string> = {
      general: "General",
      obc: "OBC",
      sc: "SC",
      st: "ST",
    };
    if (casteMap[guestAnswers.socialCategory]) setCreateCaste(casteMap[guestAnswers.socialCategory]);

    const occupationMap: Record<string, string> = {
      farmer: "Farmer / Agriculture",
      dailyWage: "Daily Wage Worker",
      salariedPrivate: "Salaried (Private)",
      salariedGovernment: "Salaried (Government)",
      selfEmployed: "Self-Employed / Business",
      homemaker: "Homemaker",
      student: "Student",
      unemployed: "Unemployed",
      retired: "Retired",
      other: "Other",
    };
    if (occupationMap[guestAnswers.occupation]) setCreateOccupation(occupationMap[guestAnswers.occupation]);

    const incomeMap: Record<string, string> = {
      under1: "₹50,000 - ₹1,00,000",
      oneToTwoFive: "₹1,00,000 - ₹2,50,000",
      twoFiveToFive: "₹2,50,000 - ₹5,00,000",
      fiveToEight: "Above ₹5,00,000",
      aboveEight: "Above ₹5,00,000",
    };
    if (incomeMap[guestAnswers.annualFamilyIncome]) setCreateIncomeRange(incomeMap[guestAnswers.annualFamilyIncome]);

    const district = districts.find((item) => item.id === guestAnswers.districtId);
    if (district) setCreateDistrict(district.en);
    if (guestAnswers.localBodyType) setCreateLocalBodyType(guestAnswers.localBodyType);
    const localBody = panchayats.find((item) => item.id === guestAnswers.localBodyId);
    if (localBody) setCreateLocalBody(localBody.en);
    const ward = getWardsForLocalBody(guestAnswers.localBodyId).find((item) => item.id === guestAnswers.wardId);
    if (ward) setCreateWard(lang === "ml" ? ward.displayMl : ward.displayEn);
    const mandalam = constituencies.find((item) => item.id === guestAnswers.mandalamId);
    if (mandalam) setCreateMandalam(mandalam.en);

    if (["yes", "no"].includes(guestAnswers.minorityStatus)) setFinalMinorityStatus(guestAnswers.minorityStatus);
    if (["yes", "no"].includes(guestAnswers.disabilityStatus)) setFinalDisabilityStatus(guestAnswers.disabilityStatus);
    if (["yes", "no"].includes(guestAnswers.studentStatus)) setFinalStudentStatus(guestAnswers.studentStatus);
    const finalEmploymentMap: Record<string, string> = {
      employed: "employed",
      self_employed: "self-employed",
      unemployed: "unemployed",
    };
    if (finalEmploymentMap[guestAnswers.employmentStatus] && guestAnswers.studentStatus !== "yes") {
      setFinalEmploymentStatus(finalEmploymentMap[guestAnswers.employmentStatus]);
    }
    if (["yes", "no"].includes(guestAnswers.bplStatus)) setFinalBplStatus(guestAnswers.bplStatus);
    if (guestAnswers.localBodyType) {
      setFinalResidenceArea(guestAnswers.localBodyType === "panchayat" ? "rural" : "urban");
    }

    handleLogin();
    setActiveTab("create");
    setMobileSubPage("none");
    setCreateFlowStep("form");
  };

    const [mobileSubPage, setMobileSubPage] = useState<"none" | "leaderboard" | "needs_attention" | "recent_activity" | "beneficiaries" | "users" | "user_detail" | "notifications" | "applications" | "events_announcements" | "app_detail" | "category_schemes">("none");
  const [selectedSchemeCategoryDetail, setSelectedSchemeCategoryDetail] = useState<{
    id: string;
    titleEn: string;
    titleMl: string;
    categoryLabelEn: string;
    categoryLabelMl: string;
    count: number;
  } | null>(null);
  const [eventsSubTab, setEventsSubTab] = useState<"events" | "announcements">("events");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<MobileApplicationStatusFilter>("all");
  const [appSchemeCategoryFilter, setAppSchemeCategoryFilter] = useState<string>("all");
  const [appAssistanceStatusFilter, setAppAssistanceStatusFilter] = useState<string>("all");
  const [appDateFilter, setAppDateFilter] = useState<string>("all");
  const [appCustomStartDate, setAppCustomStartDate] = useState<string>("");
  const [appCustomEndDate, setAppCustomEndDate] = useState<string>("");
  const matchAppSearch = (
    status: MobileApplicationListStatus,
    nameEn: string,
    nameMl: string,
    applicantEn: string,
    applicantMl: string,
    typeEn: string,
    typeMl: string,
    ref: string
  ) => {
    const matchesStatus = applicationStatusFilter === "all" || applicationStatusFilter === status;
    if (!matchesStatus) return false;
    if (!applicationSearchQuery.trim()) return true;
    const q = applicationSearchQuery.toLowerCase();
    return (
      nameEn.toLowerCase().includes(q) ||
      nameMl.toLowerCase().includes(q) ||
      applicantEn.toLowerCase().includes(q) ||
      applicantMl.toLowerCase().includes(q) ||
      typeEn.toLowerCase().includes(q) ||
      typeMl.toLowerCase().includes(q) ||
      ref.toLowerCase().includes(q)
    );
  };

    const [applicationSearchQuery, setApplicationSearchQuery] = useState<string>("");
  const [beneficiarySearchQuery, setBeneficiarySearchQuery] = useState<string>("");
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [selectedApplicationUserId, setSelectedApplicationUserId] = useState<string | null>(null);
  const [appDetailReturnSubPage, setAppDetailReturnSubPage] = useState<"applications" | "user_detail">("applications");
  const [beneficiaryCategoryFilter, setBeneficiaryCategoryFilter] = useState<string>("ALL");
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date>(new Date(2026, 9, 12)); // 12/10/2026
  const [selectedPeriod, setSelectedPeriod] = useState<string>("this_month");
  const [periodCustomLabel, setPeriodCustomLabel] = useState<string>("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [deviceModel, setDeviceModel] = useState<"iphone" | "android">("iphone");
  const [activeNotificationFilter, setActiveNotificationFilter] = useState<"all" | "unread" | "applications" | "schemes" | "support">("all");
  const [selectedSchemeName, setSelectedSchemeName] = useState<string>("");
  const [schemeSearchQuery, setSchemeSearchQuery] = useState<string>("");
  const [selectedApplicationRecord, setSelectedApplicationRecord] = useState<MobileApplicationRecord | null>(null);
  const [appDetailView, setAppDetailView] = useState<"overview" | "applicant" | "scheme" | "documents" | "history" | "support">("overview");
  const [appDetailMenuOpen, setAppDetailMenuOpen] = useState<boolean>(false);
  const [isTrackingSheetOpen, setIsTrackingSheetOpen] = useState<boolean>(false);
  const [isTrackingSuccessOpen, setIsTrackingSuccessOpen] = useState<boolean>(false);
  const [trackingIdDraft, setTrackingIdDraft] = useState<string>("");
  const [trackingCopied, setTrackingCopied] = useState<boolean>(false);
  const [isDecisionSheetOpen, setIsDecisionSheetOpen] = useState<boolean>(false);
  const [decisionChoice, setDecisionChoice] = useState<"approved" | "rejected" | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>("");
  const [previewDocument, setPreviewDocument] = useState<
    { name: string; kind: MobileDocumentKind; size: string } | null
  >(null);
  const [documentActionNotice, setDocumentActionNotice] = useState<string>("");
  const [editingApplicationRef, setEditingApplicationRef] = useState<string>("");
  const [applicationRecordEdits, setApplicationRecordEdits] = useState<
    Record<
      string,
      Partial<{
        applicantNameEn: string;
        applicantNameMl: string;
        aadhaar: string;
        phone: string;
        locationEn: string;
        locationMl: string;
      }>
    >
  >({});
  const [applicationCollectedDetails, setApplicationCollectedDetails] = useState<
    Record<string, MobileApplicationCollectedDetails>
  >(mobileApplicationCollectedDetails);

  useEffect(() => {
    setAppDetailView("overview");
    setAppDetailMenuOpen(false);
    setIsTrackingSheetOpen(false);
    setIsTrackingSuccessOpen(false);
    setTrackingIdDraft(selectedApplicationRecord?.trackingId ?? "");
    setTrackingCopied(false);
    setIsDecisionSheetOpen(false);
    setDecisionChoice(null);
    setDecisionNotes("");
    setPreviewDocument(null);
    setDocumentActionNotice("");
  }, [selectedApplicationRecord?.ref, mobileSubPage]);

  const handleSaveTrackingId = () => {
    const nextTrackingId = trackingIdDraft.trim();
    if (!nextTrackingId) return;
    setSelectedApplicationRecord((current) =>
      current
        ? {
            ...current,
            trackingId: nextTrackingId,
            workflowStatus:
              current.workflowStatus === "document_verification_completed"
                ? "applied"
                : current.workflowStatus,
            auditLog: [
              ...current.auditLog,
              createActivityEntry({
                titleEn: current.trackingId ? "Tracking ID updated" : "Tracking ID added",
                titleMl: current.trackingId ? "ട്രാക്കിംഗ് ഐഡി അപ്ഡേറ്റ് ചെയ്തു" : "ട്രാക്കിംഗ് ഐഡി ചേർത്തു",
                actorEn: current.assistedByEn,
                actorMl: current.assistedByMl,
                notes: `Tracking ID: ${nextTrackingId}`,
              }),
            ],
          }
        : current,
    );
    setIsTrackingSheetOpen(false);
    setIsTrackingSuccessOpen(true);
    setTrackingCopied(false);
  };

  const handleOpenDecisionSheet = () => {
    setDecisionChoice(null);
    setDecisionNotes(selectedApplicationRecord?.decisionReason ?? "");
    setIsDecisionSheetOpen(true);
  };

  const handleCloseDecisionSheet = () => {
    setIsDecisionSheetOpen(false);
    setDecisionChoice(null);
    setDecisionNotes("");
    setSelectedApplicationRecord((current) =>
      current && (current.workflowStatus ?? "pending") === "applied"
        ? { ...current, workflowStatus: "review" }
        : current,
    );
  };

  const handleSaveDecision = () => {
    if (!decisionChoice) return;
    const isApproved = decisionChoice === "approved";
    const reason = decisionNotes.trim();

    setSelectedApplicationRecord((current) =>
      current
        ? {
            ...current,
            workflowStatus: isApproved ? "assisted" : "rejected",
            decisionReason: isApproved ? "" : reason,
            auditLog: [
              ...current.auditLog,
              createActivityEntry({
                titleEn: isApproved ? "Decision recorded: Approved" : "Decision recorded: Rejected",
                titleMl: isApproved
                  ? "തീരുമാനം രേഖപ്പെടുത്തി: അംഗീകരിച്ചു"
                  : "തീരുമാനം രേഖപ്പെടുത്തി: നിരസിച്ചു",
                actorEn: current.assistedByEn,
                actorMl: current.assistedByMl,
                notes: isApproved ? undefined : reason,
              }),
            ],
          }
        : current,
    );
    setIsDecisionSheetOpen(false);
    setDecisionChoice(null);
    setDecisionNotes("");
    showDocumentActionNotice(
      lang === "ml" ? "തീരുമാനം സേവ് ചെയ്തു." : "Decision saved.",
    );
  };

  const showDocumentActionNotice = (message: string) => {
    setDocumentActionNotice(message);
    window.setTimeout(() => setDocumentActionNotice(""), 2400);
  };

  const handleViewDocument = (fileName: string) => {
    setPreviewDocument({
      name: getMobileDocumentDisplayName(fileName),
      kind: getMobileDocumentKind(fileName),
      size: getMobileDocumentSize(fileName),
    });
  };

  const handleDownloadDocument = () => {
    showDocumentActionNotice(
      lang === "ml"
        ? "ഫയൽ ഡൗൺലോഡ് ഈ പ്രിവ്യൂവിൽ ലഭ്യമല്ല."
        : "File download is unavailable in this preview.",
    );
  };

  const handleEditApplicationDetails = (targetRecord?: MobileApplicationRecord | null) => {
    const isRecord = targetRecord && typeof targetRecord === "object" && "ref" in targetRecord;
    const baseRecord = isRecord ? targetRecord : selectedApplicationRecord;
    const record = baseRecord
      ? { ...baseRecord, ...(applicationRecordEdits[baseRecord.ref] ?? {}) }
      : null;
    if (!record) return;

    setSelectedApplicationRecord(record);

    const details = applicationCollectedDetails[record.ref];
    const pickOption = (value: string | undefined, options: string[], aliases: Record<string, string> = {}) => {
      if (!value) return "";
      const exact = options.find((option) => option.toLowerCase() === value.toLowerCase());
      return exact ?? aliases[value] ?? "";
    };
    const toIsoDate = (value?: string) => {
      if (!value) return "";
      const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
    };
    const localBodyTypeMap: Record<string, LocalBodyType> = {
      "grama panchayat": "panchayat",
      panchayat: "panchayat",
      municipality: "municipality",
      "municipal corporation": "corporation",
      corporation: "corporation",
    };
    const phoneDigits = record.phone.replace(/\D/g, "");
    const localBodyType = details?.localBodyType
      ? localBodyTypeMap[details.localBodyType.toLowerCase()]
      : undefined;

    setCreateFullName(record.applicantNameEn);
    setCreateAadhaar(record.aadhaar);
    setCreateCountryCode("+91");
    setCreatePhone(phoneDigits.length > 10 ? phoneDigits.slice(-10) : phoneDigits);
    setCreateEmail(details?.email ?? "");
    setCreateDob(toIsoDate(details?.dateOfBirth));
    setCreateGender(pickOption(details?.gender, ["Male", "Female", "Transgender / Other"]));
    setCreateReligion(
      pickOption(details?.religion, ["Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Other"], {
        Hindu: "Hinduism",
        Muslim: "Islam",
        Christian: "Christianity",
      }),
    );
    setCreateCaste(pickOption(details?.caste, ["General", "OBC", "SC", "ST", "OBC-NCL", "EWS"]));
    setCreateMaritalStatus(
      pickOption(
        details?.maritalStatus,
        ["Single / Unmarried", "Married", "Widowed", "Divorcee", "Separated"],
        { Unmarried: "Single / Unmarried" },
      ),
    );
    setCreateOccupation(
      pickOption(
        details?.occupation,
        [
          "Farmer / Agriculture",
          "Daily Wage Worker",
          "Salaried (Private)",
          "Salaried (Government)",
          "Self-Employed / Business",
          "Homemaker",
          "Student",
          "Unemployed",
          "Retired",
          "Other",
        ],
        { Farmer: "Farmer / Agriculture", Driver: "Other", "Self-employed": "Self-Employed / Business" },
      ),
    );
    setCreateIncomeRange(details?.incomeRange ?? "");
    setCreateDistrict(details?.district ?? "");
    setCreateLocalBodyType(localBodyType ?? "");
    setCreateLocalBody(details?.localBody ?? "");
    setCreateWard(details?.ward ?? "");
    setCreateMandalam(details?.mandalam ?? "");
    setCreateHouseName(details?.houseName ?? "");
    setCreateStreetLocality(details?.streetLocality ?? "");
    setCreatePin(details?.pincode ?? "");
    setIsMandalamAutoFilled(false);

    setSelectedSchemeName(record.schemeNameEn);
    const matchedScheme =
      mockEligibleSchemesList.find(
        (scheme) => scheme.titleEn.toLowerCase() === record.schemeNameEn.toLowerCase(),
      ) ?? {
        id: `APP-EDIT-${record.ref}`,
        titleEn: record.schemeNameEn,
        titleMl: record.schemeNameMl,
        benefitEn: "Benefits for the selected scheme application.",
        benefitMl: "തിരഞ്ഞെടുത്ത പദ്ധതി അപേക്ഷയുടെ ആനുകൂല്യങ്ങൾ.",
        matchLabelEn: "Selected scheme",
        matchLabelMl: "തിരഞ്ഞെടുത്ത പദ്ധതി",
        deptEn: record.categoryEn,
        deptMl: record.categoryMl,
        categoryEn: record.categoryEn,
        categoryMl: record.categoryMl,
        requiredDocEn: record.pendingDocs[0] ?? "Supporting document",
        requiredDocMl: "ആവശ്യമായ രേഖ",
        requiredFieldKeys: [
          "bankAccountNumber",
          "bankIfscCode",
          "minorityStatus",
          "disabilityStatus",
          "studentStatus",
          "bplStatus",
          "residenceArea",
        ],
      };
    setSelectedEligibleScheme(matchedScheme);
    setSelectedEligibleSchemeIds([matchedScheme.id]);
    setIsSingleSchemeEligible(true);
    setSchemeDetailsReturnStep("eligibility_result");
    setPmKisanDetails(createEmptyPmKisanDetails());

    const pendingDocumentName = record.pendingDocs[0] ?? "";
    const firstPendingDocument = getSchemeRequiredDocuments(matchedScheme)[0];
    setUploadedDocuments(
      pendingDocumentName && firstPendingDocument
        ? { [firstPendingDocument.id]: pendingDocumentName }
        : {}
    );
    setUploadErrors({});
    setBankAccountNumber(details?.bankAccountNumber ?? "");
    setBankIfscCode(details?.bankIfscCode ?? "");
    const yesNo = (value?: string) => (value ? (value.toLowerCase() === "yes" ? "yes" : value.toLowerCase() === "no" ? "no" : "") : "");
    setFinalMinorityStatus(yesNo(details?.minorityStatus));
    setFinalDisabilityStatus(yesNo(details?.disabilityStatus));
    setFinalStudentStatus(yesNo(details?.studentStatus));
    const employmentValue = details?.employmentStatus?.toLowerCase() ?? "";
    setFinalEmploymentStatus(
      ["employed", "unemployed", "self-employed"].includes(employmentValue) ? employmentValue : "",
    );
    setFinalBplStatus(yesNo(details?.bplStatus));
    setFinalFinancialHardshipStatus(yesNo(details?.financialHardshipStatus));
    setFinalAnnualFamilyIncome((details?.annualFamilyIncome ?? "").replace(/[^\d]/g, ""));
    const residenceValue = details?.residenceArea?.toLowerCase() ?? "";
    setFinalResidenceArea(["urban", "rural"].includes(residenceValue) ? residenceValue : "");
    setDeclarationAccepted(true);
    setFinalDetailsInvalidFields([]);
    setFinalDetailsSaveNotice(null);

    setActiveCollectionReference("");
    setActiveApplicantApplicationRefs([]);
    setAppDetailView("overview");
    setEditingApplicationRef(record.ref);
    setActiveTab("create");
    setMobileSubPage("none");
    setCreateFlowStep("form");
    mobileContentRef.current?.scrollTo({ top: 0 });
  };

  const handleSaveEditedApplicationDetails = () => {
    const applicationRef = editingApplicationRef;
    const existingDetails = applicationCollectedDetails[applicationRef];
    if (!applicationRef || !existingDetails || !isCreateFormValid) return;

    const dateParts = createDob.split("-");
    const displayDateOfBirth =
      dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : createDob.trim();
    const localBodyTypeLabels: Record<LocalBodyType, string> = {
      panchayat: "Grama Panchayat",
      municipality: "Municipality",
      corporation: "Municipal Corporation",
    };
    const updatedLocation = [createStreetLocality.trim(), createDistrict.trim()].filter(Boolean).join(", ");
    const phoneDigits = createPhone.replace(/\D/g, "").slice(-10);
    const formattedPhone =
      phoneDigits.length === 10 ? `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}` : `${createCountryCode} ${createPhone.trim()}`;

    setApplicationCollectedDetails((current) => ({
      ...current,
      [applicationRef]: {
        ...existingDetails,
        dateOfBirth: displayDateOfBirth,
        gender: createGender,
        religion: createReligion,
        caste: createCaste,
        maritalStatus: createMaritalStatus,
        occupation: createOccupation,
        email: createEmail.trim(),
        houseName: createHouseName.trim(),
        streetLocality: createStreetLocality.trim(),
        pincode: createPin.trim(),
        district: createDistrict,
        localBodyType: createLocalBodyType ? localBodyTypeLabels[createLocalBodyType] : existingDetails.localBodyType,
        localBody: createLocalBody,
        ward: createWard,
        mandalam: createMandalam,
        incomeRange: createIncomeRange,
      },
    }));
    setSelectedApplicationRecord((current) =>
      current && current.ref === applicationRef
        ? {
            ...current,
            applicantNameEn: createFullName.trim(),
            applicantNameMl: createFullName.trim(),
            aadhaar: createAadhaar.trim(),
            phone: formattedPhone,
            locationEn: updatedLocation,
            locationMl: updatedLocation,
          }
        : current,
    );
    setApplicationRecordEdits((current) => ({
      ...current,
      [applicationRef]: {
        applicantNameEn: createFullName.trim(),
        applicantNameMl: createFullName.trim(),
        aadhaar: createAadhaar.trim(),
        phone: formattedPhone,
        locationEn: updatedLocation,
        locationMl: updatedLocation,
      },
    }));

    setEditingApplicationRef("");
    setActiveTab("applications");
    setMobileSubPage("app_detail");
    setAppDetailView("overview");
    setCreateFlowStep("form");
    mobileContentRef.current?.scrollTo({ top: 0 });
    showDocumentActionNotice(lang === "ml" ? "അപേക്ഷാ വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്തു." : "Application details updated.");
  };

  // Scheme specific filter drawer states
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState<string>("all");
  const [schemeBeneficiaryGroupFilter, setSchemeBeneficiaryGroupFilter] = useState<string>("all");
  const [schemeEligibilityFilter, setSchemeEligibilityFilter] = useState<string>("all");
  const [schemeAppStatusFilter, setSchemeAppStatusFilter] = useState<string>("all");
  const [schemeDeptFilter, setSchemeDeptFilter] = useState<string>("all");
  const [schemeTypeFilter, setSchemeTypeFilter] = useState<string>("all");

  const formatDateWithDay = (date: Date) => {
    const validDate = date && !isNaN(date.getTime()) ? date : new Date(2026, 9, 12);
    const day = String(validDate.getDate()).padStart(2, "0");
    const month = String(validDate.getMonth() + 1).padStart(2, "0");
    const year = validDate.getFullYear();
    const dayOfWeek = validDate.getDay();

    const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysMl = ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"];

    const dayName = lang === "ml" ? daysMl[dayOfWeek] : daysEn[dayOfWeek];
    return `${dayName}, ${day}/${month}/${year}`;
  };


  const getAreasForMandalam = (mandalamVal: string, language: "ml" | "en") => {
    if (!mandalamVal || mandalamVal === "all") {
      return [
        { id: "sector_1", ml: "പപ്പനംകോട്", en: "Pappanamcode" },
        { id: "sector_2", ml: "കവടിയാർ", en: "Kowdiar" },
        { id: "sector_3", ml: "ഉള്ളൂർ", en: "Ulloor" },
        { id: "sector_4", ml: "ശ്രീകാര്യം", en: "Sreekaryam" },
      ];
    }

    const c = constituencies.find(
      (item) => item.id === mandalamVal || item.en.toLowerCase() === mandalamVal.toLowerCase()
    );

    if (c) {
      const nameEn = c.en;
      const nameMl = c.ml;

      if (mandalamVal === "kazhakuttam" || c.id === "tvm-c6") {
        return [
          { id: "kzh-1", ml: "പപ്പനംകോട്", en: "Pappanamcode" },
          { id: "kzh-2", ml: "കവടിയാർ", en: "Kowdiar" },
          { id: "kzh-3", ml: "ഉള്ളൂർ", en: "Ulloor" },
          { id: "kzh-4", ml: "ശ്രീകാര്യം", en: "Sreekaryam" },
        ];
      }

      if (c.id === "tvm-c7") {
        return [
          { id: "vatt-1", ml: "പട്ടം", en: "Pattom" },
          { id: "vatt-2", ml: "ശാസ്തമംഗലം", en: "Sasthamangalam" },
          { id: "vatt-3", ml: "പേരൂർക്കട", en: "Peroorkada" },
          { id: "vatt-4", ml: "കുടപ്പനക്കുന്ന്", en: "Kudappanakunnu" },
        ];
      }

      if (c.id === "tvm-c9") {
        return [
          { id: "nem-1", ml: "നേമം നോർത്ത്", en: "Nemom North" },
          { id: "nem-2", ml: "തിരുവല്ലം", en: "Thiruvallam" },
          { id: "nem-3", ml: "പ്രവാചംബലം", en: "Pravachambalam" },
          { id: "nem-4", ml: "കരമന", en: "Karamana" },
        ];
      }

      if (c.id === "kkd-c6" || mandalamVal === "balussery" || c.en.toLowerCase() === "balussery") {
        return [
          { id: "bal-1", ml: "ബാലുശ്ശേരി ടൗൺ", en: "Balussery Town" },
          { id: "bal-2", ml: "ഉണ്ണികുളം", en: "Unnikulam" },
          { id: "bal-3", ml: "ഉള്ള്യേരി", en: "Ullyeri" },
          { id: "bal-4", ml: "പനങ്ങാട്", en: "Panangad" },
          { id: "bal-5", ml: "കൂരാച്ചുണ്ട്", en: "Koorachundu" },
          { id: "bal-6", ml: "കോട്ടൂർ", en: "Kottur" },
          { id: "bal-7", ml: "അത്തോളി", en: "Atholi" },
          { id: "bal-8", ml: "കയാന", en: "Kayanna" },
        ];
      }

      return [
        { id: `${c.id}-sec1`, ml: `${nameMl} നോർത്ത്`, en: `${nameEn} North` },
        { id: `${c.id}-sec2`, ml: `${nameMl} സൗത്ത്`, en: `${nameEn} South` },
        { id: `${c.id}-sec3`, ml: `${nameMl} ഈസ്റ്റ്`, en: `${nameEn} East` },
        { id: `${c.id}-sec4`, ml: `${nameMl} വെസ്റ്റ്`, en: `${nameEn} West` },
        { id: `${c.id}-sec5`, ml: `${nameMl} സെൻട്രൽ`, en: `${nameEn} Central` },
      ];
    }

    return [
      { id: "sec_1", ml: "സെക്ടർ 1", en: "Sector 1" },
      { id: "sec_2", ml: "സെക്ടർ 2", en: "Sector 2" },
      { id: "sec_3", ml: "സെക്ടർ 3", en: "Sector 3" },
      { id: "sec_4", ml: "സെക്ടർ 4", en: "Sector 4" },
    ];
  };

    const getFormattedPeriodDisplay = () => {
    if (selectedPeriod === "this_month" && !periodCustomLabel) {
      return lang === "ml" ? "ഒക്ടോബർ 2026" : "October 2026";
    }
    if (selectedPeriod === "last_month" && !periodCustomLabel) {
      return lang === "ml" ? "സെപ്റ്റംബർ 2026" : "September 2026";
    }
    if (selectedPeriod === "this_year" && !periodCustomLabel) {
      return lang === "ml" ? "2026 വർഷം" : "Year 2026";
    }
    if (periodCustomLabel) {
      return periodCustomLabel;
    }
    return formatDateWithDay(currentSelectedDate);
  };

    const renderAppDetailSubpage = () => {
    const baseRecord = selectedApplicationRecord || {
      ref: "APP-2026-8910",
      schemeNameEn: "PM YASASVI Scholarship",
      schemeNameMl: "പിഎം യശസ്വി സ്കോളർഷിപ്പ്",
      categoryEn: "Scholarship",
      categoryMl: "സ്കോളർഷിപ്പ്",
      status: "pending" as const,
      applicantNameEn: "Ananya Ramesh",
      applicantNameMl: "അനന്യ രമേശ്",
      aadhaar: "XXXX-XXXX-8910",
      phone: "+91 94950 33445",
      locationEn: "Kazhakkoottam, TVM",
      locationMl: "കഴക്കൂട്ടം, തിരുവനന്തപുരം",
      annualIncome: "₹1,20,000",
      appliedDate: "05 Oct 2026",
      currentStep: 3,
      pendingDocs: ["Identity proof.pdf", "Mark sheet.pdf"],
      nextActionEn: "Awaiting document verification",
      nextActionMl: "രേഖാ പരിശോധന ബാക്കി നിൽക്കുന്നു",
      auditLog: [
        {
          titleEn: "Details received",
          titleMl: "വിവരങ്ങൾ ലഭിച്ചു",
          date: "24 Oct 2026",
          actorEn: "Ananya Ramesh",
          actorMl: "അനന്യ രമേശ്",
          status: "completed" as const,
        },
        {
          titleEn: "Documents checked",
          titleMl: "രേഖകൾ പരിശോധിച്ചു",
          date: "25 Oct 2026",
          actorEn: "Anjali Nair",
          actorMl: "അഞ്ജലി നായർ",
          status: "completed" as const,
        },
        {
          titleEn: "Submitted to scheme portal",
          titleMl: "സ്കീം പോർട്ടലിൽ സമർപ്പിച്ചു",
          date: "26 Oct 2026",
          actorEn: "Suresh Kumar",
          actorMl: "സുരേഷ് കുമാർ",
          status: "completed" as const,
        },
        {
          titleEn: "Under review",
          titleMl: "പരിശോധനയിൽ",
          date: "26 Oct 2026",
          actorEn: "Scheme Review Committee",
          actorMl: "സ്കീം അവലോകന സമിതി",
          status: "current" as const,
        },
      ],
      workflowStatus: "review" as const,
      assistedByEn: "Suresh Kumar",
      assistedByMl: "സുരേഷ് കുമാർ",
    };
    const record = {
      ...baseRecord,
      ...(applicationRecordEdits[baseRecord.ref] ?? {}),
    };

    const workflowStatus: MobileApplicationListStatus = record.workflowStatus ?? "pending";
    const workflowMeta = mobileApplicationStatusMeta[workflowStatus];
    const schemeName = lang === "ml" ? record.schemeNameMl : record.schemeNameEn;
    const categoryName = lang === "ml" ? record.categoryMl : record.categoryEn;
    const applicantName = lang === "ml" ? record.applicantNameMl : record.applicantNameEn;
    const applicantLocation = lang === "ml" ? record.locationMl : record.locationEn;
    const assistedBy = (lang === "ml" ? record.assistedByMl : record.assistedByEn) || "—";
    const uploadedDocs = record.pendingDocs ?? [];
    const documentCountLabel = String(uploadedDocs.length).padStart(2, "0");
    const auditEvents = record.auditLog ?? [];
    const latestDatedEvent = [...auditEvents].reverse().find((event) => event.date && event.date !== "Pending");
    const updatedDate = latestDatedEvent?.date ?? record.appliedDate;
    const schemeWebsiteUrl = getMobileSchemeWebsiteUrl(record.schemeNameEn);
    const isDocumentVerifiedStage = workflowStatus === "document_verification_completed";
    const isReceivedStage = workflowStatus === "application_received";
    const hasSchemeWebsite = Boolean(schemeWebsiteUrl);
    const statusLabelEn = isDocumentVerifiedStage ? "Document Verified" : workflowMeta.labelEn;
    const statusLabelMl = workflowMeta.labelMl;
    const needsTrackingIdEntry =
      !record.trackingId &&
      (workflowStatus === "applied" ||
        (workflowStatus === "document_verification_completed" && Boolean(record.applicationPortalOpened)));
    const showDecisionAction =
      (workflowStatus === "review" || workflowStatus === "applied") &&
      (workflowStatus === "review" || Boolean(record.trackingId));
    const isDecidedStage =
      workflowStatus === "assisted" || workflowStatus === "rejected" || workflowStatus === "beneficiary";

    const outcomeStage:
      | { key: string; labelEn: string; labelMl: string; tone: "success" | "danger" }
      | null =
      workflowStatus === "beneficiary"
        ? {
            key: "beneficiary",
            labelEn: "Benefit received",
            labelMl: "ആനുകൂല്യം ലഭിച്ചു",
            tone: "success",
          }
        : workflowStatus === "rejected"
          ? { key: "rejected", labelEn: "Rejected", labelMl: "നിരസിച്ചു", tone: "danger" }
          : workflowStatus === "assisted"
            ? {
                key: "approved",
                labelEn: "Approved",
                labelMl: "അംഗീകരിച്ചു",
                tone: "success",
              }
            : null;

    const progressStages: Array<{
      key: string;
      labelEn: string;
      labelMl: string;
      tone?: "success" | "danger";
    }> = [
      { key: "received", labelEn: "Received", labelMl: "ലഭിച്ചു" },
      { key: "documents", labelEn: "Document Verified", labelMl: "രേഖകൾ പരിശോധിച്ചു" },
      { key: "applied", labelEn: "Applied", labelMl: "അപേക്ഷിച്ചു" },
      { key: "review", labelEn: "In review", labelMl: "പരിശോധനയിൽ" },
      ...(outcomeStage ? [outcomeStage] : []),
    ];

    const currentStageIndex = outcomeStage
      ? progressStages.length - 1
      : isReceivedStage
        ? 1
        : workflowStatus === "pending"
          ? 0
          : workflowStatus === "document_verification_completed"
            ? 2
            : workflowStatus === "applied"
              ? 3
              : 3;

    const handleCopyTrackingId = async () => {
      if (!record.trackingId) return;
      try {
        await navigator.clipboard.writeText(record.trackingId);
        setTrackingCopied(true);
        window.setTimeout(() => setTrackingCopied(false), 1600);
      } catch {
        setTrackingCopied(false);
      }
    };

    const handleApplyScheme = () => {
      setSelectedApplicationRecord((current) => {
        const target = current ?? baseRecord;
        return {
          ...target,
          applicationPortalOpened: true,
          auditLog: [
            ...target.auditLog,
            createActivityEntry({
              titleEn: "Apply Scheme opened on the official portal",
              titleMl: "ഔദ്യോഗിക പോർട്ടലിൽ അപേക്ഷാ ഫോം തുറന്നു",
              actorEn: target.assistedByEn,
              actorMl: target.assistedByMl,
            }),
          ],
        };
      });
    };

    const handleVerifyDocuments = () => {
      const normalizeSchemeName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
      const applicationSchemeName = normalizeSchemeName(record.schemeNameEn);

      const linkedCollectionRecord = mobileCollectionRecords.find(
        (item) => normalizeSchemeName(item.scheme.titleEn) === applicationSchemeName
      );

      const matchedScheme: MobileEligibleScheme =
        mockEligibleSchemesList.find(
          (item) => normalizeSchemeName(item.titleEn) === applicationSchemeName
        )
        ?? mockEligibleSchemesList.find((item) => {
          const candidate = normalizeSchemeName(item.titleEn);
          return candidate.includes(applicationSchemeName) || applicationSchemeName.includes(candidate);
        })
        ?? linkedCollectionRecord?.scheme
        ?? {
          id: `APP-${applicationSchemeName.slice(0, 24) || "scheme"}`,
          titleEn: record.schemeNameEn,
          titleMl: record.schemeNameMl,
          benefitEn: "",
          benefitMl: "",
          matchLabelEn: "",
          matchLabelMl: "",
          deptEn: "Government of India",
          deptMl: "ഭാരത സർക്കാർ",
          categoryEn: record.categoryEn,
          categoryMl: record.categoryMl,
          requiredDocEn: "Aadhaar Card",
          requiredDocMl: "ആധാർ കാർഡ്",
          requiredFieldKeys: [],
        };

      setSelectedEligibleScheme({ ...matchedScheme });
      setSelectedEligibleSchemeIds([matchedScheme.id]);
      setSelectedSchemeName(matchedScheme.titleEn);
      setSchemeDetailsReturnStep("app_detail");
      setActiveCollectionReference(linkedCollectionRecord?.reference ?? "");
      hydrateDetailsFromRecord(linkedCollectionRecord ?? null, null);

      if (record.applicantNameEn && record.applicantNameEn !== "Applicant") {
        setCreateFullName(record.applicantNameEn);
      }
      const phoneDigits = (record.phone ?? "").replace(/\D/g, "").slice(-10);
      if (phoneDigits.length === 10) {
        setCreatePhone(phoneDigits);
      }

      setActiveTab("create");
      setMobileSubPage("none");
      setCreateFlowStep("scheme_details");
      mobileContentRef.current?.scrollTo({ top: 0 });
    };

    const trackingDestinationUrl = record.trackingUrl?.trim() || MOBILE_APPLICATION_TRACKING_URL;
    const hasTrackingDestination = (() => {
      try {
        const trackingDestination = new URL(trackingDestinationUrl);
        return trackingDestination.protocol === "http:" || trackingDestination.protocol === "https:";
      } catch {
        return false;
      }
    })();

    const detailRow = (label: string, value: string) => (
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-800">
        <span className="text-[12.5px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className="max-w-[60%] text-right text-[12.5px] font-bold leading-snug text-[#0F172A] dark:text-white">{value}</span>
      </div>
    );

    const detailSection = (
      Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>,
      title: string,
      rows: Array<{ label: string; value: string }>,
    ) => (
      <section>
        <div className="flex items-center gap-1.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#fff4e5] text-[#b45309] dark:bg-slate-800 dark:text-orange-300">
            <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
          </span>
          <h4 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
            {title}
          </h4>
        </div>
        <div className="mt-1">
          {rows.map((row) => (
            <React.Fragment key={row.label}>{detailRow(row.label, row.value)}</React.Fragment>
          ))}
        </div>
      </section>
    );

    const renderDetailNav = (titleEn: string, titleMl: string) => (
      <div className="flex h-11 items-center gap-2 border-b border-slate-200/80 pb-1 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setAppDetailView("overview")}
          aria-label={lang === "ml" ? "തിരികെ" : "Back"}
          className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff7ec] text-[#1b255a] dark:bg-slate-800 dark:text-white">
            <ArrowLeft className="h-4 w-4 stroke-[2]" />
          </span>
        </button>
        <h2 className="truncate text-[16px] font-bold leading-tight text-[#1b255a] dark:text-white">
          {lang === "ml" ? titleMl : titleEn}
        </h2>
      </div>
    );

    const collected = applicationCollectedDetails[record.ref] as
      | MobileApplicationCollectedDetails
      | undefined;
    const notRecorded = lang === "ml" ? "രേഖപ്പെടുത്തിയിട്ടില്ല" : "Not recorded";
    const collectedValue = (value?: string) => (value && value.trim() ? value : notRecorded);
    const districtValue = collected?.district ?? applicantLocation.split(",").pop()?.trim() ?? notRecorded;

    if (appDetailView !== "overview") {
      const viewTitle =
        appDetailView === "applicant"
          ? { en: "Applicant information", ml: "അപേക്ഷക വിവരങ്ങൾ" }
          : appDetailView === "scheme"
            ? { en: "Scheme-specific details", ml: "പദ്ധതി വിവരങ്ങൾ" }
            : appDetailView === "documents"
              ? {
                  en: `Documents (${documentCountLabel})`,
                  ml: `രേഖകൾ (${documentCountLabel})`,
                }
              : { en: "Application history", ml: "അപേക്ഷാ ചരിത്രം" };

      return (
        <div
          className="space-y-3 pt-0.5 animate-in fade-in duration-200 text-slate-900 dark:text-slate-100"
          style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
        >
          {renderDetailNav(viewTitle.en, viewTitle.ml)}
          <div
            className={
              appDetailView === "documents"
                ? "text-slate-900 dark:text-slate-100"
                : "rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            }
          >
            {appDetailView === "applicant" && (
              <div className="space-y-4">
                {detailSection(
                  UserRound,
                  lang === "ml" ? "വ്യക്തിഗത വിവരങ്ങൾ" : "Personal details",
                  [
                    { label: lang === "ml" ? "മുഴുവൻ പേര്" : "Full name", value: applicantName },
                    { label: lang === "ml" ? "ജനനത്തീയതി" : "Date of birth", value: collectedValue(collected?.dateOfBirth) },
                    { label: lang === "ml" ? "ലിംഗം" : "Gender", value: collectedValue(collected?.gender) },
                    { label: lang === "ml" ? "വിവാഹ നില" : "Marital status", value: collectedValue(collected?.maritalStatus) },
                    { label: lang === "ml" ? "മതം" : "Religion", value: collectedValue(collected?.religion) },
                    { label: lang === "ml" ? "സാമൂഹിക വിഭാഗം" : "Social category", value: collectedValue(collected?.caste) },
                    { label: lang === "ml" ? "തൊഴിൽ" : "Occupation", value: collectedValue(collected?.occupation) },
                    { label: lang === "ml" ? "ആധാർ നമ്പർ" : "Aadhaar number", value: record.aadhaar },
                  ],
                )}

                {detailSection(Phone, lang === "ml" ? "ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ" : "Contact", [
                  { label: lang === "ml" ? "മൊബൈൽ നമ്പർ" : "Mobile number", value: record.phone },
                  { label: lang === "ml" ? "ഇമെയിൽ" : "Email", value: collectedValue(collected?.email) },
                ])}

                {detailSection(MapPin, lang === "ml" ? "വിലാസം" : "Address", [
                  { label: lang === "ml" ? "വീട്ടുപേര്" : "House name", value: collectedValue(collected?.houseName) },
                  { label: lang === "ml" ? "തെരുവ് / പ്രദേശം" : "Street / locality", value: collectedValue(collected?.streetLocality) },
                  { label: lang === "ml" ? "തദ്ദേശ സ്ഥാപന തരം" : "Local body type", value: collectedValue(collected?.localBodyType) },
                  { label: lang === "ml" ? "തദ്ദേശ സ്ഥാപനം" : "Local body", value: collectedValue(collected?.localBody) },
                  { label: lang === "ml" ? "വാർഡ്" : "Ward", value: collectedValue(collected?.ward) },
                  { label: lang === "ml" ? "നിയമസഭാ മണ്ഡലം" : "Assembly Mandalam", value: collectedValue(collected?.mandalam) },
                  { label: lang === "ml" ? "ജില്ല" : "District", value: collectedValue(districtValue) },
                  { label: lang === "ml" ? "പിൻ കോഡ്" : "PIN code", value: collectedValue(collected?.pincode) },
                  { label: lang === "ml" ? "സംസ്ഥാനം" : "State", value: "Kerala" },
                ])}

                {detailSection(
                  ShieldCheck,
                  lang === "ml" ? "സാമൂഹിക-സാമ്പത്തിക വിവരങ്ങൾ" : "Socio-economic details",
                  [
                    { label: lang === "ml" ? "ന്യൂനപക്ഷ പദവി" : "Minority status", value: collectedValue(collected?.minorityStatus) },
                    {
                      label: lang === "ml" ? "വൈകല്യമുള്ള വ്യക്തി" : "Person with a disability",
                      value: collectedValue(collected?.disabilityStatus),
                    },
                    { label: lang === "ml" ? "വിദ്യാർത്ഥി പദവി" : "Student status", value: collectedValue(collected?.studentStatus) },
                    { label: lang === "ml" ? "തൊഴിൽ നില" : "Employment status", value: collectedValue(collected?.employmentStatus) },
                    { label: lang === "ml" ? "ബിപിഎൽ നില" : "BPL status", value: collectedValue(collected?.bplStatus) },
                    {
                      label: lang === "ml" ? "സാമ്പത്തിക ബുദ്ധിമുട്ട്" : "Financial hardship",
                      value: collectedValue(collected?.financialHardshipStatus),
                    },
                    {
                      label: lang === "ml" ? "വാർഷിക കുടുംബ വരുമാനം" : "Annual family income",
                      value: collectedValue(collected?.annualFamilyIncome ?? record.annualIncome),
                    },
                    {
                      label: lang === "ml" ? "വരുമാന പരിധി" : "Income range",
                      value: collectedValue(collected?.incomeRange),
                    },
                    { label: lang === "ml" ? "താമസ മേഖല" : "Area of residence", value: collectedValue(collected?.residenceArea) },
                  ],
                )}

                {detailSection(HandCoins, lang === "ml" ? "ബാങ്ക് വിവരങ്ങൾ" : "Bank details", [
                  {
                    label: lang === "ml" ? "അക്കൗണ്ട് നമ്പർ" : "Account number",
                    value: collectedValue(collected?.bankAccountNumber),
                  },
                  { label: lang === "ml" ? "ഐഎഫ്എസ്സി കോഡ്" : "IFSC code", value: collectedValue(collected?.bankIfscCode) },
                ])}
              </div>
            )}

            {appDetailView === "scheme" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#fff4e5] text-[#b45309] dark:bg-slate-800 dark:text-orange-300">
                      <Layers className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </span>
                    <h4 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                      {lang === "ml" ? "പദ്ധതി വിവരങ്ങൾ" : "Scheme details"}
                    </h4>
                  </div>
                  <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    {categoryName}
                  </p>
                  <h3 className="mt-1 text-[15px] font-extrabold leading-snug text-[#0F172A] dark:text-white">{schemeName}</h3>
                  <div className="mt-1">
                    {detailRow(lang === "ml" ? "വിഭാഗം" : "Category", categoryName)}
                    {detailRow(lang === "ml" ? "നില" : "Status", lang === "ml" ? statusLabelMl : statusLabelEn)}
                    {detailRow(lang === "ml" ? "അപ്ഡേറ്റ് ചെയ്തത്" : "Updated", updatedDate)}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {lang === "ml" ? "അടുത്ത നടപടി" : "Next action"}
                    </p>
                  </div>
                  <p className="mt-1 text-[12.5px] font-medium leading-snug text-slate-700 dark:text-slate-200">
                    {lang === "ml" ? record.nextActionMl : record.nextActionEn}
                  </p>
                </div>
              </div>
            )}

            {appDetailView === "documents" && (
              <div>
                <div className="space-y-2">
                  {uploadedDocs.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-[12px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      {lang === "ml" ? "രേഖകൾ അപ്‌ലോഡ് ചെയ്തിട്ടില്ല." : "No documents uploaded yet."}
                    </p>
                  ) : (
                    uploadedDocs.map((doc) => {
                      const kind = getMobileDocumentKind(doc);
                      const meta = mobileDocumentKindMeta[kind];
                      const DocIcon = meta.Icon;
                      return (
                        <div
                          key={doc}
                          className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                        >
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.tileClass}`}>
                            <DocIcon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12.5px] font-bold text-[#0F172A] dark:text-white">
                              {getMobileDocumentDisplayName(doc)}
                            </span>
                            <span className="mt-1 block text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
                              {getMobileDocumentSize(doc)}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleViewDocument(doc)}
                              aria-label={`${lang === "ml" ? "കാണുക" : "View"} ${doc}`}
                              title={lang === "ml" ? "കാണുക" : "View"}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-[#ff5500] dark:border-slate-700 dark:text-slate-300 dark:hover:border-orange-900 dark:hover:bg-orange-950/40 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={handleDownloadDocument}
                              aria-label={`${lang === "ml" ? "ഡൗൺലോഡ്" : "Download"} ${doc}`}
                              title={lang === "ml" ? "ഡൗൺലോഡ്" : "Download"}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-[#ff5500] dark:border-slate-700 dark:text-slate-300 dark:hover:border-orange-900 dark:hover:bg-orange-950/40 cursor-pointer"
                            >
                              <Download className="h-4 w-4" strokeWidth={2} />
                            </button>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {appDetailView === "history" && (
              <div className="space-y-4">
                {auditEvents.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-[12px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    {lang === "ml" ? "ഇതുവരെ പ്രവർത്തനങ്ങളൊന്നുമില്ല." : "No activity recorded yet."}
                  </p>
                ) : (
                  auditEvents.map((event, index) => {
                    const eventActorEn = event.actorEn?.trim();
                    const eventActorMl = event.actorMl?.trim();
                    const eventActor =
                      eventActorEn || eventActorMl
                        ? lang === "ml"
                          ? eventActorMl || eventActorEn
                          : eventActorEn || eventActorMl
                        : getMobileAuditFallbackActor({
                            event,
                            index,
                            applicantName,
                            assistedBy,
                            lang,
                          });
                    const timestamp = event.time ? `${event.date} · ${event.time}` : event.date;
                    const meta = eventActor && eventActor !== "—" ? `${eventActor} · ${timestamp}` : timestamp;

                    return (
                      <div key={`${event.titleEn}-${index}`} className="relative flex items-start gap-3 pb-4 last:pb-0">
                        {index < auditEvents.length - 1 && (
                          <span className="absolute left-[9px] top-[22px] bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                        )}
                        <span
                          className={`relative z-10 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full ${
                            event.status === "completed"
                              ? "bg-emerald-500 text-white"
                              : event.status === "current"
                                ? "border-2 border-[#ff5500] bg-white text-[#ff5500] dark:bg-slate-900"
                                : "border-2 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                          }`}
                        >
                          {event.status === "completed" ? (
                            <Check className="h-3 w-3 stroke-[3]" />
                          ) : (
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                event.status === "current" ? "bg-[#ff5500]" : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] font-bold leading-snug text-[#0F172A] dark:text-white">
                            {lang === "ml" ? event.titleMl : event.titleEn}
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                            {meta}
                          </p>
                          {event.notes && (
                            <div className="mt-1.5 rounded-lg border border-[#f1ddc7] bg-[#fffaf3] px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/60">
                              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                                {lang === "ml" ? "കുറിപ്പ്" : "Notes"}
                              </p>
                              <p className="mt-0.5 text-[11px] font-medium leading-snug text-[#0F172A] dark:text-slate-200">
                                {event.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

      return (
      <div
        className="space-y-2.5 pt-0.5 animate-in fade-in duration-200 text-slate-900 dark:text-slate-100"
        style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
      >
        {/* Navigation Row */}
        <div className="relative flex h-9 items-center justify-between gap-2 border-b border-slate-200/80 pb-0.5 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSubPage(appDetailReturnSubPage)}
              aria-label={
                appDetailReturnSubPage === "user_detail"
                  ? (lang === "ml" ? "ഉപയോക്തൃ വിവരങ്ങളിലേക്ക് മടങ്ങുക" : "Back to User Details")
                  : (lang === "ml" ? "അപേക്ഷകളിലേക്ക് മടങ്ങുക" : "Back to Applications")
              }
              className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff7ec] text-[#1b255a] dark:bg-slate-800 dark:text-white">
                <ArrowLeft className="h-3.5 w-3.5 stroke-[2]" />
              </span>
            </button>
            <h2 className="truncate text-[16px] font-bold leading-tight text-[#1b255a] dark:text-white">
              {appDetailReturnSubPage === "user_detail"
                ? (lang === "ml" ? "ഉപയോക്തൃ വിവരങ്ങളിലേക്ക് മടങ്ങുക" : "Back to User Details")
                : (lang === "ml" ? "അപേക്ഷകളിലേക്ക് മടങ്ങുക" : "Back to Applications")}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setAppDetailMenuOpen((open) => !open)}
            aria-label={lang === "ml" ? "കൂടുതൽ" : "More options"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#0F172A] transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
          >
            <MoreVertical className="h-4 w-4 stroke-[2]" />
          </button>

          {appDetailMenuOpen && (
            <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  setAppDetailMenuOpen(false);
                  setAppDetailView("history");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Clock3 className="h-4 w-4" />
                <span>{lang === "ml" ? "ചരിത്രം കാണുക" : "View history"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppDetailMenuOpen(false);
                  setIsSahAiOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Headset className="h-4 w-4" />
                <span>{lang === "ml" ? "സഹായം" : "Contact support"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Application progress + tracking */}
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-[15px] font-extrabold text-[#0F172A] dark:text-white">
            {lang === "ml" ? "അപേക്ഷയുടെ പുരോഗതി" : "Application progress"}
          </h3>

          <div className="mt-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-full items-start">
              {progressStages.map((stage, index) => {
                const nextStage = progressStages[index + 1];
                const isReached =
                  index < currentStageIndex || (stage.tone === "success" && index === currentStageIndex);
                const isDanger = stage.tone === "danger" && index === currentStageIndex;
                const isCurrent = index === currentStageIndex && !isDanger && !isReached;

                const connectorTone =
                  nextStage?.tone === "danger"
                    ? "bg-rose-300 dark:bg-rose-900/70"
                    : index < currentStageIndex - 1 ||
                        (nextStage?.tone === "success" && index + 1 <= currentStageIndex)
                      ? "bg-emerald-400"
                      : "bg-slate-200 dark:bg-slate-700";

                return (
                  <div key={stage.key} className="relative flex flex-1 flex-col items-center text-center">
                    {nextStage && (
                      <span
                        aria-hidden
                        className={`absolute left-1/2 top-[14px] h-[2.5px] w-full -translate-y-1/2 ${connectorTone}`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${
                        isDanger
                          ? "bg-rose-500 text-white"
                          : isReached
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                              ? "border-2 border-[#ff5500] bg-white dark:bg-slate-900"
                              : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      {isDanger ? (
                        <X className="h-3.5 w-3.5 stroke-[3]" />
                      ) : isReached ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isCurrent ? "bg-[#ff5500]" : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                      )}
                    </span>
                    <span
                      className={`mt-1 max-w-full whitespace-normal px-0.5 text-[11.5px] leading-[1.15] ${
                        isDanger
                          ? "font-bold text-rose-600 dark:text-rose-400"
                          : isCurrent
                            ? "font-bold text-[#0F172A] dark:text-white"
                            : isReached
                              ? "font-medium text-[#0F172A] dark:text-white"
                              : "font-medium text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {lang === "ml" ? stage.labelMl : stage.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {isDocumentVerifiedStage && !record.applicationPortalOpened ? (
            <div className="mt-2">
              <a
                href={hasSchemeWebsite ? schemeWebsiteUrl : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!hasSchemeWebsite}
                onClick={(event) => {
                  if (!hasSchemeWebsite) event.preventDefault();
                  handleApplyScheme();
                }}
                className={`flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-[#ff5500] text-[12px] font-extrabold text-white shadow-xs transition-colors hover:bg-orange-600 cursor-pointer active:scale-[0.99] ${
                  hasSchemeWebsite ? "" : "pointer-events-none opacity-50"
                }`}
              >
                <span>{lang === "ml" ? "പദ്ധതിക്ക് അപേക്ഷിക്കുക" : "Apply Scheme"}</span>
                <ChevronRight className="h-4 w-4 stroke-[2.5]" />
              </a>
              {!hasSchemeWebsite && (
                <p className="mt-1 text-[10.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                  {lang === "ml"
                    ? "ഈ പദ്ധതിയുടെ ഔദ്യോഗിക വെബ്സൈറ്റ് ലഭ്യമല്ല."
                    : "Official scheme website is not available for this scheme."}
                </p>
              )}
            </div>
          ) : isReceivedStage ? (
            <button
              type="button"
              onClick={handleVerifyDocuments}
              className="mt-2 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-[#ff5500] text-[12px] font-extrabold text-white shadow-xs transition-colors hover:bg-orange-600 cursor-pointer active:scale-[0.99]"
            >
              <span>{lang === "ml" ? "രേഖകൾ പരിശോധിക്കുക" : "Verify Documents"}</span>
              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          ) : (
            <>
              <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 dark:bg-slate-800/60">
                <p className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
                  {lang === "ml" ? "ട്രാക്കിംഗ് ഐഡി" : "Tracking ID"}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1">
                    {record.trackingId ? (
                      <>
                        <span className="truncate text-[13.5px] font-extrabold tracking-wide text-[#0F172A] dark:text-white">
                          {record.trackingId}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyTrackingId}
                          aria-label={lang === "ml" ? "ട്രാക്കിംഗ് ഐഡി പകർത്തുക" : "Copy tracking ID"}
                          title={lang === "ml" ? "പകർത്തുക" : "Copy"}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200/70 cursor-pointer dark:text-slate-400 dark:hover:bg-slate-700"
                        >
                          {trackingCopied ? (
                            <Check className="h-4 w-4 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4 stroke-[1.7]" />
                          )}
                        </button>
                      </>
                    ) : (
                      <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                        {lang === "ml" ? "ട്രാക്കിംഗ് ഐഡി ലഭ്യമല്ല" : "Tracking ID not available"}
                      </span>
                    )}
                  </div>

                  {(record.trackingId || !needsTrackingIdEntry) && !isDecidedStage && (
                    <button
                      type="button"
                      onClick={() => {
                        setTrackingIdDraft(record.trackingId ?? "");
                        setIsTrackingSheetOpen(true);
                      }}
                      className="flex min-h-8 shrink-0 items-center gap-1 rounded-md px-1 text-[12px] font-extrabold text-[#ff5500] transition-colors hover:text-orange-600 cursor-pointer"
                    >
                      {record.trackingId ? (
                        <Pencil className="h-3 w-3 stroke-[2.5]" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      )}
                      <span>
                        {record.trackingId ? (lang === "ml" ? "എഡിറ്റ്" : "Edit") : lang === "ml" ? "ചേർക്കുക" : "Add"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {!isDecidedStage && (needsTrackingIdEntry ? (
                <button
                  type="button"
                  onClick={() => {
                    setTrackingIdDraft("");
                    setIsTrackingSheetOpen(true);
                  }}
                  className="mt-1.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-[#ff5500] text-[12px] font-extrabold text-white shadow-xs transition-colors hover:bg-orange-600 cursor-pointer active:scale-[0.99]"
                >
                  <span>{lang === "ml" ? "ട്രാക്കിംഗ് ഐഡി നൽകുക" : "Enter Tracking ID"}</span>
                  <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                </button>
              ) : (
                <>
                  <div className="mt-1.5 flex items-center gap-2">
                    <a
                      href={hasTrackingDestination ? trackingDestinationUrl : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!hasTrackingDestination}
                      onClick={(event) => {
                        if (!hasTrackingDestination) event.preventDefault();
                      }}
                      className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-[12px] font-extrabold transition-colors cursor-pointer active:scale-[0.99] ${
                        showDecisionAction
                          ? "border border-[#ff5500] bg-white text-[#ff5500] hover:bg-[#fff4e5] dark:border-orange-700 dark:bg-slate-900 dark:text-orange-300"
                          : "bg-[#ff5500] text-white shadow-xs hover:bg-orange-600"
                      }`}
                    >
                      <span>{lang === "ml" ? "അപേക്ഷ ട്രാക്ക് ചെയ്യുക" : "Track Application"}</span>
                      <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                    </a>

                    {showDecisionAction && (
                      <button
                        type="button"
                        onClick={handleOpenDecisionSheet}
                        className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#ff5500] text-[12px] font-extrabold text-white shadow-xs transition-colors hover:bg-orange-600 cursor-pointer active:scale-[0.99]"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>{lang === "ml" ? "തീരുമാനം സ്ഥിരീകരിക്കുക" : "Confirm Decision"}</span>
                      </button>
                    )}
                  </div>

                  {!hasTrackingDestination && (
                    <p className="mt-1 text-[10.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                      {lang === "ml"
                        ? "ഈ അപേക്ഷയ്ക്ക് ട്രാക്കിംഗ് ലിങ്ക് ലഭ്യമല്ല."
                        : "Tracking link is not available for this application."}
                    </p>
                  )}
                </>
              ))}
            </>
          )}
        </div>

        {/* Applicant */}
        <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <h3 className="min-w-0 truncate text-[15px] font-extrabold text-[#0F172A] dark:text-white">
              {lang === "ml" ? "അപേക്ഷകൻ" : "Applicant"}
            </h3>
            <MobileApplicationStatusBadge
              status={workflowStatus}
              lang={lang}
              size="medium"
              labelEn={statusLabelEn}
              labelMl={statusLabelMl}
            />
          </div>
          <div className="mt-0.5">
            <div className="flex items-start gap-2 py-0.5">
              <UserRound className="mt-0.5 h-[18px] w-[18px] shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold leading-snug text-[#0F172A] dark:text-white">{applicantName}</p>
                <p className="mt-0.5 text-[11.5px] font-medium text-slate-500 dark:text-slate-400">{applicantLocation}</p>
              </div>
            </div>
            {/* Scheme summary */}
            <div className="mt-1.5 rounded-xl border border-[#efe3d3] bg-[#fffcf7] px-2.5 py-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex min-w-0 items-center gap-1.5">
                <h3
                  className="min-w-0 truncate text-[13px] font-semibold leading-[1.35] text-[#0F172A] dark:text-white"
                  title={schemeName}
                >
                  {schemeName}
                </h3>
                {schemeWebsiteUrl && (
                  <a
                    href={schemeWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                      lang === "ml"
                        ? "പദ്ധതിയുടെ ഔദ്യോഗിക വെബ്സൈറ്റ് തുറക്കുക"
                        : "Open official scheme website"
                    }
                    title={
                      lang === "ml"
                        ? "പദ്ധതിയുടെ ഔദ്യോഗിക വെബ്സൈറ്റ്"
                        : "Open official scheme website"
                    }
                    className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded text-slate-400 transition-colors before:absolute before:-inset-2.5 before:content-[''] hover:bg-[#fff4e5] hover:text-[#ff5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-orange-300"
                  >
                    <ExternalLink className="h-[13px] w-[13px]" strokeWidth={2.1} />
                  </a>
                )}
              </div>
              <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                <img
                  src={getMobileCategoryIconSrc(record.categoryEn)}
                  alt=""
                  aria-hidden
                  className="h-3.5 w-3.5 shrink-0 object-contain"
                />
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  {categoryName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Application information */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2 px-3.5 pt-3">
            <h3 className="text-[15px] font-extrabold text-[#0F172A] dark:text-white">
              {lang === "ml" ? "അപേക്ഷാ വിവരങ്ങൾ" : "Application information"}
            </h3>
            <button
              type="button"
              onClick={() => handleEditApplicationDetails()}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-[#f1ddc7] bg-[#fff7ec] px-2.5 text-[11px] font-extrabold text-[#ff5500] transition-colors hover:border-orange-300 hover:bg-[#ffefdd] dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300 cursor-pointer"
            >
              <Pencil className="h-3 w-3 stroke-[2.5]" />
              {lang === "ml" ? "തിരുത്തുക" : "Edit"}
            </button>
          </div>
          <div className="mt-0.5 px-3.5 pb-1.5">
            <button
              type="button"
              onClick={() => setAppDetailView("applicant")}
              className="flex min-h-11 w-full items-center gap-2.5 border-b border-slate-100 py-2 text-left cursor-pointer dark:border-slate-800"
            >
              <UserRound className="h-[18px] w-[18px] shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />
              <span className="min-w-0 flex-1 text-[13px] font-semibold text-[#0F172A] dark:text-white">
                {lang === "ml" ? "അപേക്ഷക വിവരങ്ങൾ" : "Applicant information"}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => setAppDetailView("scheme")}
              className="flex min-h-11 w-full items-center gap-2.5 border-b border-slate-100 py-2 text-left cursor-pointer dark:border-slate-800"
            >
              <ClipboardList className="h-[18px] w-[18px] shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />
              <span className="min-w-0 flex-1 text-[13px] font-semibold text-[#0F172A] dark:text-white">
                {lang === "ml" ? "പദ്ധതി വിവരങ്ങൾ" : "Scheme-specific details"}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => setAppDetailView("documents")}
              className="flex min-h-11 w-full items-center gap-2.5 py-2 text-left cursor-pointer"
            >
              <Paperclip className="h-[18px] w-[18px] shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-[#0F172A] dark:text-white">
                  {lang === "ml" ? "രേഖകൾ" : "Documents"}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {lang === "ml" ? `${uploadedDocs.length} ഫയലുകൾ അപ്‌ലോഡ് ചെയ്തു` : `${uploadedDocs.length} files uploaded`}
                </span>
              </span>
              <Eye className="h-4 w-4 shrink-0 text-slate-400" />
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
            <div className="flex min-h-11 w-full items-center gap-2.5 border-t border-slate-100 py-2 dark:border-slate-800">
              <UserCheck className="h-[18px] w-[18px] shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                  <span>{lang === "ml" ? "സഹായം നൽകിയത്" : "Assisted by"}</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">
                    {lang === "ml"
                      ? `(അവസാനം അപ്ഡേറ്റ് ചെയ്തത് ${updatedDate})`
                      : `(Last updated ${updatedDate})`}
                  </span>
                </p>
                <p className="mt-0.5 truncate text-[13px] font-semibold leading-snug text-[#0F172A] dark:text-white">
                  {assistedBy}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help */}
        <button
          type="button"
          onClick={() => setIsSahAiOpen(true)}
          className="flex w-full items-center gap-2 rounded-xl border border-[#f1ddc7] bg-[#fff8ee] px-4 py-3 text-left transition-colors hover:bg-[#fff3e2] cursor-pointer dark:border-orange-900/50 dark:bg-slate-900"
        >
          <Headset className="h-5 w-5 shrink-0 text-[#ff5500]" strokeWidth={1.8} />
          <span className="min-w-0 flex-1 text-[12px] font-semibold leading-snug text-[#0F172A] dark:text-slate-100">
            {lang === "ml" ? "ഈ അപേക്ഷയിൽ സഹായം വേണോ?" : "Need help with this application?"}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[12px] font-extrabold text-[#ff5500]">
            {lang === "ml" ? "പിന്തുണ" : "Contact support"}
            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          </span>
        </button>
      </div>
    );
  };

    const handleStepPeriod = (daysOffset: number) => {
    const baseDate = currentSelectedDate && !isNaN(currentSelectedDate.getTime()) ? currentSelectedDate : new Date(2026, 9, 12);
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + daysOffset);
    setCurrentSelectedDate(newDate);
    setPeriodCustomLabel(formatDateWithDay(newDate));
  };

    const [activeDistrictFilter, setActiveDistrictFilter] = useState<string>("all");
  const [filterGeoScope, setFilterGeoScope] = useState<string>("state");
  // Mode selection: 'assembly' | 'local_body'
  const [geoMode, setGeoMode] = useState<'assembly' | 'local_body'>('assembly');
  const [appliedGeoMode, setAppliedGeoMode] = useState<'assembly' | 'local_body'>('assembly');

  // Assembly/Booth Draft State
  const [draftDistrict, setDraftDistrict] = useState<string>('all');
  const [draftMandalam, setDraftMandalam] = useState<string>('all');
  const [draftBooth, setDraftBooth] = useState<string>('all');

  // Assembly/Booth Applied State
  const [appliedDistrict, setAppliedDistrict] = useState<string>('all');
  const [appliedMandalam, setAppliedMandalam] = useState<string>('all');
  const [appliedBooth, setAppliedBooth] = useState<string>('all');

  // Local Bodies Draft State
  const [draftLBType, setDraftLBType] = useState<string>('all');
  const [draftLBDistrict, setDraftLBDistrict] = useState<string>('all');
  const [draftLocalBody, setDraftLocalBody] = useState<string>('all');
  const [draftWard, setDraftWard] = useState<string>('all');

  // Local Bodies Applied State
  const [appliedLBType, setAppliedLBType] = useState<string>('all');
  const [appliedLBDistrict, setAppliedLBDistrict] = useState<string>('all');
  const [appliedLocalBody, setAppliedLocalBody] = useState<string>('all');
  const [appliedWard, setAppliedWard] = useState<string>('all');

  const [selectedDistrict, setSelectedDistrict] = useState<string>("tvm");
  const [selectedMandalam, setSelectedMandalam] = useState<string>("kazhakuttam");
  const [selectedArea, setSelectedArea] = useState<string>("sector_1");
  const [selectedBooth, setSelectedBooth] = useState<string>("booth_101");
  const [filterScheme, setFilterScheme] = useState<string>("all");
  const [filterSchemeCategory, setFilterSchemeCategory] = useState<string>("all");
  const [filterSchemeType, setFilterSchemeType] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterPerformance, setFilterPerformance] = useState<string>("all");
  const [leaderboardCategory, setLeaderboardCategory] = useState<"districts" | "mandalam" | "area" | "booths" | "workers">("districts");
  const [announcementIndex, setAnnouncementIndex] = useState<number>(0);
  const [eventIndex, setEventIndex] = useState<number>(0);
  const tabScrollRef = useRef<HTMLDivElement>(null);

  // Auto-rotate Announcements and Events carousels every 3 seconds (3000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % 4);
      setEventIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic scaling multiplier based on selected Geography Scope for realistic filtered analytics
  const geoScopeMultiplier =
    filterGeoScope === "booth"
      ? 0.0008
      : filterGeoScope === "area"
      ? 0.003
      : filterGeoScope === "mandalam"
      ? 0.012
      : filterGeoScope === "district"
      ? 0.08
      : 1.0;

  const rawMetrics = metricsByPeriod[selectedPeriod] || metricsByPeriod.this_month;

  const currentMetrics = {
    ...rawMetrics,
    users: Math.max(12, Math.round((rawMetrics?.users || 0) * geoScopeMultiplier)),
    pending: Math.max(3, Math.round((rawMetrics?.pending || 0) * geoScopeMultiplier)),
    rejected: Math.max(1, Math.round((rawMetrics?.rejected || 0) * geoScopeMultiplier)),
    beneficiaries: Math.max(5, Math.round((rawMetrics?.beneficiaries || 0) * geoScopeMultiplier)),
    assisted: Math.max(4, Math.round((rawMetrics?.assisted || 0) * geoScopeMultiplier)),
    schemes: rawMetrics?.schemes || 128,
    boothCoverage: rawMetrics?.boothCoverage || "94.2%",
    convertedBooths: rawMetrics?.convertedBooths || "23,550",
    slaBreaches: Math.max(0, Math.round((rawMetrics?.slaBreaches || 0) * geoScopeMultiplier)),
  };

  const savedRecordsForActiveFilter: MobileApplicationRecord[] =
    applicationStatusFilter === "all" ||
    applicationStatusFilter === "pending" ||
    applicationStatusFilter === "application_received"
      ? savedApplicationRecords
      : [];

  const applicationRecordsForActiveFilter: MobileApplicationRecord[] = [
    ...savedRecordsForActiveFilter,
    ...(applicationStatusFilter === "all"
      ? mobileApplicationAllPreviewRecords
      : applicationStatusFilter === "pending"
        ? mobileApplicationRecordsByStatus.application_received
        : applicationStatusFilter === "assisted"
          ? mobileApplicationRecordsByStatus.beneficiary
          : mobileApplicationRecordsByStatus[applicationStatusFilter]),
  ];

  const applicationQuery = applicationSearchQuery.trim().toLowerCase();
  const displayedMobileApplicationRecords = applicationRecordsForActiveFilter.filter((application) => {
    if (!applicationQuery) return true;
    return [
      application.schemeNameEn,
      application.schemeNameMl,
      application.applicantNameEn,
      application.applicantNameMl,
      application.categoryEn,
      application.categoryMl,
      application.locationEn,
      application.locationMl,
      application.ref,
      application.trackingId ?? "",
    ].some((value) => value.toLowerCase().includes(applicationQuery));
  });

  const getApplicationCardMeta = (application: MobileApplicationRecord) =>
    application.trackingId
      ? `${lang === "ml" ? "ട്രാക്കിംഗ് ഐഡി" : "Tracking ID"}: ${application.trackingId}`
      : `${lang === "ml" ? "സേവ്" : "Saved"}: ${application.appliedDate}`;

  const mobileApplicationUsers = (() => {
    const usersByName = new globalThis.Map<
      string,
      {
        id: string;
        nameEn: string;
        nameMl: string;
        locationEn: string;
        locationMl: string;
        phone: string;
        applicationCount: number;
      }
    >();

    [...savedApplicationRecords, ...mobileApplicationAllPreviewRecords].forEach((application) => {
      const key = application.applicantNameEn.trim().toLowerCase();
      const existing = usersByName.get(key);
      if (existing) {
        existing.applicationCount += 1;
        if (!existing.phone && application.phone) existing.phone = application.phone;
        return;
      }
      usersByName.set(key, {
        id: key,
        nameEn: application.applicantNameEn,
        nameMl: application.applicantNameMl,
        locationEn: application.locationEn,
        locationMl: application.locationMl,
        phone: application.phone,
        applicationCount: 1,
      });
    });

    return Array.from(usersByName.values()).sort(
      (a, b) => b.applicationCount - a.applicationCount || a.nameEn.localeCompare(b.nameEn),
    );
  })();

  const userQuery = userSearchQuery.trim().toLowerCase();
  const filteredMobileApplicationUsers = mobileApplicationUsers.filter((user) =>
    !userQuery
      ? true
      : [user.nameEn, user.nameMl, user.locationEn, user.locationMl, user.phone].some((value) =>
          value.toLowerCase().includes(userQuery),
        ),
  );

  const selectedApplicationUser = selectedApplicationUserId
    ? mobileApplicationUsers.find((user) => user.id === selectedApplicationUserId) ?? null
    : null;

  const selectedApplicationUserApplications = selectedApplicationUser
    ? [...savedApplicationRecords, ...mobileApplicationAllPreviewRecords].filter(
        (application) => application.applicantNameEn.trim().toLowerCase() === selectedApplicationUser.id,
      )
    : [];

  const renderMobileApplicationListCard = (application: MobileApplicationRecord) => (
    <div
      key={application.ref}
      onClick={() => {
        setAppDetailReturnSubPage(mobileSubPage === "user_detail" ? "user_detail" : "applications");
        setSelectedApplicationRecord(application);
        setMobileSubPage("app_detail");
      }}
      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="inline-flex h-[18px] items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:text-slate-200">
          <img
            src={getMobileCategoryIconSrc(application.categoryEn)}
            alt=""
            className="h-3.5 w-3.5 shrink-0 object-contain"
          />
          {lang === "ml" ? application.categoryMl : application.categoryEn}
        </span>
        <MobileApplicationStatusBadge
          status={application.workflowStatus ?? "application_received"}
          lang={lang}
        />
      </div>
      <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-tight mt-2">
        {lang === "ml" ? application.schemeNameMl : application.schemeNameEn}
      </h5>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 font-medium">
        {lang === "ml"
          ? `അപേക്ഷകൻ: ${application.applicantNameMl} · ${application.locationMl}`
          : `Applicant: ${application.applicantNameEn} · ${application.locationEn}`}
      </p>
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2.5 text-[10.5px] text-slate-400 font-medium">
        <span className={
          application.trackingId
            ? "font-mono text-[10px] text-slate-400"
            : "text-[10px] font-medium text-slate-400"
        }>
          {getApplicationCardMeta(application)}
        </span>
        <span className="flex items-center gap-0.5 text-[#ff5500] dark:text-orange-400 font-extrabold text-[10.5px]">
          {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
          <ChevronRight className="h-3 w-3 stroke-[2.5]" />
        </span>
      </div>
    </div>
  );

  const openMobileApplicationDetail = (application: MobileApplicationRecord) => {
    setSelectedApplicationRecord(application);
    setAppDetailView("overview");
    setAppDetailMenuOpen(false);
    setActiveTab("applications");
    setMobileSubPage("app_detail");
    mobileContentRef.current?.scrollTo({ top: 0 });
  };

  const renderLatestSavedApplicationsSection = () => {
    if (latestSavedApplications.length === 0) return null;

    return (
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between px-0.5 pb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
              <ClipboardList className="h-3.5 w-3.5 stroke-[2.2]" />
            </span>
            <h3 className="font-display text-xs sm:text-[13px] font-black text-[#0a0f1d] dark:text-white tracking-tight truncate">
              {lang === "ml" ? "പുതിയ അപേക്ഷകൾ" : "Latest Applications"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab("applications");
              setApplicationStatusFilter("all");
              setApplicationSearchQuery("");
              setMobileSubPage("none");
            }}
            className="flex items-center gap-0.5 text-[11px] font-bold text-[#f95700] hover:underline cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>{lang === "ml" ? "എല്ലാം" : "View all"}</span>
              <span className="rounded-full bg-orange-500/10 dark:bg-orange-950/40 text-[#f95700] px-1.5 py-0.5 text-[9.5px] font-black leading-none border border-orange-200/80 dark:border-orange-900/50">
                {String(latestSavedApplications.length).padStart(2, "0")}
              </span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>

        <div className="space-y-2">
          {latestSavedApplications.map((application) => {
            return (
              <div
                key={application.ref}
                onClick={() => openMobileApplicationDetail(application)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="inline-flex h-[18px] min-w-0 max-w-[68%] items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 text-[9px] font-extrabold uppercase tracking-wide text-slate-700 whitespace-nowrap dark:border-slate-700 dark:text-slate-200">
                    <img
                      src={getMobileCategoryIconSrc(application.categoryEn)}
                      alt=""
                      className="h-3.5 w-3.5 shrink-0 object-contain"
                    />
                    <span className="truncate">
                      {lang === "ml" ? application.categoryMl : application.categoryEn}
                    </span>
                  </span>
                  <MobileApplicationStatusBadge
                    status={application.workflowStatus ?? "application_received"}
                    lang={lang}
                  />
                </div>
                <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-tight mt-2">
                  {lang === "ml" ? application.schemeNameMl : application.schemeNameEn}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 font-medium">
                  {lang === "ml"
                    ? `അപേക്ഷകൻ: ${application.applicantNameMl} · ${application.locationMl}`
                    : `Applicant: ${application.applicantNameEn} · ${application.locationEn}`}
                </p>
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2.5 text-[10.5px] text-slate-400 font-medium">
                  <span className="text-[10px] text-slate-400">
                    {getApplicationCardMeta(application)}
                  </span>
                  <span className="flex items-center gap-0.5 text-[#ff5500] dark:text-orange-400 font-extrabold text-[10.5px]">
                    {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                    <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

    // Human readable active location label
  const activeLocationLabel = React.useMemo(() => {
    if (filterGeoScope === "booth") {
      const currentAreas = getAreasForMandalam(selectedMandalam, lang);
      const foundArea = currentAreas.find(a => a.id === selectedArea);
      const areaName = foundArea ? foundArea[lang] : "Area";
      const c = constituencies.find(item => item.id === selectedMandalam || item.en.toLowerCase() === selectedMandalam.toLowerCase());
      const mandalamName = c ? c[lang] : "Mandalam";
      const boothNum = selectedBooth.replace("booth_", "Booth #");
      return `${boothNum} (${areaName}, ${mandalamName})`;
    }
    if (filterGeoScope === "area") {
      const currentAreas = getAreasForMandalam(selectedMandalam, lang);
      const foundArea = currentAreas.find(a => a.id === selectedArea);
      const areaName = foundArea ? foundArea[lang] : "Area";
      const c = constituencies.find(item => item.id === selectedMandalam || item.en.toLowerCase() === selectedMandalam.toLowerCase());
      const mandalamName = c ? c[lang] : "Mandalam";
      return `${areaName} (${mandalamName})`;
    }
    if (filterGeoScope === "mandalam") {
      const c = constituencies.find(item => item.id === selectedMandalam || item.en.toLowerCase() === selectedMandalam.toLowerCase());
      const mandalamName = c ? c[lang] : "Mandalam";
      const distObj = districts.find(d => d.id === selectedDistrict);
      const distName = distObj ? distObj[lang] : "District";
      return `${mandalamName} (${distName})`;
    }
    if (filterGeoScope === "district") {
      const distObj = districts.find(d => d.id === selectedDistrict);
      return distObj ? `${distObj[lang]} ${lang === "ml" ? "ജില്ല" : "District"}` : "District Level";
    }
    return lang === "ml" ? "എല്ലാ കേരളവും • സംസ്ഥാന തലം" : "Kerala State (State-Wide)";
  }, [filterGeoScope, selectedDistrict, selectedMandalam, selectedArea, selectedBooth, lang]);
  // Applications = sum of pending, assisted (In Review), rejected, and beneficiaries (Approved)
  const applicationsCount =
    currentMetrics.pending +
    currentMetrics.assisted +
    currentMetrics.rejected +
    currentMetrics.beneficiaries;
  const resolvedCount = currentMetrics.beneficiaries + currentMetrics.assisted;
  const resolutionRateVal = applicationsCount > 0
    ? ((currentMetrics.beneficiaries / applicationsCount) * 100).toFixed(1)
    : "0.0";

  const dashboardFilterChips = React.useMemo(() => {
    const chips: FilterChip[] = [];
    if (filterSchemeType !== "all") {
      chips.push({
        id: "schemeType",
        label: `Scheme Type: ${filterSchemeType === "central" ? "Central" : "State"}`,
        onRemove: () => setFilterSchemeType("all"),
      });
    }
    if (filterSchemeCategory !== "all") {
      const catNames: Record<string, string> = {
        agriculture: "Agriculture",
        health: "Health",
        housing: "Housing",
        education: "Education",
        social_security: "Social Security",
        employment: "Employment",
      };

        chips.push({
        id: "category",
        label: `Category: ${catNames[filterSchemeCategory] || filterSchemeCategory}`,
        onRemove: () => setFilterSchemeCategory("all"),
      });
    }
    if (filterDepartment !== "all") {
      const deptNames: Record<string, string> = {
        agriculture_min: "Agriculture",
        health_min: "Health & Family Welfare",
        housing_min: "Housing",
        social_justice: "Welfare",
        rural_dev: "Rural Dev",
      };

        chips.push({
        id: "dept",
        label: `Department: ${deptNames[filterDepartment] || filterDepartment}`,
        onRemove: () => setFilterDepartment("all"),
      });
    }
    if (filterPerformance !== "all") {
      const perfNames: Record<string, string> = {
        top: "High Performing",
        average: "Average Performing",
        needs_attention: "Needs Attention",
        sla_breached: "SLA Breached",
      };

        chips.push({
        id: "perf",
        label: `Performance: ${perfNames[filterPerformance] || filterPerformance}`,
        onRemove: () => setFilterPerformance("all"),
      });
    }
    return chips;
  }, [filterSchemeType, filterSchemeCategory, filterDepartment, filterPerformance]);

  const appliedFilterChips = dashboardFilterChips;

  const filteredBeneficiariesList = React.useMemo(() => {
    return mockBeneficiariesFullList.filter((b) => {
      const matchesCategory =
        beneficiaryCategoryFilter === "ALL" ||
        b.category.toLowerCase().includes(beneficiaryCategoryFilter.toLowerCase());
      const query = beneficiarySearchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        b.name.toLowerCase().includes(query) ||
        b.nameMl.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query) ||
        b.scheme.toLowerCase().includes(query) ||
        b.location.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [beneficiarySearchQuery, beneficiaryCategoryFilter]);

  const renderGuestScreen = () => {
    return (
      <div className="space-y-4 animate-in fade-in duration-200 pb-16 pt-3">
        {/* Banner Section */}
        <div className="w-full rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <img
            src="/images/mobile-guest-banner.png"
            alt="Vikasita Keralam Banner"
            className="w-full h-auto object-contain block rounded-2xl"
          />
        </div>

        {/* Scheme Categories Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                <LayoutGrid className="h-3.5 w-3.5 stroke-[2.2]" />
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {lang === "ml" ? "വിഭാഗങ്ങൾ" : "Categories"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsGuest(false);
                setActiveTab("schemes");
                setMobileSubPage("none");
              }}
              className="inline-flex items-center gap-0.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-x-1 gap-y-2.5 px-0.5 pt-0.5">
            {schemeCategories2Row.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setIsGuest(false);
                  setActiveTab("schemes");
                  setSelectedSchemeCategoryDetail(cat.detail);
                  setSchemeCategoryFilter(cat.id);
                  setMobileSubPage("category_schemes");
                }}
                className="flex flex-col items-center text-center p-0.5 cursor-pointer transition-all duration-150 group rounded-xl hover:scale-105"
              >
                <div className="relative h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center p-0.5 rounded-xl mb-1 bg-slate-50/80 dark:bg-slate-800/40 group-hover:bg-amber-50 dark:group-hover:bg-slate-800 transition-all">
                  <img
                    src={cat.icon}
                    alt={cat.labelEn}
                    className="h-9 w-9 sm:h-10 sm:w-10 object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-110"
                  />
                </div>
                <span className="text-[10px] sm:text-[10.5px] font-extrabold leading-[1.15] block whitespace-pre-line text-center max-w-[76px] text-slate-800 dark:text-slate-100">
                  {lang === "ml" ? cat.labelMl : cat.labelEn}
                </span>
                <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 block text-center">
                  {lang === "ml" ? cat.schemesCountMl : cat.schemesCount}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            <span className="h-2 w-2 rounded-full bg-[#ff5500]" />
            <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        {/* Popular Schemes Section */}
        <div className="pt-2 pb-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                <Sparkles className="h-3.5 w-3.5 stroke-[2.2]" />
              </span>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {lang === "ml" ? "ജനപ്രിയ പദ്ധതികൾ" : "Popular Schemes"}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsGuest(false);
                setActiveTab("schemes");
                setMobileSubPage("none");
              }}
              className="inline-flex items-center gap-0.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex overflow-x-auto gap-2.5 pb-1 pt-0.5 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
            {popularSchemesList.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setIsGuest(false);
                  setActiveTab("schemes");
                  const foundCat = schemeCategories2Row.find(
                    (c) => c.id === item.categoryId || c.detail.id === item.categoryId,
                  );
                  if (foundCat) {
                    setSelectedSchemeCategoryDetail(foundCat.detail);
                    setSchemeCategoryFilter(foundCat.id);
                  } else {
                    setSelectedSchemeCategoryDetail({
                      id: item.id,
                      count: 18,
                      categoryLabelEn: item.nameEn,
                      categoryLabelMl: item.nameMl,
                      titleEn: item.nameEn,
                      titleMl: item.nameMl,
                    });
                    setSchemeCategoryFilter("all");
                  }
                  setMobileSubPage("category_schemes");
                }}
                className="snap-start shrink-0 w-[calc(25%-7.5px)] min-w-[72px] flex flex-col items-center text-center p-0.5 group cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <div className="relative h-13 w-13 sm:h-14 sm:w-14 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-700/80 shadow-2xs group-hover:border-orange-500 dark:group-hover:border-orange-400 group-hover:shadow-xs flex items-center justify-center p-1.5 transition-all overflow-hidden">
                  <img
                    src={item.logo}
                    alt={item.nameEn}
                    className="h-full w-full object-contain rounded-full transition-transform duration-200 group-hover:scale-110"
                  />
                </div>
                <span className="text-[10px] sm:text-[10.5px] font-extrabold leading-tight text-slate-800 dark:text-slate-100 mt-1.5 block text-center max-w-[72px] line-clamp-2">
                  {lang === "ml" ? item.nameMl : item.nameEn}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Events & Announcements Section */}
        <MobileGuestEventsSection
          lang={lang}
          slideIndex={announcementIndex}
          onViewAll={() => {
            setIsGuest(false);
            setActiveTab("overview");
            setMobileSubPage("events_announcements");
          }}
          onSlideAction={() => {
            setIsGuest(false);
            setActiveTab("overview");
            setMobileSubPage("events_announcements");
          }}
        />
      </div>
    );
  };

  if (!isOpen) return null;

  const finalDetailsValidation = getFinalDetailsValidation();
  const activeRequiredFieldKeys = getSchemeRequiredFieldKeys(selectedEligibleScheme);
  const hasAdditionalEligibilityFields = activeRequiredFieldKeys.some((key) =>
    ["minorityStatus", "disabilityStatus", "studentStatus", "bplStatus", "residenceArea"].includes(key)
  );
  const successWorkflowStatus = selectedApplicationRecord?.workflowStatus ?? "pending";
  const successStatusMeta = mobileApplicationStatusMeta[successWorkflowStatus];
  const successApplicantName =
    lang === "ml"
      ? selectedApplicationRecord?.applicantNameMl || selectedApplicationRecord?.applicantNameEn || "—"
      : selectedApplicationRecord?.applicantNameEn || selectedApplicationRecord?.applicantNameMl || "—";
  const successSchemeName =
    lang === "ml"
      ? selectedApplicationRecord?.schemeNameMl || selectedApplicationRecord?.schemeNameEn || "—"
      : selectedApplicationRecord?.schemeNameEn || selectedApplicationRecord?.schemeNameMl || "—";
  const successStatusLabelEn =
    successWorkflowStatus === "document_verification_completed"
      ? "Document Verified"
      : successStatusMeta.labelEn;
  const successStatusLabelMl = successStatusMeta.labelMl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-in fade-in duration-200">
      {/* Modal Shell Container */}
      <div className="relative flex flex-col items-center max-w-full my-auto">
        {/* Top Control Bar for Modal */}
        <div className="flex items-center justify-between w-full max-w-[390px] mb-3 px-2 text-white">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-bold tracking-wide">
              {lang === "ml" ? "മൊബൈൽ ആപ്പ് പ്രിവ്യൂ" : "Mobile App Preview"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Model Switcher */}
            <div className="flex bg-white/10 rounded-lg p-0.5 text-[10px] font-semibold">
              <button
                onClick={() => setDeviceModel("iphone")}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  deviceModel === "iphone" ? "bg-white text-black font-bold" : "text-white/80 hover:text-white"
                }`}
              >
                iOS
              </button>
              <button
                onClick={() => setDeviceModel("android")}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  deviceModel === "android" ? "bg-white text-black font-bold" : "text-white/80 hover:text-white"
                }`}
              >
                Android
              </button>
            </div>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-all"
              aria-label="Close Preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Smartphone Device Shell Frame */}
        <div className={`relative w-[360px] sm:w-[390px] h-[700px] sm:h-[760px] bg-card rounded-[44px] border-[10px] ${
          deviceModel === "iphone" ? "border-slate-800 shadow-2xl" : "border-slate-900 rounded-[36px] shadow-2xl"
        } flex flex-col overflow-hidden text-foreground select-none`}>

          {/* Notch / Dynamic Island */}
          {deviceModel === "iphone" && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-black rounded-b-xl z-50 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-slate-900 mr-2" />
              <div className="h-1.5 w-1.5 rounded-full bg-blue-900" />
            </div>
          )}

          {/* Phone Status Bar */}
          <div className="flex items-center justify-between px-6 pt-2.5 pb-1 text-[11px] font-bold text-foreground/80 bg-background/90 shrink-0 z-40">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-foreground/70">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Mobile App Standard Header with Logo, Nav Menu, Notifications & Logged User Profile */}
          {!isGuestEligibilityOpen && !isMobileAuthOpen && (
            <AdminMobileAppHeader
              isGuest={isGuest}
              onLogout={handleLogout}
              onLoginClick={openMobileAuth}
              userRole={userRole}
              onSwitchRole={setUserRole}
              onOpenUsers={() => {
                setActiveTab("overview");
                setMobileSubPage("users");
              }}
              onNavigateTab={(tab) => {
                setEditingApplicationRef("");
                setActiveTab(tab);
                setMobileSubPage("none");
              }}
              onOpenNotifications={() => {
                setActiveTab("overview");
                setMobileSubPage("notifications");
              }}
            />
          )}

          {/* Scrollable Main Content Area based on Selected Bottom Tab */}
          <div ref={mobileContentRef} className={`flex-1 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden relative bg-muted/20 ${isGuestEligibilityOpen || isMobileAuthOpen ? "p-0" : `${activeTab === "create" || mobileSubPage === "app_detail" ? "px-4" : "px-3"} pt-1.5 ${!isGuest && (activeTab === "create" || mobileSubPage === "app_detail") ? "pb-6" : "pb-16"} space-y-2.5`}`}>
            {isMobileAuthOpen ? (
              <MobileAuthFlow
                onBack={closeMobileAuthToGuest}
                onAuthenticated={completeMobileAuth}
                onContinueAsGuest={closeMobileAuthToGuest}
                onContactSupport={() => setIsSahAiOpen(true)}
              />
            ) : isGuestEligibilityOpen ? (
              <MobileGuestEligibilityQuestionnaire
                lang={lang}
                onClose={() => setIsGuestEligibilityOpen(false)}
                onHelpRequestSent={handleGuestHelpRequestSent}
              />
            ) : isGuest ? (
              renderGuestScreen()
            ) : (
              <>
            {activeTab === "overview" && (
              <>
                {mobileSubPage === "none" ? (
                  userRole === "party_worker" ? (
                    renderPartyMemberDashboard()
                  ) : (
                    <div className="space-y-3 animate-in fade-in duration-200">
                    {/* Header Row: Date Title Left + Action Buttons Right (<, >, Calendar, Filter) - Matching Users Tab */}
                    <div className="flex items-center justify-between gap-2 pt-0.5 pb-1 my-0">
                      {/* Left Side: Bold Date/Period Title */}
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(true)}
                        className="font-display text-[11px] sm:text-[13px] font-extrabold text-[#0a0f1d] dark:text-white tracking-tight leading-none text-left hover:text-[#ff5500] transition-colors cursor-pointer whitespace-nowrap truncate min-w-0"
                        title="Click to Open Date Picker"
                      >
                        {getFormattedPeriodDisplay()}
                      </button>

                      {/* Right Side: Circular Action Buttons (Previous, Next, Calendar, Filter) */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Left Arrow (Previous Period) */}
                        <button
                          type="button"
                          onClick={() => handleStepPeriod(-1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                          title="Previous Period"
                        >
                          <ChevronLeft className="h-3 w-3 stroke-[2.5]" />
                        </button>

                        {/* Right Arrow (Next Period) */}
                        <button
                          type="button"
                          onClick={() => handleStepPeriod(1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                          title="Next Period"
                        >
                          <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                        </button>

                        {/* Calendar Icon Button */}
                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen(true)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer shadow-2xs"
                          title="Open Date Picker"
                        >
                          <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
                        </button>

                        {/* Filter Button */}
                        <button
                          type="button"
                          onClick={() => setShowFilterMenu(!showFilterMenu)}
                          className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer ${
                            showFilterMenu || appliedFilterChips.length > 0
                              ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30"
                              : "border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-orange-500 hover:bg-orange-50"
                          }`}
                          title="Toggle Filters"
                        >
                          <Filter className={`h-3 w-3 stroke-[2.2] ${appliedFilterChips.length > 0 || showFilterMenu ? "text-white" : "text-orange-500"}`} />

                          {appliedFilterChips.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white ring-1.5 ring-white dark:ring-slate-900 animate-pulse">
                              {appliedFilterChips.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Applied Filters & Current Scope UI */}
                    <MobileAppliedFiltersScope
                      currentScopeTitle={filterGeoScope !== "state" ? activeLocationLabel : "All Kerala • State Level"}
                      currentScopeSubLabel={filterGeoScope !== "state" ? "Sector 1, Kazhakuttam" : "All 14 Districts & 140 Constituencies"}
                      onResetScope={filterGeoScope !== "state" ? () => setFilterGeoScope("state") : undefined}
                      appliedFilters={dashboardFilterChips}
                      onResetAllFilters={() => {
                        setFilterSchemeType("all");
                        setFilterSchemeCategory("all");
                        setFilterDepartment("all");
                        setFilterPerformance("all");
                        setFilterGeoScope("state");
                      }}
                    />

                    {/* Core Analytics KPI Grid (2 cards per row) */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* 1. Application Received */}
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("all");
                          setApplicationSearchQuery("");
                        }}
                        className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-blue-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate leading-tight">
                            {lang === "ml" ? "ലഭിച്ച അപേക്ഷകൾ" : "Application Received"}
                          </span>
                          <img src={openApplication3dIcon} alt="Application Received" className="h-6 w-6 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-0.5">{applicationsCount.toLocaleString()}</p>
                      </div>

                      {/* 2. Submitted */}
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("applied");
                        }}
                        className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-sky-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "സമർപ്പിച്ചവ" : "Submitted"}
                          </span>
                          <img src={readyToSubmit3dIcon} alt="Submitted" className="h-6 w-6 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-0.5">{(applicationsCount - 150).toLocaleString()}</p>
                      </div>

                      {/* 3. Beneficiaries */}
                      <div
                        onClick={() => setMobileSubPage("beneficiaries")}
                        className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-emerald-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                          </span>
                          <img src={assisted3dIcon} alt="Beneficiaries" className="h-6 w-6 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-0.5">{currentMetrics.beneficiaries.toLocaleString()}</p>
                      </div>

                      {/* 4. In Review */}
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("review");
                        }}
                        className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-indigo-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "പരിശോധനയിലുള്ളവ" : "In Review"}
                          </span>
                          <img src={documentsPending3dIcon} alt="In Review" className="h-6 w-6 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-0.5">{currentMetrics.assisted.toLocaleString()}</p>
                      </div>

                      {/* 5. Pending */}
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("application_received");
                        }}
                        className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-amber-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "പെൻഡിംഗ്" : "Pending"}
                          </span>
                          <img src={followupsDue3dIcon} alt="Pending" className="h-6 w-6 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 leading-none mt-0.5">{currentMetrics.pending.toLocaleString()}</p>
                      </div>

                      {/* 6. Rejected */}
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("rejected");
                        }}
                        className="rounded-lg border border-border bg-card py-1 px-2 flex flex-col justify-between shadow-2xs hover:border-rose-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "നിരസിച്ചവ" : "Rejected"}
                          </span>
                          <img src={rejected3dIcon} alt="Rejected" className="h-6 w-6 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 leading-none mt-0.5">{currentMetrics.rejected.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Single Merged Events and Announcements Section */}
                    <div className="space-y-1.5 pt-0.5">
                      {/* Unified Section Header */}
                      <div className="flex items-center justify-between px-0.5 pb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                            <Megaphone className="h-3.5 w-3.5 stroke-[2.2]" />
                          </span>
                          <h3 className="font-display text-xs sm:text-[13px] font-black text-[#0a0f1d] dark:text-white tracking-tight truncate">
                            {lang === "ml" ? "പരിപാടികളും അറിയിപ്പുകളും" : "Events & Announcements"}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMobileSubPage("events_announcements")}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#ff5500] hover:text-orange-600 transition-colors cursor-pointer shrink-0"
                        >
                          <span>{lang === "ml" ? "എല്ലാം" : "View All"}</span>
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3b30] text-white text-[9.5px] font-black shadow-2xs">
                            3
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-[#ff5500] stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Single Unified Carousel */}
                      {(() => {
                        const mergedSlides = [
                          {
                            type: "banner_image",
                            bannerImg: "/images/pm_schemes_explore_now.png",
                            title: "Explore PM Schemes",
                            isUnread: true,
                          },
                          {
                            type: "event",
                            dateMonth: "OCT",
                            dateDay: "15",
                            dateYear: "2026",
                            ribbon: "BOOTH CONVENTION",
                            ribbonMl: "ബൂത്ത് സമ്മേളനം",
                            title: "VIKASITA KERALAM SAMMELAN 2026",
                            subtitle: "Statewide Mega Booth Worker Convention in TVM",
                            subtitleMl: "സംസ്ഥാനതല മെഗാ ബൂത്ത് സമ്മേളനം",
                            ctaText: "REGISTER NOW",
                            ctaTextMl: "രജിസ്റ്റർ ചെയ്യുക",
                            rightGradient: "from-[#800f13] via-[#a3161a] to-[#4f080b]",
                            accentBorder: "border-[#800f13]",
                            dateBadgeBg: "bg-white text-[#800f13]",
                            yearTagBg: "bg-red-50 text-[#800f13] border-red-200/80",
                            isUnread: true,
                          },
                          {
                            type: "announcement",
                            ribbon: "MODI'S GUARANTEE",
                            ribbonMl: "മോദിയുടെ ഗ്യാരണ്ടി",
                            ribbonBg: "bg-red-500 text-white font-black",
                            title: "SABKA SAATH · SABKA VIKAS",
                            subtitle: "Sabka Vishwas · Sabka Prayaas (2047 Vision)",
                            subtitleMl: "സബ്കാ സാഥ്, സബ്കാ വികാസ്, സബ്കാ വിശ്വാസ്",
                            cardStyle: "bg-gradient-to-r from-[#800f13] via-[#a3161a] to-[#590a0d] text-white shadow-md border border-red-900/50",
                            titleColor: "text-white font-extrabold",
                            subTitleColor: "text-red-100/95 font-medium",
                            rightGraphicBg: "bg-red-950/70 border-red-400/40",
                            isUnread: true,
                          },
                          {
                            type: "event",
                            dateMonth: "NOV",
                            dateDay: "02",
                            dateYear: "2026",
                            ribbon: "YOUTH RALLY",
                            ribbonMl: "യുവമോർച്ച റാലി",
                            title: "YUVA VIKAS YATRA & CONCLAVE",
                            subtitle: "50,000+ Youth Leaders Gathering in TVM",
                            subtitleMl: "തിരുവനന്തപുരത്ത് 50,000+ യുവ പ്രതിനിധികൾ",
                            ctaText: "JOIN YATRA",
                            ctaTextMl: "പങ്കെടുക്കുക",
                            rightGradient: "from-[#ea580c] via-[#c2410c] to-[#9a3412]",
                            accentBorder: "border-[#ea580c]",
                            dateBadgeBg: "bg-white text-[#c2410c]",
                            yearTagBg: "bg-orange-50 text-[#c2410c] border-orange-200/80",
                            isUnread: true,
                          },
                          {
                            type: "announcement",
                            ribbon: "PM KISAN SAMMAN",
                            ribbonMl: "പി.എം കിസാൻ",
                            ribbonBg: "bg-amber-400 text-amber-950 font-black",
                            title: "DIRECT BENEFIT TRANSFER ₹6,000",
                            subtitle: "Empowering 35 Lakh Farmers Across Kerala",
                            subtitleMl: "കേരളത്തിലെ 35 ലക്ഷം കർഷകർക്ക് നേട്ടങ്ങൾ",
                            cardStyle: "bg-gradient-to-r from-[#15803d] via-emerald-700 to-[#065f46] text-white shadow-md border border-emerald-600/50",
                            titleColor: "text-white font-extrabold",
                            subTitleColor: "text-emerald-100/95 font-medium",
                            rightGraphicBg: "bg-emerald-950/70 border-amber-300/40",
                            isUnread: false,
                          },
                          {
                            type: "event",
                            dateMonth: "NOV",
                            dateDay: "20",
                            dateYear: "2026",
                            ribbon: "BENEFICIARY MEET",
                            ribbonMl: "ഗുണഭോക്തൃ സംഗമം",
                            title: "CENTRAL SCHEMES EXPO",
                            subtitle: "Interactive Session with Union Ministers at Kochi",
                            subtitleMl: "കേന്ദ്ര മന്ത്രിമാരുമായുള്ള ഗുണഭോക്തൃ സംവാദം",
                            ctaText: "ATTEND EXPO",
                            ctaTextMl: "സന്ദർശിക്കുക",
                            rightGradient: "from-[#0d9488] via-[#0f766e] to-[#115e59]",
                            accentBorder: "border-[#0d9488]",
                            dateBadgeBg: "bg-white text-[#0f766e]",
                            yearTagBg: "bg-teal-50 text-[#0f766e] border-teal-200/80",
                            isUnread: false,
                          },
                          {
                            type: "announcement",
                            ribbon: "AYUSHMAN BHARAT",
                            ribbonMl: "ആയുഷ്മാൻ ഭാരത്",
                            ribbonBg: "bg-[#ff5500] text-white font-black",
                            title: "FREE HEALTH COVERAGE UP TO ₹5 LAKH",
                            subtitle: "Cashless Medical Treatment for All Families",
                            subtitleMl: "സൗജന്യ സമഗ്ര കുടുംബ ആരോഗ്യ സുരക്ഷാ പദ്ധതി",
                            cardStyle: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/90 dark:border-slate-800",
                            titleColor: "text-slate-900 dark:text-white font-extrabold",
                            subTitleColor: "text-slate-700 dark:text-slate-200 font-medium",
                            rightGraphicBg: "bg-orange-50 dark:bg-slate-800 border-orange-200 dark:border-slate-700",
                            isUnread: false,
                          },
                          {
                            type: "event",
                            dateMonth: "DEC",
                            dateDay: "10",
                            dateYear: "2026",
                            ribbon: "MAHILA SAMMELAN",
                            ribbonMl: "മഹിളാ സമ്മേളനം",
                            title: "NARI SHAKTI VIKAS CONCLAVE",
                            subtitle: "Empowering Women Entrepreneurs in Kozhikode",
                            subtitleMl: "വനിതാ സംരംഭകത്വ സംസ്ഥാന സമ്മേളനം",
                            ctaText: "GET PASS",
                            ctaTextMl: "പാസ് നേടുക",
                            rightGradient: "from-[#15803d] via-[#166534] to-[#14532d]",
                            accentBorder: "border-[#15803d]",
                            dateBadgeBg: "bg-white text-[#166534]",
                            yearTagBg: "bg-emerald-50 text-[#166534] border-emerald-200/80",
                            isUnread: false,
                          },
                        ];

                        const slide = mergedSlides[announcementIndex % mergedSlides.length];

                        if (slide.type === "banner_image") {
                          return (
                            <div
                              onClick={() => setMobileSubPage("events_announcements")}
                              className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs h-[80px] w-full cursor-pointer group transition-all duration-500"
                            >
                              <img
                                src={slide.bannerImg}
                                alt="Explore PM Schemes - Viksit Bharat"
                                className="h-full w-full object-fill group-hover:scale-102 transition-transform duration-300"
                              />
                              {slide.isUnread && (
                                <div className="absolute top-2 right-2 z-10">
                                  <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block shadow-xs" />
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (slide.type === "event") {
                          return (
                            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-[80px] flex items-center justify-between transition-all duration-500">
                              {/* Left Content Area (White background with black pill CTA) */}
                              <div className="flex-1 min-w-0 h-full p-2.5 pl-3 pr-3 flex flex-col justify-between z-10">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <h4 className="font-display text-[11.5px] sm:text-[12px] font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate">
                                      {slide.title}
                                    </h4>
                                    {slide.isUnread && (
                                      <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block" />
                                    )}
                                  </div>
                                  <p className="text-[9.5px] font-medium text-slate-600 dark:text-slate-300 leading-tight line-clamp-1">
                                    {lang === "ml" ? slide.subtitleMl : slide.subtitle}
                                  </p>
                                </div>
                                <div className="pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setMobileSubPage("recent_activity")}
                                    className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8px] font-black tracking-wider uppercase shadow-xs transition-transform active:scale-95 cursor-pointer"
                                  >
                                    {lang === "ml" ? slide.ctaTextMl : slide.ctaText}
                                  </button>
                                </div>
                              </div>

                              {/* Right Angular Geometric Section */}
                              <div className="relative h-full w-[38%] shrink-0 flex items-center justify-center overflow-hidden pr-0.5">
                                <div className={`absolute inset-0 bg-gradient-to-br ${slide.rightGradient} [clip-path:polygon(20%_0%,100%_0%,100%_100%,0%_100%,15%_50%)]`} />
                                <div className={`absolute inset-0 border-l-2 ${slide.accentBorder} opacity-80 [clip-path:polygon(20%_0%,25%_0%,20%_50%,25%_100%,20%_100%,15%_50%)]`} />

                                <div className={`relative z-10 rounded-lg px-2 py-0.5 flex flex-col items-center justify-center text-center ${slide.dateBadgeBg} min-w-[48px] shadow-md border border-white/60`}>
                                  <span className="block text-[8px] font-black uppercase tracking-wider leading-none">{slide.dateMonth}</span>
                                  <span className="block text-[15px] font-black leading-tight my-0.5 tracking-tight">{slide.dateDay}</span>
                                  <span className={`block text-[7px] font-black tracking-widest leading-none px-1 py-0.5 rounded-xs border ${slide.yearTagBg}`}>
                                    {slide.dateYear}
                                  </span>
                                </div>

                                <div className="absolute top-1 right-1 z-20 h-5 w-5 rounded-full bg-amber-400 border border-white/80 p-0.5 flex items-center justify-center shadow-xs">
                                  <img src={officialLotus} alt="Lotus" className="h-3.5 w-3.5 object-contain" />
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className={`relative overflow-hidden rounded-xl ${slide.cardStyle} p-2 px-2.5 h-[80px] flex flex-col justify-between transition-all duration-500`}>
                            {/* Top Right Ribbon */}
                            <div className="absolute top-0 right-0 z-10">
                              <div className={`rounded-bl-md px-2 py-0.5 text-[7px] font-black uppercase tracking-wider shadow-xs ${slide.ribbonBg}`}>
                                {lang === "ml" ? slide.ribbonMl : slide.ribbon}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1 flex-1 min-h-0">
                              <div className={`shrink-0 h-9 w-9 rounded-full border ${slide.rightGraphicBg} p-0.5 flex items-center justify-center shadow-xs overflow-hidden`}>
                                <img
                                  src={officialLotus}
                                  alt="Lotus Emblem"
                                  className="h-5.5 w-5.5 object-contain drop-shadow-xs"
                                />
                              </div>

                              <div className="min-w-0 flex-1 flex flex-col justify-center h-full pr-1 text-left space-y-0.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <h4 className={`font-display text-[12px] sm:text-[12.5px] font-extrabold leading-tight tracking-tight truncate ${slide.titleColor}`}>
                                    {slide.title}
                                  </h4>
                                  {slide.isUnread && (
                                    <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block" />
                                  )}
                                </div>
                                <p className={`text-[9.5px] leading-tight line-clamp-2 ${slide.subTitleColor}`}>
                                  {lang === "ml" ? slide.subtitleMl : slide.subtitle}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {renderLatestSavedApplicationsSection()}

                    {/* SECTION 1: Needs attention */}
                    <div className="space-y-1.5 pt-1">
                      {/* Section Header */}
                      <div className="flex items-center justify-between px-0.5 pb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                            <AlertCircle className="h-3.5 w-3.5 stroke-[2.2]" />
                          </span>
                          <h3 className="font-display text-xs sm:text-[13px] font-black text-[#0a0f1d] dark:text-white tracking-tight truncate">
                          {lang === "ml" ? "ശ്രദ്ധ ആവശ്യമുണ്ട്" : "Needs attention"}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("applications")}
                          className="flex items-center gap-0.5 text-[11px] font-bold text-[#f95700] hover:underline cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5"><span>{lang === "ml" ? "എല്ലാം" : "View all"}</span><span className="rounded-full bg-orange-500/10 dark:bg-orange-950/40 text-[#f95700] px-1.5 py-0.5 text-[9.5px] font-black leading-none border border-orange-200/80 dark:border-orange-900/50">{2 + followUpCollectionRecords.length}</span></span>
                          <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Needs Attention Items */}
                      <div className="space-y-2">
                        {followUpCollectionRecords.map((record) => (
                          <div
                            key={record.reference}
                            onClick={() => openCollectionRecordView(record, "needs_attention")}
                            className="rounded-2xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-xs shrink-0">
                                {getApplicantInitials(record.applicantName)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-black text-[12px] sm:text-[12.5px] text-slate-900 dark:text-white leading-tight truncate">
                                  {record.applicantName}
                                </h4>
                                <p className="font-medium text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                                  {lang === "ml" ? record.scheme.titleMl : record.scheme.titleEn}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <div className="flex items-center gap-1.5 rounded-full bg-[#fff4ed] dark:bg-orange-950/50 border border-[#ffebd9] dark:border-orange-900/50 px-2.5 py-1 text-[10px] font-bold text-[#f95700] dark:text-orange-400">
                                <Calendar className="h-3.5 w-3.5 text-[#f95700]" />
                                <span className="whitespace-nowrap">
                                  {record.followUpDate
                                    ? formatCollectionDate(record.followUpDate)
                                    : lang === "ml"
                                      ? `${record.missingItems.length} ബാക്കി`
                                      : `${record.missingItems.length} missing`}
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        ))}

                        {/* Item 1: Meera Nair */}
                        <div
                          onClick={() => setActiveTab("applications")}
                          className="rounded-2xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 font-extrabold text-xs shrink-0">
                              MN
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-[12px] sm:text-[12.5px] text-slate-900 dark:text-white leading-tight truncate">
                                {lang === "ml" ? "മീര നായർ" : "Meera Nair"}
                              </h4>
                              <p className="font-medium text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                                {lang === "ml" ? "പി.എം വിശ്വകർമ്മ" : "PM Vishwakarma"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <div className="flex items-center gap-1.5 rounded-full bg-[#fff4ed] dark:bg-orange-950/50 border border-[#ffebd9] dark:border-orange-900/50 px-2.5 py-1 text-[10px] font-bold text-[#f95700] dark:text-orange-400">
                              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#f95700] text-white text-[8.5px] font-black leading-none">!</span>
                              <span>{lang === "ml" ? "1 രേഖ വിട്ടുപോയി" : "1 document missing"}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>

                        {/* Item 2: Ravi Kumar */}
                        <div
                          onClick={() => setActiveTab("applications")}
                          className="rounded-2xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-xs shrink-0">
                              RK
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-[12px] sm:text-[12.5px] text-slate-900 dark:text-white leading-tight truncate">
                                {lang === "ml" ? "രവി കുമാർ" : "Ravi Kumar"}
                              </h4>
                              <p className="font-medium text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                                {lang === "ml" ? "പി.എം സ്വനിധി" : "PM SVANidhi"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <div className="flex items-center gap-1.5 rounded-full bg-[#fff4ed] dark:bg-orange-950/50 border border-[#ffebd9] dark:border-orange-900/50 px-2.5 py-1 text-[10px] font-bold text-[#f95700] dark:text-orange-400">
                              <Calendar className="h-3.5 w-3.5 text-[#f95700]" />
                              <span>{lang === "ml" ? "ഇന്ന് തുടർനടപടി" : "Follow-up due today"}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                  )
                ) : (
                  /* Dedicated Full Screen Views inside Mobile App */
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {/* Dedicated Subpage 1: Leaderboard Page */}
                    {mobileSubPage === "leaderboard" && (() => {
                      const hierarchyTabs = [
                        { id: "districts", label: lang === "ml" ? "ജില്ലകൾ" : "Districts", icon: MapPin },
                        { id: "mandalam", label: lang === "ml" ? "മണ്ഡലം" : "Mandalam", icon: Network },
                        { id: "area", label: lang === "ml" ? "മേഖല" : "Area", icon: Map },
                        { id: "booths", label: lang === "ml" ? "ബൂത്തുകൾ" : "Booths", icon: Store },
                        { id: "workers", label: lang === "ml" ? "ഉപയോക്താക്കൾ" : "Users", icon: Users },
                      ];

                      const datasets: Record<string, { title: string; subtitle: string; items: Array<{ rank: number; tag: string; name: string; val: string; sub: string; rankColor: string; tagBg: string; district?: string; avatarUrl?: string }> }> = {
                        districts: {
                          title: lang === "ml" ? "ടോപ്പ് പെർഫോമിംഗ് ജില്ലകൾ" : "Top Performing Districts",
                          subtitle: lang === "ml" ? "ജില്ലാ റാങ്കിംഗുകൾ" : "District Rankings",
                          items: [
                            { rank: 1, tag: "TVM-C", name: "Thiruvananthapuram City", val: "8,420", sub: "420 assisted", rankColor: "text-[#eab308]", tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                            { rank: 2, tag: "TVM-S", name: "Thiruvananthapuram South", val: "7,980", sub: "398 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                            { rank: 3, tag: "TVM-N", name: "Thiruvananthapuram North", val: "7,560", sub: "376 assisted", rankColor: "text-[#f97316]", tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                            { rank: 4, tag: "KLW", name: "Kollam West", val: "7,120", sub: "351 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                            { rank: 5, tag: "KLE", name: "Kollam East", val: "6,940", sub: "338 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                            { rank: 6, tag: "PTA", name: "Pathanamthitta", val: "6,720", sub: "326 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                            { rank: 7, tag: "ALS", name: "Alappuzha South", val: "6,340", sub: "309 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                            { rank: 8, tag: "ALN", name: "Alappuzha North", val: "6,180", sub: "298 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                          ],
                        },
                        mandalam: {
                          title: lang === "ml" ? "ടോപ്പ് പെർഫോമിംഗ് മണ്ഡലങ്ങൾ" : "Top Performing Mandalams",
                          subtitle: lang === "ml" ? "മണ്ഡലം റാങ്കിംഗുകൾ" : "Mandalam Rankings",
                          items: (() => {
                            let availableConstituencies = constituencies;
                            if (selectedDistrict !== "all") {
                              availableConstituencies = constituencies.filter((c) => c.districtId === selectedDistrict);
                            }

                            const baseConfigs = [
                              { val: "3,850", sub: 192, tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                              { val: "3,620", sub: 181, tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                              { val: "3,410", sub: 170, tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                              { val: "3,290", sub: 164, tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                              { val: "3,110", sub: 155, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                              { val: "2,980", sub: 149, tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                              { val: "2,840", sub: 142, tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                              { val: "2,710", sub: 135, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                            ];

                            return availableConstituencies.slice(0, 8).map((c, idx) => {
                              const b = baseConfigs[idx % baseConfigs.length];
                              const tag = c.en.slice(0, 3).toUpperCase();
                              return {
                                rank: idx + 1,
                                tag,
                                name: c[lang],
                                val: b.val,
                                sub: lang === "ml" ? `${b.sub} സഹായം നൽകി` : `${b.sub} assisted`,
                                rankColor: idx === 0 ? "text-[#eab308]" : idx === 1 ? "text-[#6366f1]" : idx === 2 ? "text-[#f97316]" : "text-[#64748b]",
                                tagBg: b.tagBg,
                              };

                              });
                          })(),
                        },
                        area: {
                          title: lang === "ml" ? "ടോപ്പ് പെർഫോമിംഗ് മേഖലകൾ" : "Top Performing Areas",
                          subtitle: lang === "ml" ? "മേഖലാ റാങ്കിംഗുകൾ" : "Area Rankings",
                          items: (() => {
                            if (selectedMandalam === "all") {
                              if (selectedDistrict === "all") {
                                return [
                                  { rank: 1, tag: "PAP", name: lang === "ml" ? "പപ്പനംകോട് നോർത്ത്" : "Pappanamcode North", val: "1,940", sub: lang === "ml" ? "97 സഹായം നൽകി" : "97 assisted", rankColor: "text-[#eab308]", tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                                  { rank: 2, tag: "KAR", name: lang === "ml" ? "കരമന വെസ്റ്റ്" : "Karamana West", val: "1,820", sub: lang === "ml" ? "91 സഹായം നൽകി" : "91 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                                  { rank: 3, tag: "THI", name: lang === "ml" ? "തിരുവല്ലം ഈസ്റ്റ്" : "Thiruvallam East", val: "1,750", sub: lang === "ml" ? "87 സഹായം നൽകി" : "87 assisted", rankColor: "text-[#f97316]", tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                                  { rank: 4, tag: "PER", name: lang === "ml" ? "പേരൂർക്കട സെൻട്രൽ" : "Peroorkada Central", val: "1,680", sub: lang === "ml" ? "84 സഹായം നൽകി" : "84 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                                  { rank: 5, tag: "KOW", name: lang === "ml" ? "കവടിയാർ സൗത്ത്" : "Kowdiar South", val: "1,590", sub: lang === "ml" ? "79 സഹായം നൽകി" : "79 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                                  { rank: 6, tag: "ULM", name: lang === "ml" ? "ഉള്ളൂർ വെസ്റ്റ്" : "Ulloor West", val: "1,510", sub: lang === "ml" ? "75 സഹായം നൽകി" : "75 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                                  { rank: 7, tag: "SRE", name: lang === "ml" ? "ശ്രീകാര്യം ഈസ്റ്റ്" : "Sreekariyam East", val: "1,440", sub: lang === "ml" ? "72 സഹായം നൽകി" : "72 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                                  { rank: 8, tag: "MAN", name: lang === "ml" ? "മണക്കാട് സൗത്ത്" : "Manacaud South", val: "1,380", sub: lang === "ml" ? "69 സഹായം നൽകി" : "69 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                                ];
                              }

                              const distMandalams = constituencies.filter((c) => c.districtId === selectedDistrict);
                              const firstMandalam = distMandalams[0]?.id || "all";
                              const areas = getAreasForMandalam(firstMandalam, lang);
                              const baseAreaConfigs = [
                                { val: "1,940", sub: 97, tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                                { val: "1,820", sub: 91, tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                                { val: "1,750", sub: 87, tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                                { val: "1,680", sub: 84, tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                                { val: "1,590", sub: 79, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                                { val: "1,510", sub: 75, tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                                { val: "1,440", sub: 72, tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                                { val: "1,380", sub: 69, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                              ];

                              return baseAreaConfigs.map((b, idx) => {
                                const areaObj = areas[idx % areas.length];
                                const areaName = areaObj ? areaObj[lang] : `Area ${idx + 1}`;
                                const tag = areaObj ? areaObj.en.slice(0, 3).toUpperCase() : `A-${idx + 1}`;
                                return {
                                  rank: idx + 1,
                                  tag,
                                  name: areaName,
                                  val: b.val,
                                  sub: lang === "ml" ? `${b.sub} സഹായം നൽകി` : `${b.sub} assisted`,
                                  rankColor: idx === 0 ? "text-[#eab308]" : idx === 1 ? "text-[#6366f1]" : idx === 2 ? "text-[#f97316]" : "text-[#64748b]",
                                  tagBg: b.tagBg,
                                };

                                });
                            }

                            const areas = getAreasForMandalam(selectedMandalam, lang);
                            const baseAreaConfigs = [
                              { val: "1,940", sub: 97, tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                              { val: "1,820", sub: 91, tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                              { val: "1,750", sub: 87, tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                              { val: "1,680", sub: 84, tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                              { val: "1,590", sub: 79, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                              { val: "1,510", sub: 75, tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                              { val: "1,440", sub: 72, tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                              { val: "1,380", sub: 69, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                            ];

                            return baseAreaConfigs.map((b, idx) => {
                              const areaObj = areas[idx % areas.length];
                              const areaName = areaObj ? areaObj[lang] : `Area ${idx + 1}`;
                              const tag = areaObj ? areaObj.en.slice(0, 3).toUpperCase() : `A-${idx + 1}`;
                              return {
                                rank: idx + 1,
                                tag,
                                name: areaName,
                                val: b.val,
                                sub: lang === "ml" ? `${b.sub} സഹായം നൽകി` : `${b.sub} assisted`,
                                rankColor: idx === 0 ? "text-[#eab308]" : idx === 1 ? "text-[#6366f1]" : idx === 2 ? "text-[#f97316]" : "text-[#64748b]",
                                tagBg: b.tagBg,
                              };

                              });
                          })(),
                        },
                        booths: {
                          title: lang === "ml" ? "\u0D1F\u0D4B\u0D2A\u0D4D\u0D2A\u0D4D \u0D2A\u0D46\u0D30\u0D4D\u0D2B\u0D4B\u0D2E\u0D3F\u0D02\u0D17\u0D4D \u0D2C\u0D42\u0D24\u0D4D\u0D24\u0D41\u0D15\u0D4D\u0D25\u0D33\u0D4D" : "Top Performing Booths",
                          subtitle: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D \u0D30\u0D3E\u0D19\u0D4D\u0D15\u0D3F\u0D02\u0D17\u0D41\u0D15\u0D4D\u0D25\u0D33\u0D4D" : "Booth Rankings",
                          items: (() => {
                            if (selectedMandalam === "all") {
                              return [
                                { rank: 1, tag: "B-142", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 142 \u00B7 \u0D23\u0D47\u0D2E\u0D02" : "Booth 142 · Nemom", val: "940", sub: lang === "ml" ? "47 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "47 assisted", rankColor: "text-[#eab308]", tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                                { rank: 2, tag: "B-088", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 88 \u00B7 \u0D15\u0D30\u0D2E\u0D28" : "Booth 88 · Karamana", val: "890", sub: lang === "ml" ? "44 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "44 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                                { rank: 3, tag: "B-105", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 105 \u00B7 \u0D2A\u0D2A\u0D4D\u0D2A\u0D28\u0D02\u0D15\u0D4B\u0D11\u0D21\u0D4D" : "Booth 105 · Pappanamcode", val: "840", sub: lang === "ml" ? "42 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "42 assisted", rankColor: "text-[#f97316]", tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                                { rank: 4, tag: "B-019", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 19 \u00B7 \u0D15\u0D35\u0D21\u0D3F\u0D2F\u0D3E\u0D7C" : "Booth 19 · Kowdiar", val: "790", sub: lang === "ml" ? "39 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "39 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                                { rank: 5, tag: "B-067", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 67 \u00B7 \u0D2A\u0D47\u0D30\u0D42\u0D7C\u0D15\u0D4D\u0D15\u0D11\u0D21" : "Booth 67 · Peroorkada", val: "740", sub: lang === "ml" ? "37 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "37 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                                { rank: 6, tag: "B-121", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 121 \u00B7 \u0D24\u0D3F\u0D30\u0D41\u0D35\u0D32\u0D4D\u0D32\u0D02" : "Booth 121 · Thiruvallam", val: "710", sub: lang === "ml" ? "35 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "35 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                                { rank: 7, tag: "B-034", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 34 \u00B7 \u0D30\u0D4D\u0D30\u0D40\u0D15\u0D3E\u0D30\u0D4D\u0D2F\u0D02" : "Booth 34 · Sreekaryam", val: "680", sub: lang === "ml" ? "34 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "34 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                                { rank: 8, tag: "B-092", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 92 \u00B7 \u0D15\u0D34\u0D15\u0D4D\u0D15\u0D42\u0D1F\u0D4D\u0D1F\u0D02" : "Booth 92 · Kazhakkoottam", val: "650", sub: lang === "ml" ? "32 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "32 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                              ];
                            }

                            const currentAreas = getAreasForMandalam(selectedMandalam, lang);
                            const selectedMandalamObj = constituencies.find(
                              (c) => c.id === selectedMandalam || c.en.toLowerCase() === selectedMandalam.toLowerCase()
                            );
                            const mandalamName = selectedMandalamObj ? selectedMandalamObj[lang] : (lang === "ml" ? "\u0D2E\u0D23\u0D4D\u0D21\u0D32\u0D02" : "Mandalam");

                            let targetAreaName = "";
                            if (selectedArea !== "all") {
                              const foundArea = currentAreas.find((a) => a.id === selectedArea);
                              if (foundArea) {
                                targetAreaName = foundArea[lang];
                              }
                            }

                            const baseConfigs = [
                              { num: 142, val: "940", sub: 47, tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                              { num: 88, val: "890", sub: 44, tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                              { num: 105, val: "840", sub: 42, tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                              { num: 19, val: "790", sub: 39, tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                              { num: 67, val: "740", sub: 37, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                              { num: 121, val: "710", sub: 35, tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                              { num: 34, val: "680", sub: 34, tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                              { num: 92, val: "650", sub: 32, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                            ];

                            return baseConfigs.map((b, idx) => {
                              const locationLabel = targetAreaName || (currentAreas[idx % currentAreas.length] ? currentAreas[idx % currentAreas.length][lang] : mandalamName);
                              const boothLabel = lang === "ml" ? `\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D ${b.num}` : `Booth ${b.num}`;
                              return {
                                rank: idx + 1,
                                tag: `B-${String(b.num).padStart(3, "0")}`,
                                name: `${boothLabel} · ${locationLabel}`,
                                val: b.val,
                                sub: lang === "ml" ? `${b.sub} \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D28\u0D7C\u0D15\u0D3F` : `${b.sub} assisted`,
                                rankColor: idx === 0 ? "text-[#eab308]" : idx === 1 ? "text-[#6366f1]" : idx === 2 ? "text-[#f97316]" : "text-[#64748b]",
                                tagBg: b.tagBg,
                              };

                              });
                          })(),
                        },
                        workers: {
                          title: lang === "ml" ? "ടോപ്പ് പെർഫോമിംഗ് ഉപയോക്താക്കൾ" : "Top Performing Users",
                          subtitle: lang === "ml" ? "ഉപയോക്തൃ റാങ്കിംഗുകൾ" : "User Rankings",
                          items: [
                            { rank: 1, tag: "PR", name: "Anitha Nair", district: "Thiruvananthapuram", val: "480", sub: "24 assisted", rankColor: "text-[#eab308]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800", avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
                            { rank: 2, tag: "PW", name: "Rajesh V. Kurup", district: "Kollam", val: "450", sub: "22 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800", avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
                            { rank: 3, tag: "PR", name: "Maya Devi S.", district: "Thiruvananthapuram", val: "420", sub: "21 assisted", rankColor: "text-[#f97316]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
                            { rank: 4, tag: "PW", name: "Manoj Kumar P.", district: "Alappuzha", val: "390", sub: "19 assisted", rankColor: "text-[#64748b]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
                            { rank: 5, tag: "PR", name: "Suresh Chandran", district: "Kottayam", val: "370", sub: "18 assisted", rankColor: "text-[#64748b]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
                            { rank: 6, tag: "PW", name: "Lekshmi Priya", district: "Ernakulam", val: "340", sub: "17 assisted", rankColor: "text-[#64748b]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" },
                            { rank: 7, tag: "PR", name: "Arun Mohan", district: "Thrissur", val: "320", sub: "16 assisted", rankColor: "text-[#64748b]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
                            { rank: 8, tag: "PW", name: "Deepa R. Nair", district: "Kozhikode", val: "310", sub: "15 assisted", rankColor: "text-[#64748b]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800", avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80" },
                          ],
                        },
                      };

                        const currentDataset = datasets[leaderboardCategory] || datasets.districts;
                      const podiumTop3 = currentDataset.items.slice(0, 3);
                      const rank1 = podiumTop3[0];
                      const rank2 = podiumTop3[1];
                      const rank3 = podiumTop3[2];

                      return (
                        <div className="space-y-2.5 pt-0.5">
                          {/* Top Header Bar with Scope and Period */}
                          <div className="flex items-center justify-between pb-0.5">
                            <div className="flex items-center gap-1 text-base font-black text-[#1e1b4b] dark:text-white">
                              <span>{lang === "ml" ? "ലീഡർബോർഡ്" : "Leaderboard"}</span>
                            </div>
                            
                            {/* Period Selection Bar Pill (Same as Dashboard UI & Actions) */}
                            <div className="flex items-center justify-between rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 text-[10.5px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs hover:border-slate-300 transition-all min-h-[28px] max-w-[215px]">
                              <div className="flex items-center gap-0.5 min-w-0 flex-1 justify-center">
                                {/* Left Arrow (Previous Period) */}
                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(-1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Previous Period"
                                >
                                  <ChevronLeft className="h-3.5 w-3.5 stroke-[2.4]" />
                                </button>

                                {/* Date / Month Display */}
                                <button
                                  type="button"
                                  onClick={() => setIsDatePickerOpen(true)}
                                  className="text-[10px] font-extrabold text-[#0a0f1d] dark:text-slate-100 hover:text-[#ff5500] transition-colors cursor-pointer px-0.5 tracking-tight whitespace-nowrap"
                                  title="Click to Open Date Picker"
                                >
                                  {getFormattedPeriodDisplay()}
                                </button>

                                {/* Right Arrow (Next Period) */}
                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Next Period"
                                >
                                  <ChevronRight className="h-3.5 w-3.5 stroke-[2.4]" />
                                </button>
                              </div>

                              {/* Calendar Icon Button on Right End */}
                              <button
                                type="button"
                                onClick={() => setIsDatePickerOpen(true)}
                                className="p-0.5 rounded-full text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-800 pl-1.5 ml-0.5 shrink-0"
                                title="Open Period & Date Picker"
                              >
                                <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
                              </button>
                            </div>
                          </div>

                          {/* Hierarchy Selector Bar with Left & Right scroll arrows */}
                          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                if (tabScrollRef.current) {
                                  tabScrollRef.current.scrollBy({ left: -100, behavior: "smooth" });
                                }
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 active:scale-95 shrink-0 cursor-pointer shadow-2xs"
                              title="Scroll left"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>

                            <div
                              ref={tabScrollRef}
                              className="flex items-center gap-1 overflow-hidden scroll-smooth w-full"
                            >
                              {hierarchyTabs.map((cat) => {
                                const IconComp = cat.icon;
                                const isActive = leaderboardCategory === cat.id;
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setLeaderboardCategory(cat.id as any)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                                      isActive
                                        ? "bg-[#fff2e8] dark:bg-orange-950/50 text-[#ff5500] border border-[#ffbb96]/60 shadow-2xs font-extrabold"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                                    }`}
                                  >
                                    <IconComp className={`h-3.5 w-3.5 ${isActive ? "text-[#ff5500]" : "text-slate-500"}`} />
                                    <span>{cat.label}</span>
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (tabScrollRef.current) {
                                  tabScrollRef.current.scrollBy({ left: 100, behavior: "smooth" });
                                }
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 active:scale-95 shrink-0 cursor-pointer shadow-2xs"
                              title="Scroll right"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Merged Filters & Podium Card Outer Container */}
                          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs space-y-2">
                            {/* Dynamic Cascading Filter Dropdowns based on Level (Excluding districts and workers) */}
                            {leaderboardCategory !== "districts" && leaderboardCategory !== "workers" && (
                              <div className="flex items-center gap-1.5 w-full">
                              {leaderboardCategory === "mandalam" && (
                                <div className="relative flex-1 min-w-0 flex items-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-2.5 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                  <Filter className="h-3 w-3 text-orange-500 mr-1 shrink-0" />
                                  <span className="shrink-0 mr-1">District:</span>
                                  <select
                                    value={selectedDistrict}
                                    onChange={(e) => {
                                      setSelectedDistrict(e.target.value);
                                      setSelectedMandalam("all");
                                    }}
                                    className="appearance-none bg-transparent font-extrabold text-foreground focus:outline-none cursor-pointer pr-3 min-w-0 flex-1 truncate"
                                  >
                                    <option value="all">{lang === "ml" ? "എല്ലാ ജില്ലകളും" : "All Districts"}</option>
                                    {districts.map((d) => (
                                      <option key={d.id} value={d.id}>
                                        {d[lang]}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-1.5 shrink-0" />
                                </div>
                              )}

                              {leaderboardCategory === "area" && (
                                <>
                                  <div className="relative flex-1 min-w-0 flex items-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-2 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                    <span className="shrink-0 mr-1">District:</span>
                                    <select
                                      value={selectedDistrict}
                                      onChange={(e) => {
                                        setSelectedDistrict(e.target.value);
                                        setSelectedMandalam("all");
                                      }}
                                      className="appearance-none bg-transparent font-extrabold text-foreground focus:outline-none cursor-pointer pr-3 min-w-0 flex-1 truncate"
                                    >
                                      <option value="all">{lang === "ml" ? "എല്ലാ ജില്ലകളും" : "All"}</option>
                                      {districts.map((d) => (
                                        <option key={d.id} value={d.id}>
                                          {d.id.toUpperCase()} ({d[lang]})
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-1 shrink-0" />
                                  </div>

                                  <div className="relative flex-1 min-w-0 flex items-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-2 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                    <span className="shrink-0 mr-1">Mandalam:</span>
                                    <select
                                      value={selectedMandalam}
                                      onChange={(e) => setSelectedMandalam(e.target.value)}
                                      className="appearance-none bg-transparent font-extrabold text-foreground focus:outline-none cursor-pointer pr-3 min-w-0 flex-1 truncate"
                                    >
                                      <option value="all">{lang === "ml" ? "എല്ലാ മണ്ഡലങ്ങളും" : "All"}</option>
                                      {(selectedDistrict === "all"
                                        ? constituencies
                                        : constituencies.filter((c) => c.districtId === selectedDistrict)
                                      ).map((c) => (
                                        <option key={c.id} value={c.id}>
                                          {c[lang]}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-1 shrink-0" />
                                  </div>
                                </>
                              )}

                              {leaderboardCategory === "booths" && (
                                <>
                                  <div className="relative flex-1 min-w-0 flex items-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-2 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                    <span className="shrink-0 mr-1">Mandalam:</span>
                                    <select
                                      value={selectedMandalam}
                                      onChange={(e) => {
                                        setSelectedMandalam(e.target.value);
                                        setSelectedArea("all");
                                      }}
                                      className="appearance-none bg-transparent font-extrabold text-foreground focus:outline-none cursor-pointer pr-3 min-w-0 flex-1 truncate"
                                    >
                                      <option value="all">{lang === "ml" ? "എല്ലാ മണ്ഡലങ്ങളും" : "All"}</option>
                                      {constituencies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                          {c[lang]}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-1 shrink-0" />
                                  </div>

                                  <div className="relative flex-1 min-w-0 flex items-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-2 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                    <span className="shrink-0 mr-1">Area:</span>
                                    <select
                                      value={selectedArea}
                                      onChange={(e) => setSelectedArea(e.target.value)}
                                      className="appearance-none bg-transparent font-extrabold text-foreground focus:outline-none cursor-pointer pr-3 min-w-0 flex-1 truncate"
                                    >
                                      <option value="all">{lang === "ml" ? "എല്ലാ മേഖലകളും" : "All"}</option>
                                      {getAreasForMandalam(selectedMandalam, lang).map((a) => (
                                        <option key={a.id} value={a.id}>
                                          {a[lang]}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-1 shrink-0" />
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          

                            {/* Top 3 Leaderboard Podium */}
                            <LeaderboardTop3Podium
                              rank1={rank1 as any}
                              rank2={rank2 as any}
                              rank3={rank3 as any}
                              category={leaderboardCategory}
                              lang={lang}
                            />

                          {/* Commonly Mentioned Legend Bar for PR & PW Badges */}
                          {leaderboardCategory === "workers" && (
                            <div className="flex items-center justify-center gap-3 px-2 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50">
                              <span className="flex items-center gap-1">
                                <span className="rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.2 text-[8.5px] font-black border border-purple-200">PR</span>
                                <span>{lang === "ml" ? "PR: ജനപ്രതിനിധി (People Representative)" : "PR: People Representative"}</span>
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span className="flex items-center gap-1">
                                <span className="rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.2 text-[8.5px] font-black border border-blue-200">PW</span>
                                <span>{lang === "ml" ? "PW: പാർട്ടി പ്രവർത്തകൻ (Party Worker)" : "PW: Party Worker"}</span>
                              </span>
                            </div>
                          )}

                          {/* Rankings List Card - Single Card with Thin Row Lines */}
                          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs space-y-1">
                            <div className="flex items-center justify-between pb-1">
                              <h3 className="font-black text-sm text-[#1e1b4b] dark:text-white tracking-tight">
                                {lang === "ml" ? "റാങ്കിംഗ്" : "Ranking"}
                              </h3>
                              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                                {lang === "ml" ? "പോയിന്റുകൾ" : "Points"}
                              </span>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {currentDataset.items.map((row) => (
                                <div
                                  key={row.rank}
                                  className="flex items-center justify-between py-1.5 px-1 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0 pr-1">
                                    <span className={`w-3.5 text-center font-black text-xs shrink-0 ${row.rankColor}`}>
                                      {row.rank}
                                    </span>
                                    {leaderboardCategory === "workers" && (row as any).avatarUrl ? (
                                      <img src={(row as any).avatarUrl} alt={row.name} className="h-7 w-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs" />
                                    ) : leaderboardCategory !== "workers" && (
                                      <span className={`text-[8px] font-black rounded-full px-1.5 py-0.2 shrink-0 ${row.tagBg}`}>
                                        {row.tag}
                                      </span>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-[12px] text-[#1e1b4b] dark:text-slate-200 truncate min-w-0">
                                          {row.name}
                                        </span>
                                        {leaderboardCategory === "workers" && (
                                          <span className={`text-[8.5px] font-black rounded-md px-1.5 py-0.2 shrink-0 ${row.tagBg}`}>
                                            {row.tag}
                                          </span>
                                        )}
                                      </div>
                                      {"district" in row && (row as any).district && (
                                        <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                                          {(row as any).district}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0 pl-1">
                                    <p className="font-black text-[12.5px] text-[#1e1b4b] dark:text-white leading-tight">
                                      {row.val}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* View All Link at Bottom of List */}
                            <div className="pt-2 pb-0.5 text-center border-t border-slate-100 dark:border-slate-800/60">
                              <button
                                type="button"
                                className="text-[11.5px] font-extrabold text-[#4f46e5] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Verification Disclaimer Pill */}
                            <div className="rounded-xl bg-[#f0fdf4] dark:bg-emerald-950/40 border border-[#bbf7d0] dark:border-emerald-800/50 px-2.5 py-1 flex items-center justify-center gap-1.5 text-center mt-2">
                              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#10b981] text-white text-[8px] font-black shrink-0">✓</span>
                              <span className="text-[10px] font-bold text-[#15803d] dark:text-emerald-400">
                                {lang === "ml" ? "സ്ഥിരീകരിച്ച പ്രവർത്തനങ്ങൾക്ക് മാത്രം പോയിന്റുകൾ." : "Only verified activities earn points."}
                              </span>
                            </div>
                          </div>
                        </div>
                          </div>
                        );
                      })()}

                    {/* Dedicated Subpage 2: Needs Attention Page */}
                    {mobileSubPage === "needs_attention" && (
                      <div className="space-y-4 pt-1 pb-4">
                        {/* Subpage Back Header */}
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <button
                            type="button"
                            onClick={() => {
            setMobileSubPage("none");
            setActiveTab("applications");
          }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "ശ്രദ്ധിക്കേണ്ടവ" : "Needs Attention"}</span>
                          </button>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {lang === "ml"
                              ? `${5 + followUpCollectionRecords.length} അടിയന്തര കാര്യങ്ങൾ`
                              : `${5 + followUpCollectionRecords.length} Items`}
                          </span>
                        </div>

                        {/* --- Section 0: Saved collection follow-ups --- */}
                        {followUpCollectionRecords.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-extrabold text-foreground">
                                {lang === "ml" ? "തുടർനടപടികൾ" : "Collection Follow-ups"}
                              </h4>
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                                {followUpCollectionRecords.length} {lang === "ml" ? "ബാക്കി" : "open"}
                              </span>
                            </div>

                            {followUpCollectionRecords.map((record) => (
                              <button
                                key={record.reference}
                                type="button"
                                onClick={() => openCollectionRecordView(record, "needs_attention")}
                                className="w-full text-left p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-extrabold text-[13.5px] text-[#0F172A] dark:text-amber-100 leading-tight truncate">
                                    {record.applicantName}
                                  </span>
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                                    {lang === "ml" ? "ശേഖരണം അപൂർണ്ണം" : "Collection incomplete"}
                                  </span>
                                </div>

                                <p className="text-[11px] text-[#64748B] dark:text-amber-200/70 leading-snug mt-1 truncate">
                                  {lang === "ml" ? record.scheme.titleMl : record.scheme.titleEn}
                                </p>

                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B45309] dark:text-amber-300 pt-1.5">
                                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                                  <span className="whitespace-nowrap">
                                    {record.followUpDate
                                      ? lang === "ml"
                                        ? `തുടർനടപടി: ${formatCollectionDate(record.followUpDate)}`
                                        : `Follow-up: ${formatCollectionDate(record.followUpDate)}`
                                      : lang === "ml"
                                        ? "തുടർനടപടി ഷെഡ്യൂൾ ചെയ്തിട്ടില്ല"
                                        : "Follow-up not scheduled"}
                                  </span>
                                  <span className="text-amber-300 dark:text-amber-700">•</span>
                                  <span className="whitespace-nowrap">
                                    {lang === "ml"
                                      ? `${record.missingItems.length} ബാക്കി`
                                      : `${record.missingItems.length} outstanding`}
                                  </span>
                                </div>

                                {record.followUpNotes && (
                                  <p className="text-[11px] text-[#64748B] dark:text-amber-200/70 leading-snug mt-1 line-clamp-2">
                                    {record.followUpNotes}
                                  </p>
                                )}

                                <div className="flex items-center justify-between pt-1.5">
                                  <span className="text-[10px] font-bold text-muted-foreground tracking-wide">
                                    {record.reference}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                                    {lang === "ml" ? "റെക്കോർഡ് കാണുക" : "View record"}
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* --- Section 1: Today --- */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-extrabold text-foreground">
                              {lang === "ml" ? "ഇന്ന്" : "Today"}
                            </h4>
                            <span className="text-[10px] font-bold text-[#E11D48] bg-[#FFE4E6] dark:bg-rose-950/60 dark:text-rose-300 px-2.5 py-0.5 rounded-full">
                              {lang === "ml" ? "2 പുതിയത്" : "2 new"}
                            </span>
                          </div>

                          {/* Card 1: NSP (Red/Rose) */}
                          <div className="p-3.5 rounded-2xl bg-[#FFF5F6] dark:bg-rose-950/20 border border-[#FFE2E5] dark:border-rose-900/40 shadow-2xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider truncate flex-1 min-w-0">
                                {lang === "ml" ? "നാഷണൽ സ്കോളർഷിപ്പ് പോർട്ടൽ" : "NATIONAL SCHOLARSHIP PORTAL"}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10.5px] font-medium text-[#71717A]">10:30 AM</span>
                                <span className="text-[10px] font-bold text-[#E11D48] bg-[#FFE4E6] px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {lang === "ml" ? "നടപടി ആവശ്യം" : "Action required"}
                                </span>
                                <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-1.5 space-y-1.5 pr-18">
                              <h5 className="font-extrabold text-[13.5px] text-[#0F172A] dark:text-rose-100 leading-tight">
                                {lang === "ml" ? "അപേക്ഷ പൂർത്തിയാക്കുക" : "Complete your application"}
                              </h5>
                              <p className="text-[11px] text-[#64748B] dark:text-rose-300/80 leading-snug">
                                {lang === "ml"
                                  ? "വെരിഫിക്കേഷൻ പൂർത്തിയാക്കാൻ മുൻവർഷത്തെ മാർക്ക് ലിസ്റ്റ് അപ്‌ലോഡ് ചെയ്യുക."
                                  : "Upload your previous year mark list to complete the verification process."}
                              </p>

                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#E11D48] pt-1">
                                <Calendar className="h-3.5 w-3.5 text-[#E11D48] shrink-0" />
                                <span className="whitespace-nowrap">{lang === "ml" ? "അവസാന തീയതി: 12 Nov 2024" : "Due by 12 Nov 2024"}</span>
                              </div>

                              <div className="pt-1.5">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-white bg-[#E11D48] hover:bg-rose-700 px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                                >
                                  <span>{lang === "ml" ? "തുടരുക" : "Continue Application"}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="absolute right-3 bottom-3 pointer-events-none w-16 h-18 bg-white/90 dark:bg-card/90 rounded-xl shadow-xs border border-rose-200/80 p-2 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="h-1.5 w-8 bg-rose-200 rounded-full" />
                                <div className="h-1.5 w-10 bg-rose-100 rounded-full" />
                                <div className="h-1.5 w-6 bg-rose-100 rounded-full" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-xs">
                                <ChevronRight className="h-3.5 w-3.5 -rotate-90 stroke-[3]" />
                              </div>
                            </div>
                          </div>

                          {/* Card 2: PM-KISAN (Amber/Orange) */}
                          <div className="p-3.5 rounded-2xl bg-[#FFFDF3] dark:bg-amber-950/20 border border-[#FEF3C7] dark:border-amber-900/40 shadow-2xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider truncate flex-1 min-w-0">
                                {lang === "ml" ? "പിഎം-കിസാൻ" : "PM-KISAN"}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10.5px] font-medium text-[#71717A]">09:15 AM</span>
                                <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {lang === "ml" ? "വെരിഫിക്കേഷൻ വേണം" : "Verification needed"}
                                </span>
                                <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-1.5 space-y-1.5 pr-18">
                              <h5 className="font-extrabold text-[13.5px] text-[#0F172A] dark:text-amber-100 leading-tight">
                                {lang === "ml" ? "ഇ-കെവൈസി പൂർത്തിയാക്കുക" : "Complete e-KYC"}
                              </h5>
                              <p className="text-[11px] text-[#64748B] dark:text-amber-300/80 leading-snug">
                                {lang === "ml"
                                  ? "അടുത്ത ഗഡു ലഭ്യമാക്കാൻ ആധാർ ഒടിപി വെരിഫിക്കേഷൻ പൂർത്തിയാക്കുക."
                                  : "Perform Aadhaar OTP verification to enable your next installment."}
                              </p>

                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D97706] pt-1">
                                <Calendar className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
                                <span className="whitespace-nowrap">{lang === "ml" ? "അവസാന തീയതി: 15 Nov 2024" : "Due by 15 Nov 2024"}</span>
                              </div>

                              <div className="pt-1.5">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-white bg-[#EA580C] hover:bg-orange-700 px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                                >
                                  <span>{lang === "ml" ? "വെരിഫൈ ചെയ്യുക" : "Verify Now"}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="absolute right-3 bottom-3 pointer-events-none w-16 h-14 bg-white/90 dark:bg-card/90 rounded-xl shadow-xs border border-amber-200/80 p-2 flex flex-col justify-between">
                              <div className="flex items-center gap-1">
                                <span className="text-[7px] font-extrabold text-amber-700">Aadhaar</span>
                                <div className="h-1 w-3 bg-amber-400 rounded-xs" />
                              </div>
                              <div className="space-y-1">
                                <div className="h-1 w-10 bg-amber-100 rounded-full" />
                                <div className="h-1 w-7 bg-amber-100 rounded-full" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs">
                                <ShieldCheck className="h-3.5 w-3.5" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* --- Section 2: This Week --- */}
                        <div className="space-y-2.5 pt-2">
                          <h4 className="text-sm font-extrabold text-foreground">
                            {lang === "ml" ? "ഈ ആഴ്ച" : "This Week"}
                          </h4>

                          {/* Card 3: Income Certificate (Blue) */}
                          <div className="p-3.5 rounded-2xl bg-[#F5F8FF] dark:bg-blue-950/20 border border-[#E0E7FF] dark:border-blue-900/40 shadow-2xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider truncate flex-1 min-w-0">
                                {lang === "ml" ? "വരുമാന സർട്ടിഫിക്കറ്റ് (ഇ-ഡിസ്ട്രിക്റ്റ്)" : "INCOME CERTIFICATE (KERALA E-DISTRICT)"}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10.5px] font-medium text-[#71717A]">Tue, 5 Nov</span>
                                <span className="text-[10px] font-bold text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {lang === "ml" ? "അപ്ഡേറ്റ്" : "Application Update"}
                                </span>
                                <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-1.5 space-y-1.5 pr-18">
                              <h5 className="font-extrabold text-[13.5px] text-[#0F172A] dark:text-blue-100 leading-tight">
                                {lang === "ml" ? "അപേക്ഷ അംഗീകരിച്ചു" : "Application approved"}
                              </h5>
                              <p className="text-[11px] text-[#64748B] dark:text-blue-300/80 leading-snug">
                                {lang === "ml"
                                  ? "നിങ്ങളുടെ വരുമാന സർട്ടിഫിക്കറ്റ് അപേക്ഷ വില്ലേജ് ഓഫീസർ അംഗീകരിച്ചു."
                                  : "Your income certificate application has been approved by the Village Officer."}
                              </p>

                              <div className="pt-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#2563EB] bg-white dark:bg-blue-950 hover:bg-blue-50 border border-[#2563EB] px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                                >
                                  <span>{lang === "ml" ? "വിവരങ്ങൾ കാണുക" : "View Details"}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="absolute right-3 bottom-3 pointer-events-none w-16 h-18 bg-white/90 dark:bg-card/90 rounded-xl shadow-xs border border-blue-200/80 p-2 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="h-1.5 w-8 bg-blue-200 rounded-full" />
                                <div className="h-1.5 w-10 bg-blue-100 rounded-full" />
                                <div className="h-1.5 w-6 bg-blue-100 rounded-full" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xs">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                            </div>
                          </div>

                          {/* Card 4: New Scheme (Green/Mint) */}
                          <div className="p-3.5 rounded-2xl bg-[#F4FAF6] dark:bg-emerald-950/20 border border-[#D1FAE5] dark:border-emerald-900/40 shadow-2xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider truncate flex-1 min-w-0">
                                {lang === "ml" ? "പുതിയ പദ്ധതി" : "NEW SCHEME"}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10.5px] font-medium text-[#71717A]">Sun, 3 Nov</span>
                                <span className="text-[10px] font-bold text-[#059669] bg-[#D1FAE5] px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {lang === "ml" ? "പദ്ധതി അപ്ഡേറ്റ്" : "Scheme Update"}
                                </span>
                                <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-1.5 space-y-1.5 pr-18">
                              <h5 className="font-extrabold text-[13.5px] text-[#0F172A] dark:text-emerald-100 leading-tight">
                                {lang === "ml" ? "പുതിയ ക്ഷേമ പദ്ധതി പ്രസിദ്ധീകരിച്ചു" : "New welfare scheme published"}
                              </h5>
                              <p className="text-[11px] text-[#64748B] dark:text-emerald-300/80 leading-snug">
                                {lang === "ml"
                                  ? "പ്രധാനമന്ത്രി വിശ്വകർമ്മ യോജന ഇപ്പോൾ ലഭ്യമാണ്. അർഹത പരിശോധിച്ച് അപേക്ഷിക്കുക."
                                  : "Pradhan Mantri Vishwakarma Yojana is now available. Check eligibility and apply."}
                              </p>

                              <div className="pt-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#059669] bg-white dark:bg-emerald-950 hover:bg-emerald-50 border border-[#059669] px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                                >
                                  <span>{lang === "ml" ? "പരിശോധിക്കുക" : "Explore Scheme"}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="absolute right-3 bottom-3 pointer-events-none w-16 h-16 bg-emerald-100/70 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center p-2 text-emerald-600">
                              <Megaphone className="h-8 w-8 stroke-[2.2]" />
                            </div>
                          </div>
                        </div>

                        {/* --- Section 3: Earlier --- */}
                        <div className="space-y-2.5 pt-2">
                          <h4 className="text-sm font-extrabold text-foreground">
                            {lang === "ml" ? "മുൻപ്" : "Earlier"}
                          </h4>

                          {/* Card 5: My Application (Purple) */}
                          <div className="p-3.5 rounded-2xl bg-[#FAF7FF] dark:bg-purple-950/20 border border-[#F3E8FF] dark:border-purple-900/40 shadow-2xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider truncate flex-1 min-w-0">
                                {lang === "ml" ? "എന്റെ അപേക്ഷ" : "MY APPLICATION"}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10.5px] font-medium text-[#71717A]">Fri, 1 Nov</span>
                                <span className="text-[10px] font-bold text-[#7C3AED] bg-[#F3E8FF] px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {lang === "ml" ? "തുടർനടപടി" : "Follow up"}
                                </span>
                                <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-1.5 space-y-1.5 pr-18">
                              <h5 className="font-extrabold text-[13.5px] text-[#0F172A] dark:text-purple-100 leading-tight">
                                {lang === "ml" ? "കൂടുതൽ വിവരങ്ങൾ ആവശ്യപ്പെട്ടു" : "Additional information requested"}
                              </h5>
                              <p className="text-[11px] text-[#64748B] dark:text-purple-300/80 leading-snug">
                                {lang === "ml"
                                  ? "നിങ്ങളുടെ ഭവന നിർമ്മാണ ഗ്രാന്റ് അപേക്ഷയ്ക്ക് അധിക രേഖകൾ ആവശ്യമാണ്."
                                  : "Your housing grant application requires additional documents."}
                              </p>

                              <div className="pt-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#7C3AED] bg-white dark:bg-purple-950 hover:bg-purple-50 border border-[#7C3AED] px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                                >
                                  <span>{lang === "ml" ? "പരിശോധിക്കുക" : "Review"}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="absolute right-3 bottom-3 pointer-events-none w-16 h-16 bg-purple-100/70 dark:bg-purple-950/50 rounded-2xl p-2 flex items-center justify-center">
                              <div className="relative w-12 h-10 bg-white dark:bg-card rounded-md shadow-xs border border-purple-200 p-1 flex flex-col justify-between">
                                <div className="h-1 w-6 bg-purple-200 rounded-full" />
                                <div className="h-1 w-8 bg-purple-100 rounded-full" />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                                  i
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dedicated Subpage 3: Recent Activity Page */}
                    {mobileSubPage === "recent_activity" && (
                      <div className="space-y-2.5 pt-0.5 pb-4 animate-in fade-in duration-200">
                        {/* Subpage Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 px-0.5">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b255a] dark:text-blue-400 hover:text-blue-700 cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "സമീപകാല പ്രവർത്തനങ്ങൾ" : "Recent Activity"}</span>
                          </button>
                          <Activity className="h-4 w-4 text-[#1b255a] dark:text-blue-400" />
                        </div>

                        {/* ================= SECTION 1: TODAY ================= */}
                        <div className="space-y-2">
                          {/* Group Header Bar */}
                          <div className="flex items-center justify-between bg-[#EEF2FF] dark:bg-slate-900/90 px-3 py-1.5 rounded-lg">
                            <h4 className="text-xs font-extrabold text-[#1E1B4B] dark:text-blue-200">
                              {lang === "ml" ? "ഇന്ന്" : "Today"}
                            </h4>
                            <span className="text-[10px] font-bold text-[#15803D] dark:text-emerald-300 bg-[#DCFCE7] dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                              {lang === "ml" ? "2 പുതിയത്" : "2 new"}
                            </span>
                          </div>

                          {/* Items Container with Vertical Timeline Line */}
                          <div className="relative pl-4 space-y-0">
                            {/* Continuous Vertical Timeline Line */}
                            <div className="absolute left-[5px] top-3 bottom-3 w-[1.5px] bg-slate-200 dark:bg-slate-700 pointer-events-none" />

                            {/* Item 1: Application Submitted */}
                            <div className="relative py-1.5 flex items-start gap-2 border-b border-slate-100 dark:border-slate-800/80">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[15px] top-[11px] w-2.5 h-2.5 rounded-full bg-[#2563EB] ring-4 ring-white dark:ring-slate-950 z-10 shrink-0" />

                              {/* Icon Box */}
                              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                                <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
                              </div>

                              {/* Text Info */}
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <h5 className="font-extrabold text-[12px] text-[#0F172A] dark:text-white leading-tight">
                                    {lang === "ml" ? "അപേക്ഷ സമർപ്പിച്ചു" : "Application Submitted"}
                                  </h5>
                                  <span className="text-[9.5px] font-medium text-[#94A3B8] shrink-0">10:30 AM</span>
                                </div>
                                <p className="text-[10.5px] text-[#64748B] dark:text-slate-400 leading-tight mt-0.5">
                                  {lang === "ml" ? "നിങ്ങളുടെ അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു." : "Your application was submitted successfully."}
                                </p>
                                <div className="mt-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#EFF6FF] dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-300">
                                    {lang === "ml" ? "പിഎം-കിസാൻ സമ്മാൻ നിധി" : "PM-KISAN Samman Nidhi"}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1] dark:text-slate-600 self-center shrink-0" />
                            </div>

                            {/* Item 2: Eligibility Checked */}
                            <div className="relative py-1.5 flex items-start gap-2">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[15px] top-[11px] w-2.5 h-2.5 rounded-full bg-[#10B981] ring-4 ring-white dark:ring-slate-950 z-10 shrink-0" />

                              {/* Icon Box */}
                              <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                              </div>

                              {/* Text Info */}
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <h5 className="font-extrabold text-[12px] text-[#0F172A] dark:text-white leading-tight">
                                    {lang === "ml" ? "യോഗ്യത പരിശോധിച്ചു" : "Eligibility Checked"}
                                  </h5>
                                  <span className="text-[9.5px] font-medium text-[#94A3B8] shrink-0">9:15 AM</span>
                                </div>
                                <p className="text-[10.5px] text-[#64748B] dark:text-slate-400 leading-tight mt-0.5">
                                  {lang === "ml" ? "നിങ്ങൾ യോഗ്യതാ പരിശോധന പൂർത്തിയാക്കി." : "You completed the eligibility check."}
                                </p>
                                <div className="mt-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#ECFDF5] dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-300">
                                    {lang === "ml" ? "പിഎം ആവാസ് യോജന - ഗ്രാമീൺ" : "PM Awas Yojana – Gramin"}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1] dark:text-slate-600 self-center shrink-0" />
                            </div>
                          </div>
                        </div>

                        {/* ================= SECTION 2: YESTERDAY ================= */}
                        <div className="space-y-2 pt-0.5">
                          {/* Group Header Bar */}
                          <div className="flex items-center justify-between bg-[#EEF2FF] dark:bg-slate-900/90 px-3 py-1.5 rounded-lg">
                            <h4 className="text-xs font-extrabold text-[#1E1B4B] dark:text-blue-200">
                              {lang === "ml" ? "ഇന്നലെ" : "Yesterday"}
                            </h4>
                            <span className="text-[10px] font-bold text-[#475569] dark:text-slate-300 bg-[#E2E8F0] dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {lang === "ml" ? "3 പ്രവർത്തനങ്ങൾ" : "3 activities"}
                            </span>
                          </div>

                          {/* Items Container with Vertical Timeline Line */}
                          <div className="relative pl-4 space-y-0">
                            {/* Continuous Vertical Timeline Line */}
                            <div className="absolute left-[5px] top-3 bottom-3 w-[1.5px] bg-slate-200 dark:bg-slate-700 pointer-events-none" />

                            {/* Item 3: Assistance Requested */}
                            <div className="relative py-1.5 flex items-start gap-2 border-b border-slate-100 dark:border-slate-800/80">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[15px] top-[11px] w-2.5 h-2.5 rounded-full bg-[#F97316] ring-4 ring-white dark:ring-slate-950 z-10 shrink-0" />

                              {/* Icon Box */}
                              <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] dark:bg-orange-950/60 flex items-center justify-center shrink-0">
                                <HeartHandshake className="h-3.5 w-3.5 text-[#F97316]" />
                              </div>

                              {/* Text Info */}
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <h5 className="font-extrabold text-[12px] text-[#0F172A] dark:text-white leading-tight">
                                    {lang === "ml" ? "സഹായം അഭ്യർത്ഥിച്ചു" : "Assistance Requested"}
                                  </h5>
                                  <span className="text-[9.5px] font-medium text-[#94A3B8] shrink-0">4:20 PM</span>
                                </div>
                                <p className="text-[10.5px] text-[#64748B] dark:text-slate-400 leading-tight mt-0.5">
                                  {lang === "ml" ? "നിങ്ങളുടെ അഭ്യർത്ഥന ലഭിച്ചു." : "Your request has been received."}
                                </p>
                                <div className="mt-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#FFF7ED] dark:bg-orange-950/80 text-[#EA580C] dark:text-orange-300">
                                    {lang === "ml" ? "സ്കോളർഷിപ്പ് അപേക്ഷാ സഹായം" : "Scholarship application support"}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1] dark:text-slate-600 self-center shrink-0" />
                            </div>

                            {/* Item 4: Course Completed */}
                            <div className="relative py-1.5 flex items-start gap-2 border-b border-slate-100 dark:border-slate-800/80">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[15px] top-[11px] w-2.5 h-2.5 rounded-full bg-[#8B5CF6] ring-4 ring-white dark:ring-slate-950 z-10 shrink-0" />

                              {/* Icon Box */}
                              <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] dark:bg-purple-950/60 flex items-center justify-center shrink-0">
                                <GraduationCap className="h-3.5 w-3.5 text-[#8B5CF6]" />
                              </div>

                              {/* Text Info */}
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <h5 className="font-extrabold text-[12px] text-[#0F172A] dark:text-white leading-tight">
                                    {lang === "ml" ? "കോഴ്സ് പൂർത്തിയായി" : "Course Completed"}
                                  </h5>
                                  <span className="text-[9.5px] font-medium text-[#94A3B8] shrink-0">11:00 AM</span>
                                </div>
                                <p className="text-[10.5px] text-[#64748B] dark:text-slate-400 leading-tight mt-0.5">
                                  {lang === "ml" ? "നിങ്ങൾ ഓൺലൈൻ ക്ലാസ്സ് പൂർത്തിയാക്കി." : "You completed the online class."}
                                </p>
                                <div className="mt-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#F5F3FF] dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300">
                                    {lang === "ml" ? "സർക്കാർ പദ്ധതി അവബോധം" : "Government Schemes Awareness"}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1] dark:text-slate-600 self-center shrink-0" />
                            </div>

                            {/* Item 5: Document Uploaded */}
                            <div className="relative py-1.5 flex items-start gap-2">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[15px] top-[11px] w-2.5 h-2.5 rounded-full bg-[#10B981] ring-4 ring-white dark:ring-slate-950 z-10 shrink-0" />

                              {/* Icon Box */}
                              <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                                <FileText className="h-3.5 w-3.5 text-[#10B981]" />
                              </div>

                              {/* Text Info */}
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <h5 className="font-extrabold text-[12px] text-[#0F172A] dark:text-white leading-tight">
                                    {lang === "ml" ? "രേഖ അപ്‌ലോഡ് ചെയ്തു" : "Document Uploaded"}
                                  </h5>
                                  <span className="text-[9.5px] font-medium text-[#94A3B8] shrink-0">9:45 AM</span>
                                </div>
                                <p className="text-[10.5px] text-[#64748B] dark:text-slate-400 leading-tight mt-0.5">
                                  {lang === "ml" ? "നിങ്ങളുടെ രേഖ വിജയകരമായി അപ്‌ലോഡ് ചെയ്തു." : "Your document has been uploaded successfully."}
                                </p>
                                <div className="mt-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#ECFDF5] dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-300">
                                    {lang === "ml" ? "വരുമാന സർട്ടിഫിക്കറ്റ്" : "Income Certificate"}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1] dark:text-slate-600 self-center shrink-0" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

  {/* Dedicated Subpage 6: Detailed Application View */}
  {mobileSubPage === "app_detail" && renderAppDetailSubpage()}

  {mobileSubPage === "notifications" && (
                      <div className="space-y-3 pt-0.5 animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border/80 pb-2">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b255a] dark:text-blue-400 hover:text-blue-700 cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "അറിയിപ്പുകൾ" : "Notifications"}</span>
                          </button>
                          <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                            {lang === "ml" ? "4 പുതിയത്" : "4 unread"}
                          </span>
                        </div>

                        {/* Top Horizontally Scrollable Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setActiveNotificationFilter("all")}
                            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              activeNotificationFilter === "all"
                                ? "bg-[#0b132b] text-white shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                          >
                            {lang === "ml" ? "എല്ലാം (6)" : "All (6)"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveNotificationFilter("unread")}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              activeNotificationFilter === "unread"
                                ? "bg-[#0b132b] text-white shadow-xs"
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40 hover:bg-rose-100"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span>{lang === "ml" ? "വായിക്കാത്തവ (4)" : "Unread (4)"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveNotificationFilter("applications")}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              activeNotificationFilter === "applications"
                                ? "bg-[#0b132b] text-white shadow-xs"
                                : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/40 hover:bg-blue-100"
                            }`}
                          >
                            <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            <span>{lang === "ml" ? "അപേക്ഷകൾ (2)" : "Applications (2)"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveNotificationFilter("schemes")}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              activeNotificationFilter === "schemes"
                                ? "bg-[#0b132b] text-white shadow-xs"
                                : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/40 hover:bg-purple-100"
                            }`}
                          >
                            <Megaphone className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            <span>{lang === "ml" ? "പദ്ധതികൾ (1)" : "Schemes (1)"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveNotificationFilter("support")}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              activeNotificationFilter === "support"
                                ? "bg-[#0b132b] text-white shadow-xs"
                                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40 hover:bg-emerald-100"
                            }`}
                          >
                            <Phone className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{lang === "ml" ? "സഹായം (1)" : "Support (1)"}</span>
                          </button>
                        </div>

                        {/* Notifications List Grouped */}
                        <div className="space-y-3 pt-0.5">
                          {/* Section 1: Today */}
                          {(activeNotificationFilter === "all" || activeNotificationFilter === "unread" || activeNotificationFilter === "applications") && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between px-0.5">
                                <h4 className="font-extrabold text-[11px] text-[#0f172a] dark:text-white">
                                  {lang === "ml" ? "ഇന്ന്" : "Today"}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                  {lang === "ml" ? "3 അറിയിപ്പുകൾ" : "3 notifications"}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {/* Item 1: PM-KISAN */}
                                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-2.5 cursor-pointer">
                                  <div className="h-11 w-11 rounded-2xl bg-[#fef6e7] dark:bg-amber-950/60 flex items-center justify-center text-[#d97706] dark:text-amber-400 shrink-0">
                                    <Sprout className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[8.5px] font-black text-[#c05621] dark:text-amber-300 bg-[#fef0d7] dark:bg-amber-950/80 px-2 py-0.2 rounded-full">
                                        PM-KISAN
                                      </span>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-[9.5px] font-medium text-slate-400">10m ago</span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] shrink-0" />
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                      </div>
                                    </div>
                                    <h5 className="font-bold text-[11.5px] text-[#0f172a] dark:text-white leading-tight">
                                      {lang === "ml" ? "പിഎം-കിസാൻ ഇ-കെവൈസി പൂർത്തിയാക്കുക" : "Complete PM-KISAN e-KYC"}
                                    </h5>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                                      {lang === "ml" ? "ഗുണഭോക്തൃ അക്കൗണ്ടിനായി വെരിഫിക്കേഷൻ കുടിശ്ശികയാണ്." : "Verification is pending for your beneficiary account."}
                                    </p>
                                  </div>
                                </div>

                                {/* Item 2: Scholarship */}
                                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-2.5 cursor-pointer">
                                  <div className="h-11 w-11 rounded-2xl bg-[#fdeef1] dark:bg-rose-950/60 flex items-center justify-center text-[#e11d48] dark:text-rose-400 shrink-0">
                                    <AlertTriangle className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[8.5px] font-black text-[#9b2c2c] dark:text-rose-300 bg-[#fde2e4] dark:bg-rose-950/80 px-2 py-0.2 rounded-full">
                                        {lang === "ml" ? "സ്കോളർഷിപ്പ്" : "Scholarship"}
                                      </span>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-[9.5px] font-medium text-slate-400">25m ago</span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] shrink-0" />
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                      </div>
                                    </div>
                                    <h5 className="font-bold text-[11.5px] text-[#0f172a] dark:text-white leading-tight">
                                      {lang === "ml" ? "സ്കോളർഷിപ്പ് അപേക്ഷയിൽ തിരുത്തൽ വേണം" : "Scholarship application correction required"}
                                    </h5>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                                      {lang === "ml" ? "പ്രോസസ്സിംഗ് തുടരാൻ കൂടുതൽ രേഖകൾ ആവശ്യമാണ്." : "Additional documents are needed to continue processing."}
                                    </p>
                                  </div>
                                </div>

                                {/* Item 3: Kerala e-District */}
                                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-2.5 cursor-pointer">
                                  <div className="h-11 w-11 rounded-2xl bg-[#eef4ff] dark:bg-blue-950/60 flex items-center justify-center text-[#2563eb] dark:text-blue-400 shrink-0">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[8.5px] font-black text-[#1e40af] dark:text-blue-300 bg-[#e0e7ff] dark:bg-blue-950/80 px-2 py-0.2 rounded-full">
                                        Kerala e-District
                                      </span>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-[9.5px] font-medium text-slate-400">1h ago</span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] shrink-0" />
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                      </div>
                                    </div>
                                    <h5 className="font-bold text-[11.5px] text-[#0f172a] dark:text-white leading-tight">
                                      {lang === "ml" ? "വരുമാന സർട്ടിഫിക്കറ്റ് സമർപ്പിച്ചു" : "Income certificate submitted"}
                                    </h5>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                                      {lang === "ml" ? "ഇ-ഡിസ്ട്രിക്റ്റ് അപേക്ഷ പരിശോധനയിലാണ്." : "Your Kerala e-District application is under review."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Section 2: Yesterday */}
                          {(activeNotificationFilter === "all" || activeNotificationFilter === "unread" || activeNotificationFilter === "schemes" || activeNotificationFilter === "support") && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between px-0.5">
                                <h4 className="font-extrabold text-[11px] text-[#0f172a] dark:text-white">
                                  {lang === "ml" ? "ഇന്നലെ" : "Yesterday"}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                  {lang === "ml" ? "2 അറിയിപ്പുകൾ" : "2 notifications"}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {/* Item 4: New scheme */}
                                {(activeNotificationFilter === "all" || activeNotificationFilter === "unread" || activeNotificationFilter === "schemes") && (
                                  <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-2.5 cursor-pointer">
                                    <div className="h-11 w-11 rounded-2xl bg-[#f4eefd] dark:bg-purple-950/60 flex items-center justify-center text-[#7c3aed] dark:text-purple-400 shrink-0">
                                      <Megaphone className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-[8.5px] font-black text-[#6b21a8] dark:text-purple-300 bg-[#f3e8ff] dark:bg-purple-950/80 px-2 py-0.2 rounded-full">
                                          {lang === "ml" ? "പുതിയ പദ്ധതി" : "New Scheme"}
                                        </span>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-[9.5px] font-medium text-slate-400">Yesterday</span>
                                          <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] shrink-0" />
                                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                        </div>
                                      </div>
                                      <h5 className="font-bold text-[11.5px] text-[#0f172a] dark:text-white leading-tight">
                                        {lang === "ml" ? "പുതിയ പദ്ധതി ലഭ്യമാണ്" : "New scheme available"}
                                      </h5>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                                        {lang === "ml" ? "പിഎം വിശ്വകർമ്മ യോജനയിൽ ഇപ്പോൾ അപേക്ഷിക്കാം." : "PM Vishwakarma Yojana is now open for eligible users."}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Item 5: Support */}
                                {(activeNotificationFilter === "all" || activeNotificationFilter === "support") && (
                                  <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-2.5 cursor-pointer">
                                    <div className="h-11 w-11 rounded-2xl bg-[#eefbf4] dark:bg-emerald-950/60 flex items-center justify-center text-[#059669] dark:text-emerald-400 shrink-0">
                                      <Phone className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-[8.5px] font-black text-[#065f46] dark:text-emerald-300 bg-[#d1fae5] dark:bg-emerald-950/80 px-2 py-0.2 rounded-full">
                                          {lang === "ml" ? "സഹായം" : "Support"}
                                        </span>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-[9.5px] font-medium text-slate-400">Yesterday</span>
                                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                        </div>
                                      </div>
                                      <h5 className="font-bold text-[11.5px] text-[#0f172a] dark:text-white leading-tight">
                                        {lang === "ml" ? "സഹായ അഭ്യർത്ഥന പുതുക്കി" : "Help request updated"}
                                      </h5>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                                        {lang === "ml" ? "സപ്പോർട്ട് ടീം കൂടുതൽ വിവരങ്ങൾ ആവശ്യപ്പെട്ടിട്ടുണ്ട്." : "Support team requested additional information."}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Section 3: 12 Nov 2024 */}
                          {(activeNotificationFilter === "all" || activeNotificationFilter === "applications") && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-xs text-[#0f172a] dark:text-white">
                                  12 Nov 2024
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                  {lang === "ml" ? "1 അറിയിപ്പ്" : "1 notification"}
                                </span>
                              </div>

                              {/* Item 6 */}
                              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-2.5 cursor-pointer">
                                <div className="h-9 w-9 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                                  <FileText className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-blue-800 dark:text-blue-300 bg-blue-100/90 dark:bg-blue-950/80 px-2 py-0.2 rounded-full">
                                      {lang === "ml" ? "അപേക്ഷ" : "Application"}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-[12px] text-[#0f172a] dark:text-white leading-tight">
                                    {lang === "ml" ? "വരുമാന സർട്ടിഫിക്കറ്റ് അപേക്ഷ സമർപ്പിച്ചു" : "Income certificate application submitted"}
                                  </h5>
                                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug">
                                    {lang === "ml" ? "തിരുവനന്തപുരം ജില്ല" : "Thiruvananthapuram district"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                                  <span className="text-[9.5px] font-semibold text-slate-400">12 Nov</span>
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Section 4: 11 Nov 2024 */}
                          {(activeNotificationFilter === "all" || activeNotificationFilter === "support") && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-xs text-[#0f172a] dark:text-white">
                                  11 Nov 2024
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                  {lang === "ml" ? "1 അറിയിപ്പ്" : "1 notification"}
                                </span>
                              </div>

                              {/* Item 7 */}
                              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-2.5 cursor-pointer">
                                <div className="h-9 w-9 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                                  <CheckCircle2 className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 px-2 py-0.2 rounded-full">
                                      {lang === "ml" ? "വിവരങ്ങൾ" : "Information"}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-[12px] text-[#0f172a] dark:text-white leading-tight">
                                    {lang === "ml" ? "പ്രൊഫൈൽ പുതുക്കി" : "Profile updated"}
                                  </h5>
                                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug">
                                    {lang === "ml" ? "നിങ്ങളുടെ മൊബൈൽ നമ്പർ വിജയികരമായി പുതുക്കി." : "Your mobile number has been successfully updated."}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                                  <span className="text-[9.5px] font-semibold text-slate-400">11 Nov</span>
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dedicated Subpage 6: Applications Subpage */}
                    {mobileSubPage === "applications" && (
                      <div className="space-y-3 pt-0.5 animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border/80 pb-1.5 gap-1">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="inline-flex items-center gap-2 shrink-0 cursor-pointer"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff7ec] text-[#1b255a] dark:bg-slate-800 dark:text-white">
                              <ArrowLeft className="h-3.5 w-3.5 stroke-[2]" />
                            </span>
                            <span className="text-[13px] font-bold text-[#1b255a] dark:text-white">
                              {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                            </span>
                          </button>

                          {/* Period Selector & Filter Action in Header */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="flex items-center justify-between rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs hover:border-slate-300 transition-all min-h-[28px] max-w-[150px] sm:max-w-[180px]">
                              <div className="flex items-center gap-0.5 min-w-0 flex-1 justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(-1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Previous Period"
                                >
                                  <ChevronLeft className="h-3 w-3 stroke-[2.4]" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setIsDatePickerOpen(true)}
                                  className="text-[9.5px] sm:text-[10px] font-extrabold text-[#0a0f1d] dark:text-slate-100 hover:text-[#ff5500] transition-colors cursor-pointer px-0.5 tracking-tight truncate"
                                  title="Click to Open Date Picker"
                                >
                                  {getFormattedPeriodDisplay()}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Next Period"
                                >
                                  <ChevronRight className="h-3 w-3 stroke-[2.4]" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setIsDatePickerOpen(true)}
                                className="p-0.5 rounded-full text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-800 pl-1 ml-0.5 shrink-0"
                                title="Open Date Picker"
                              >
                                <Calendar className="h-3 w-3 stroke-[2.2]" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowFilterMenu(!showFilterMenu)}
                              className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer shrink-0 ${
                                showFilterMenu
                                  ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30 shadow-xs"
                                  : "border-amber-200/60 dark:border-slate-800 bg-[#fffcf0] dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 hover:bg-amber-100/50"
                              }`}
                              title="Toggle Filters"
                            >
                              <Filter className={`h-3.5 w-3.5 stroke-[2.2] shrink-0 ${showFilterMenu ? "text-white" : "text-[#ff5500]"}`} />
                            </button>
                          </div>
                        </div>

                        {/* Search Input & Status Selection Dropdown Pill */}
                        <div className="flex items-center gap-2 pb-1">
                          {/* Application Search Input */}
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              value={applicationSearchQuery}
                              onChange={(e) => setApplicationSearchQuery(e.target.value)}
                              placeholder={lang === "ml" ? "പേര്, ഐഡി, ടൈപ്പ് തിരയുക..." : "Search by name, ID, type..."}
                              className="w-full h-7 pl-7 pr-6 text-[11px] font-semibold rounded-full border border-amber-200/80 dark:border-slate-800 bg-[#fffcfa] dark:bg-slate-900 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                            />
                            {applicationSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setApplicationSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Status Selection Dropdown Pill */}
                          <div className="relative shrink-0">
                            <select
                              value={applicationStatusFilter}
                              onChange={(e) => setApplicationStatusFilter(e.target.value as MobileApplicationStatusFilter)}
                              className="h-7 pl-3 pr-7 text-[11px] font-bold rounded-full border border-amber-200/80 dark:border-orange-800/80 bg-[#fffcf0] dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs cursor-pointer appearance-none"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ അപേക്ഷകളും" : "All Applications"}</option>
                              <option value="application_received">{lang === "ml" ? "ലഭിച്ച അപേക്ഷകൾ" : "Application Received"}</option>
                              <option value="document_verification_completed">{lang === "ml" ? "രേഖാ പരിശോധന പൂർത്തിയായി" : "Document Verification Completed"}</option>
                              <option value="applied">{lang === "ml" ? "അപേക്ഷിച്ചു" : "Applied"}</option>
                              <option value="review">{lang === "ml" ? "പരിശോധനയിൽ" : "Review"}</option>
                              <option value="beneficiary">{lang === "ml" ? "ഗുണഭോക്താവ്" : "Beneficiary"}</option>
                              <option value="rejected">{lang === "ml" ? "നിരസിച്ചവ" : "Rejected"}</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#0a0f1d] dark:text-slate-300 pointer-events-none" />
                          </div>
                        </div>

                        {/* List of Applications */}
                        <div className="space-y-2 pt-1">
                          {/* Item 1: Pending */}
                          {matchAppSearch("pending", "PM YASASVI Scholarship", "പിഎം യശസ്വി സ്കോളർഷിപ്പ്", "Ananya Ramesh", "അനന്യ രമേശ്", "Scholarship", "സ്കോളർഷിപ്പ്", "APP-2026-8910") && (
                            <div 
                              onClick={() => {
                                setSelectedApplicationRecord({
                                  ref: "APP-2026-8910",
                                  schemeNameEn: "PM YASASVI Scholarship",
                                  schemeNameMl: "പിഎം യശസ്വി സ്കോളർഷിപ്പ്",
                                  categoryEn: "Scholarship",
                                  categoryMl: "സ്കോളർഷിപ്പ്",
                                  status: "pending",
                                  applicantNameEn: "Ananya Ramesh",
                                  applicantNameMl: "അനന്യ രമേശ്",
                                  aadhaar: "XXXX-XXXX-8910",
                                  phone: "+91 94950 33445",
                                  locationEn: "Kazhakkoottam, Thiruvananthapuram",
                                  locationMl: "കഴക്കൂട്ടം, തിരുവനന്തപുരം",
                                  annualIncome: "₹ 1,20,000",
                                  appliedDate: "05/10/2026",
                                  currentStep: 2,
                                  pendingDocs: ["Class 10 Marklist.pdf", "Aadhaar Card.jpg", "Income Certificate.pdf"],
                                  nextActionEn: "Income Certificate verification by Village Officer pending",
                                  nextActionMl: "വില്ലേജ് ഓഫീസറുടെ വരുമാന സർട്ടിഫിക്കറ്റ് പരിശോധന കുടിശ്ശികയാണ്",
                                  auditLog: [
                                    { titleEn: "Application Submitted Online", titleMl: "അപേക്ഷ ഓൺലൈനായി സമർപ്പിച്ചു", date: "05 Oct 2026", status: "completed" },
                                    { titleEn: "Document Verification in Progress", titleMl: "രേഖാ പരിശോധന പുരോഗമിക്കുന്നു", date: "06 Oct 2026", status: "current" },
                                    { titleEn: "Field Level Verification", titleMl: "ഫീൽഡ് തല പരിശോധന", date: "Pending", status: "upcoming" },
                                  ],
                                });
                                setMobileSubPage("app_detail");
                              }}
                              className="p-3 rounded-2xl bg-[#FFFDF3] dark:bg-amber-950/20 border border-[#FEF3C7] dark:border-amber-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-black text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 px-2 py-0.5 rounded-full uppercase">
                                  {lang === "ml" ? "സ്കോളർഷിപ്പ്" : "Scholarship"}
                                </span>
                                <span className="text-[9.5px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded-md inline-flex items-center gap-1">
                                  <Hourglass className="h-2.5 w-2.5" />
                                  {lang === "ml" ? "പെൻഡിംഗ്" : "Pending Verification"}
                                </span>
                              </div>
                              <h5 className="font-bold text-[12.5px] text-[#0f172a] dark:text-white leading-tight mt-1.5">
                                {lang === "ml" ? "പിഎം യശസ്വി സ്കോളർഷിപ്പ്" : "PM YASASVI Scholarship"}
                              </h5>
                              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                                {lang === "ml" ? "അപേക്ഷകൻ: അനന്യ രമേശ് · കഴക്കൂട്ടം" : "Applicant: Ananya Ramesh · Kazhakkoottam"}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 mt-2 text-[10px] text-slate-500 font-medium">
                                <span>Ref: APP-2026-8910</span>
                                <span className="flex items-center gap-1 text-amber-700 font-bold">
                                  {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Item 2: Assisted */}
                          {matchAppSearch("assisted", "Ayushman Bharat PM-JAY", "ആയുഷ്മാൻ ഭാരത് പിഎം-ജയ്", "Lakshmi Amma", "ലക്ഷ്മി അമ്മ", "Health Insurance", "ആരോഗ്യം", "APP-2026-8922") && (
                            <div 
                              onClick={() => {
                                setSelectedApplicationRecord({
                                  ref: "APP-2026-8922",
                                  schemeNameEn: "Ayushman Bharat PM-JAY",
                                  schemeNameMl: "ആയുഷ്മാൻ ഭാരത് പിഎം-ജയ്",
                                  categoryEn: "Health Insurance",
                                  categoryMl: "ആരോഗ്യം",
                                  status: "approved",
                                  applicantNameEn: "Lakshmi Amma",
                                  applicantNameMl: "ലക്ഷ്മി അമ്മ",
                                  aadhaar: "XXXX-XXXX-8922",
                                  phone: "+91 98470 11223",
                                  locationEn: "Vattiyoorkavu, Thiruvananthapuram",
                                  locationMl: "വട്ടിയൂർക്കാവ്, തിരുവനന്തപുരം",
                                  annualIncome: "₹ 75,000",
                                  appliedDate: "03/10/2026",
                                  currentStep: 4,
                                  pendingDocs: ["Ration Card Copy.jpg", "Doctor Certificate.docx"],
                                  nextActionEn: "Sanction letter generated. Financial claim process ready.",
                                  nextActionMl: "അനുമതി പത്രം തയാറായി. ധനസഹായ തുക നൽകാൻ വിവരങ്ങൾ ക്രമീകരിച്ചു.",
                                  auditLog: [
                                    { titleEn: "Application Received", titleMl: "അപേക്ഷ ലഭിച്ചു", date: "03 Oct 2026", status: "completed" },
                                    { titleEn: "Document Verification Completed", titleMl: "രേഖാ പരിശോധന പൂർത്തിയായി", date: "04 Oct 2026", status: "completed" },
                                    { titleEn: "District Medical Sanction", titleMl: "ജില്ലാ മെഡിക്കൽ അനുമതി", date: "05 Oct 2026", status: "completed" },
                                  ],
                                });
                                setMobileSubPage("app_detail");
                              }}
                              className="p-3 rounded-2xl bg-[#F0FDF4] dark:bg-teal-950/20 border border-[#DCFCE7] dark:border-teal-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-black text-teal-800 dark:text-teal-300 bg-teal-100/90 dark:bg-teal-950/80 px-2 py-0.5 rounded-full uppercase">
                                  {lang === "ml" ? "ആരോഗ്യം" : "Health Insurance"}
                                </span>
                                <span className="text-[9.5px] font-bold text-teal-700 bg-teal-100 px-2 py-0.2 rounded-md inline-flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  {lang === "ml" ? "സഹായം ലഭിച്ചു" : "Approved & Assisted"}
                                </span>
                              </div>
                              <h5 className="font-bold text-[12.5px] text-[#0f172a] dark:text-white leading-tight mt-1.5">
                                {lang === "ml" ? "ആയുഷ്മാൻ ഭാരത് പിഎം-ജയ്" : "Ayushman Bharat PM-JAY"}
                              </h5>
                              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                                {lang === "ml" ? "അപേക്ഷക: ലക്ഷ്മി അമ്മ · വട്ടിയൂർക്കാവ്" : "Applicant: Lakshmi Amma · Vattiyoorkavu"}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-teal-200/60 mt-2 text-[10px] text-slate-500 font-medium">
                                <span>Ref: APP-2026-8922</span>
                                <span className="flex items-center gap-1 text-teal-700 font-bold">
                                  {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Item 3: Pending */}
                          {matchAppSearch("pending", "PM Kisan Samman Nidhi", "പിഎം-കിസാൻ സമ്മാൻ നിധി", "K. Krishnan", "കെ. കൃഷ്ണൻ", "Agriculture", "കൃഷി", "APP-2026-8925") && (
                            <div 
                              onClick={() => {
                                setSelectedApplicationRecord({
                                  ref: "APP-2026-8925",
                                  schemeNameEn: "PM Kisan Samman Nidhi",
                                  schemeNameMl: "പിഎം-കിസാൻ സമ്മാൻ നിധി",
                                  categoryEn: "Agriculture",
                                  categoryMl: "കൃഷി",
                                  status: "pending",
                                  applicantNameEn: "K. Krishnan",
                                  applicantNameMl: "കെ. കൃഷ്ണൻ",
                                  aadhaar: "XXXX-XXXX-8925",
                                  phone: "+91 98463 87654",
                                  locationEn: "Palakkad North, Palakkad",
                                  locationMl: "പാലക്കാട് നോർത്ത്, പാലക്കാട്",
                                  annualIncome: "₹ 90,000",
                                  appliedDate: "01/10/2026",
                                  currentStep: 2,
                                  pendingDocs: ["Land Tax Receipt.pdf", "Aadhaar e-KYC Verification.png"],
                                  nextActionEn: "Pending e-KYC validation via Biometric / OTP",
                                  nextActionMl: "ബയോമെട്രിക് / ഒടിപി വഴി ഇ-കെവൈസി പരിശോധന പൂർത്തിയാക്കുക",
                                  auditLog: [
                                    { titleEn: "Application Registered", titleMl: "അപേക്ഷ രജിസ്റ്റർ ചെയ്തു", date: "01 Oct 2026", status: "completed" },
                                    { titleEn: "Land Record Audit", titleMl: "ഭൂമി വിവര പരിശോധന", date: "03 Oct 2026", status: "completed" },
                                    { titleEn: "Bank Aadhar Seeding", titleMl: "ബാങ്ക് ആധാർ ലിങ്കിംഗ്", date: "Pending", status: "current" },
                                  ],
                                });
                                setMobileSubPage("app_detail");
                              }}
                              className="p-3 rounded-2xl bg-[#FFFDF3] dark:bg-amber-950/20 border border-[#FEF3C7] dark:border-amber-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-black text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 px-2 py-0.5 rounded-full uppercase">
                                  {lang === "ml" ? "കൃഷി" : "Agriculture"}
                                </span>
                                <span className="text-[9.5px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded-md inline-flex items-center gap-1">
                                  <Hourglass className="h-2.5 w-2.5" />
                                  {lang === "ml" ? "പെൻഡിംഗ്" : "Document Review Pending"}
                                </span>
                              </div>
                              <h5 className="font-bold text-[12.5px] text-[#0f172a] dark:text-white leading-tight mt-1.5">
                                {lang === "ml" ? "പിഎം-കിസാൻ സമ്മാൻ നിധി" : "PM Kisan Samman Nidhi"}
                              </h5>
                              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                                {lang === "ml" ? "അപേക്ഷകൻ: കെ. കൃഷ്ണൻ · പാലക്കാട്" : "Applicant: K. Krishnan · Palakkad"}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 mt-2 text-[10px] text-slate-500 font-medium">
                                <span>Ref: APP-2026-8925</span>
                                <span className="flex items-center gap-1 text-amber-700 font-bold">
                                  {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Item 4: Rejected */}
                          {matchAppSearch("rejected", "Pradhan Mantri Awas Yojana - Urban (PMAY-U)", "പ്രധാനമന്ത്രി ആവാസ് യോജന - അർബൻ (PMAY-U)", "Joseph K", "ജോസഫ് കെ", "Housing", "ഭവന നിർമ്മാണം", "APP-2026-8927") && (
                            <div 
                              onClick={() => {
                                setSelectedApplicationRecord({
                                  ref: "APP-2026-8927",
                                  schemeNameEn: "Pradhan Mantri Awas Yojana - Urban (PMAY-U)",
                                  schemeNameMl: "പ്രധാനമന്ത്രി ആവാസ് യോജന - അർബൻ (PMAY-U)",
                                  categoryEn: "Housing",
                                  categoryMl: "ഭവന നിർമ്മാണം",
                                  status: "rejected",
                                  applicantNameEn: "Joseph K",
                                  applicantNameMl: "ജോസഫ് കെ",
                                  aadhaar: "XXXX-XXXX-8927",
                                  phone: "+91 98952 66778",
                                  locationEn: "Chathannoor, Kollam",
                                  locationMl: "ചാത്തന്നൂർ, കൊല്ലം",
                                  annualIncome: "₹ 1,80,000",
                                  appliedDate: "29/09/2026",
                                  currentStep: 3,
                                  pendingDocs: ["Ownership Title Deed.pdf"],
                                  nextActionEn: "Rejected due to income limit exceeding eligibility criteria",
                                  nextActionMl: "വരുമാന പരിധി യോഗ്യതാ മാനദണ്ഡത്തിൽ കൂടുതൽ ആയതിനാൽ നിരസിച്ചു",
                                  auditLog: [
                                    { titleEn: "Application Submitted", titleMl: "അപേക്ഷ സമർപ്പിച്ചു", date: "29 Sep 2026", status: "completed" },
                                    { titleEn: "Field Verification Inspection", titleMl: "ഫീൽഡ് തല പരിശോധന", date: "02 Oct 2026", status: "completed" },
                                    { titleEn: "Application Rejected", titleMl: "അപേക്ഷ നിരസിച്ചു", date: "04 Oct 2026", status: "completed" },
                                  ],
                                });
                                setMobileSubPage("app_detail");
                              }}
                              className="p-3 rounded-2xl bg-[#FFF5F5] dark:bg-rose-950/20 border border-[#FFE4E6] dark:border-rose-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-black text-rose-800 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/80 px-2 py-0.5 rounded-full uppercase">
                                  {lang === "ml" ? "ഭവന നിർമ്മാണം" : "Housing"}
                                </span>
                                <span className="text-[9.5px] font-bold text-rose-700 bg-rose-100 px-2 py-0.2 rounded-md inline-flex items-center gap-1">
                                  <XCircle className="h-2.5 w-2.5" />
                                  {lang === "ml" ? "നിരസിച്ചു" : "Rejected"}
                                </span>
                              </div>
                              <h5 className="font-bold text-[12.5px] text-[#0f172a] dark:text-white leading-tight mt-1.5">
                                {lang === "ml" ? "പ്രധാനമന്ത്രി ആവാസ് യോജന - അർബൻ (PMAY-U)" : "Pradhan Mantri Awas Yojana - Urban (PMAY-U)"}
                              </h5>
                              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                                {lang === "ml" ? "അപേക്ഷകൻ: ജോസഫ് കെ · ചാത്തന്നൂർ" : "Applicant: Joseph K · Chathannoor"}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-rose-200/60 mt-2 text-[10px] text-slate-500 font-medium">
                                <span>Ref: APP-2026-8927</span>
                                <span className="flex items-center gap-1 text-rose-700 font-bold">
                                  {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Item 5: Assisted */}
                          {matchAppSearch("assisted", "Ayushman Bharat PM-JAY", "ആയുഷ്മാൻ ഭാരത് പിഎം-ജയ്", "Lakshmi Amma", "ലക്ഷ്മി അമ്മ", "Health Insurance", "ആരോഗ്യം", "APP-2026-8922") && (
                            <div 
                              onClick={() => {
                                setSelectedApplicationRecord({
                                  ref: "APP-2026-8921",
                                  schemeNameEn: "Indira Gandhi National Old Age Pension Scheme",
                                  schemeNameMl: "ഇന്ദിരാഗാന്ധി ദേശീയ വാർധക്യ പെൻഷൻ പദ്ധതി",
                                  categoryEn: "Pension",
                                  categoryMl: "പെൻഷൻ",
                                  status: "disbursed",
                                  applicantNameEn: "Soman P",
                                  applicantNameMl: "സോമൻ പി",
                                  aadhaar: "XXXX-XXXX-8921",
                                  phone: "+91 94471 23456",
                                  locationEn: "Kazhakkoottam, Thiruvananthapuram",
                                  locationMl: "കഴക്കൂട്ടം, തിരുവനന്തപുരം",
                                  annualIncome: "₹ 60,000",
                                  appliedDate: "04/10/2026",
                                  currentStep: 5,
                                  pendingDocs: ["Age Proof Certificate.pdf", "Bank Passbook Copy.png"],
                                  nextActionEn: "Monthly pension disbursed directly to DBT linked bank account",
                                  nextActionMl: "പ്രതിമാസ പെൻഷൻ ഡിബിടി ബാങ്ക് അക്കൗണ്ടിലേക്ക് അയച്ചു നൽകി",
                                  auditLog: [
                                    { titleEn: "Application Submitted", titleMl: "അപേക്ഷ സമർപ്പിച്ചു", date: "04 Oct 2026", status: "completed" },
                                    { titleEn: "Verification & Approval", titleMl: "പരിശോധനയും അംഗീകാരവും", date: "05 Oct 2026", status: "completed" },
                                    { titleEn: "First Pension Disbursed", titleMl: "ആദ്യ പെൻഷൻ ലഭിച്ചു", date: "06 Oct 2026", status: "completed" },
                                  ],
                                });
                                setMobileSubPage("app_detail");
                              }}
                              className="p-3 rounded-2xl bg-[#F0FDF4] dark:bg-teal-950/20 border border-[#DCFCE7] dark:border-teal-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-black text-teal-800 dark:text-teal-300 bg-teal-100/90 dark:bg-teal-950/80 px-2 py-0.5 rounded-full uppercase">
                                  {lang === "ml" ? "പെൻഷൻ" : "Pension"}
                                </span>
                                <span className="text-[9.5px] font-bold text-teal-700 bg-teal-100 px-2 py-0.2 rounded-md inline-flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  {lang === "ml" ? "സഹായം ലഭിച്ചു" : "Disbursed"}
                                </span>
                              </div>
                              <h5 className="font-bold text-[12.5px] text-[#0f172a] dark:text-white leading-tight mt-1.5">
                                {lang === "ml" ? "ഇന്ദിരാഗാന്ധി ദേശീയ വാർധക്യ പെൻഷൻ പദ്ധതി" : "Indira Gandhi National Old Age Pension Scheme"}
                              </h5>
                              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                                {lang === "ml" ? "അപേക്ഷകൻ: സോമൻ പി · തിരുവനന്തപുരം" : "Applicant: Soman P · Thiruvananthapuram"}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-teal-200/60 mt-2 text-[10px] text-slate-500 font-medium">
                                <span>Ref: APP-2026-8921</span>
                                <span className="flex items-center gap-1 text-teal-700 font-bold">
                                  {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dedicated Subpage 4: Beneficiaries Page */}

                    {/* Dedicated Subpage 4: Beneficiaries Page */}


                    {/* Dedicated Subpage 4: Beneficiaries Page */}
                    {mobileSubPage === "beneficiaries" && (
                      <div className="space-y-3 pt-0.5 animate-in fade-in duration-200">
                        {/* Subpage Header with Back Navigation Button and Period / Filter Pill */}
                        <div className="flex items-center justify-between border-b border-border/80 pb-2 gap-1">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#ff5500] hover:text-orange-600 cursor-pointer shrink-0"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "ഗുണഭോക്താക്കളുടെ പട്ടിക" : "Beneficiaries List"}</span>
                          </button>

                          {/* Period Selector & Filter Action in Header */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="flex items-center justify-between rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs hover:border-slate-300 transition-all min-h-[28px] max-w-[150px] sm:max-w-[180px]">
                              <div className="flex items-center gap-0.5 min-w-0 flex-1 justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(-1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Previous Period"
                                >
                                  <ChevronLeft className="h-3 w-3 stroke-[2.4]" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setIsDatePickerOpen(true)}
                                  className="text-[9.5px] sm:text-[10px] font-extrabold text-[#0a0f1d] dark:text-slate-100 hover:text-[#ff5500] transition-colors cursor-pointer px-0.5 tracking-tight truncate"
                                  title="Click to Open Date Picker"
                                >
                                  {getFormattedPeriodDisplay()}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Next Period"
                                >
                                  <ChevronRight className="h-3 w-3 stroke-[2.4]" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setIsDatePickerOpen(true)}
                                className="p-0.5 rounded-full text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-800 pl-1 ml-0.5 shrink-0"
                                title="Open Date Picker"
                              >
                                <Calendar className="h-3 w-3 stroke-[2.2]" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowFilterMenu(!showFilterMenu)}
                              className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer shrink-0 ${
                                showFilterMenu
                                  ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30 shadow-xs"
                                  : "border-amber-200/60 dark:border-slate-800 bg-[#fffcf0] dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 hover:bg-amber-100/50"
                              }`}
                              title="Toggle Filters"
                            >
                              <Filter className={`h-3.5 w-3.5 stroke-[2.2] shrink-0 ${showFilterMenu ? "text-white" : "text-[#ff5500]"}`} />
                            </button>
                          </div>
                        </div>

                        {/* Top 2 KPI / Stats Cards: Matching Dashboard & User Page KPI Style */}
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          {/* 1. Beneficiaries KPI Card */}
                          <div className="p-2.5 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
                                {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                              </span>
                              <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-orange-500 to-[#ff5500] flex items-center justify-center text-white shrink-0 shadow-2xs">
                                <HeartHandshake className="h-2.5 w-2.5 stroke-[2.5]" />
                              </div>
                            </div>
                            <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-1">
                              {currentMetrics.beneficiaries.toLocaleString()}
                            </div>
                          </div>

                          {/* 2. Applications KPI Card */}
                          <div className="p-2.5 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
                                {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                              </span>
                              <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                                <FileText className="h-2.5 w-2.5 stroke-[2.5]" />
                              </div>
                            </div>
                            <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-1">
                              {applicationsCount.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Search & Category Filter */}
                        <div className="space-y-1">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                              type="text"
                              value={beneficiarySearchQuery}
                              onChange={(e) => setBeneficiarySearchQuery(e.target.value)}
                              placeholder={lang === "ml" ? "പേര്, വിഭാഗം, സ്ഥലം, പദ്ധതി സെർച്ച് ചെയ്യുക..." : "Search name, user type, location, scheme..."}
                              className="w-full rounded-xl border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                            />
                          </div>

                          {/* Quick Category Filter Pills (Requested User Types) */}
                          <div className="flex items-center gap-1 overflow-x-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-[1px] pb-0.5 text-[10px]">
                            {[
                              { id: "ALL", labelEn: "All", labelMl: "എല്ലാം" },
                              { id: "Public Citizen", labelEn: "Public Citizen", labelMl: "പൊതുജനങ്ങൾ" },
                              { id: "BJP Member", labelEn: "BJP Member", labelMl: "ബി.ജെ.പി അംഗം" },
                              { id: "Politician", labelEn: "Politician", labelMl: "രാഷ്ട്രീയ നേതാവ്" },
                              { id: "People’s Representative", labelEn: "People’s Representative", labelMl: "ജനപ്രതിനിധി" },
                            ].map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setBeneficiaryCategoryFilter(cat.id)}
                                className={`px-2.5 py-1 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                                  beneficiaryCategoryFilter === cat.id
                                    ? "bg-orange-500 text-white shadow-2xs"
                                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                              >
                                {lang === "ml" ? cat.labelMl : cat.labelEn}
                              </button>
                            ))}
                          </div>
                        </div>


                        {/* Beneficiary List Items */}
                        <div className="space-y-2">
                          {filteredBeneficiariesList.map((b) => (
                            <div
                              key={b.id}
                              className="p-2.5 rounded-xl border border-border bg-card shadow-2xs hover:border-orange-300 dark:hover:border-orange-800 transition-all space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                    {b.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <h5 className="font-bold text-xs text-foreground truncate">
                                        {lang === "ml" ? b.nameMl : b.name}
                                      </h5>
                                      {(b.category === "BJP Member" || b.category === "BJP Members") && (
                                        <PartyFlagIcon className="h-3.5 w-5 rounded-[2px]" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                      <MapPin className="h-3 w-3 text-orange-500 shrink-0" />
                                      <span className="truncate">{b.location}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* User Category Badge */}
                                <span className="inline-flex items-center text-[9.5px] font-extrabold text-orange-700 dark:text-orange-300 bg-orange-500/10 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/60 px-2 py-0.5 rounded-md shrink-0">
                                  <span>{lang === "ml" ? (b.categoryMl || b.category) : b.category}</span>
                                </span>
                              </div>

                              <div className="pt-1.5 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
                                <div className="min-w-0">
                                  <span className="text-[9.5px] font-semibold text-muted-foreground block leading-tight">
                                    {lang === "ml" ? "പദ്ധതി:" : "Scheme:"}
                                  </span>
                                  <span className="font-bold text-foreground text-[11px] truncate block">
                                    {b.scheme}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <a
                                    href={`tel:${b.phone}`}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                                    title="Call Beneficiary"
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                  </a>
                                  <a
                                    href={`https://wa.me/${b.phone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                                    title="WhatsApp Beneficiary"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dedicated Subpage: Users List (users from applications) */}
                    {mobileSubPage === "users" && (
                      <div className="space-y-3 pt-0.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-border/80 pb-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#ff5500] hover:text-orange-600 cursor-pointer shrink-0"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "ഉപയോക്താക്കളുടെ പട്ടിക" : "Users List"}</span>
                          </button>

                          <span className="inline-flex items-center gap-1 rounded-full border border-orange-200/80 bg-orange-500/10 px-2 py-0.5 text-[10px] font-extrabold text-[#ff5500] dark:border-orange-800/60 dark:bg-orange-950/40 dark:text-orange-300 shrink-0">
                            <Users className="h-3 w-3" />
                            {filteredMobileApplicationUsers.length} {lang === "ml" ? "ഉപയോക്താക്കൾ" : "Users"}
                          </span>
                        </div>

                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            placeholder={lang === "ml" ? "പേര്, സ്ഥലം, ഫോൺ സെർച്ച് ചെയ്യുക..." : "Search name, location, phone..."}
                            className="w-full rounded-xl border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                          />
                        </div>

                        <p className="px-0.5 text-[10px] font-semibold text-muted-foreground">
                          {lang === "ml" ? "എല്ലാ അപേക്ഷകളിൽ നിന്നുമുള്ള ഉപയോക്താക്കൾ" : "Users from all applications"}
                        </p>

                        <div className="space-y-2">
                          {filteredMobileApplicationUsers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                setSelectedApplicationUserId(user.id);
                                setMobileSubPage("user_detail");
                              }}
                              className="flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3 text-left shadow-2xs transition-all hover:border-orange-300 dark:hover:border-orange-800 cursor-pointer"
                            >
                              <span className="flex min-w-0 items-center gap-2.5">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-black text-slate-900 dark:bg-slate-700 dark:text-white shadow-2xs">
                                  {getApplicantInitials(user.nameEn)}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-[12px] font-bold text-foreground">
                                    {lang === "ml" ? user.nameMl : user.nameEn}
                                  </span>
                                  <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <MapPin className="h-3 w-3 shrink-0 text-orange-500" />
                                    <span className="truncate">{lang === "ml" ? user.locationMl : user.locationEn}</span>
                                  </span>
                                </span>
                              </span>

                              <span className="flex shrink-0 items-center">
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              </span>
                            </button>
                          ))}

                          {filteredMobileApplicationUsers.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center dark:border-slate-800 dark:bg-slate-900">
                              <Users className="mx-auto mb-2 h-6 w-6 text-slate-300 dark:text-slate-600" />
                              <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                                {lang === "ml" ? "ഉപയോക്താക്കളെ കണ്ടെത്തിയില്ല." : "No users found."}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dedicated Subpage: User Details (applications of one user) */}
                    {mobileSubPage === "user_detail" && selectedApplicationUser && (
                      <div className="space-y-3 pt-0.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-border/80 pb-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("users")}
                            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#ff5500] hover:text-orange-600 cursor-pointer shrink-0"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "ഉപയോക്തൃ വിവരങ്ങൾ" : "User Details"}</span>
                          </button>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[13px] font-black text-slate-900 dark:bg-slate-700 dark:text-white shadow-2xs">
                                {getApplicantInitials(selectedApplicationUser.nameEn)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-[14px] font-extrabold text-foreground">
                                  {lang === "ml" ? selectedApplicationUser.nameMl : selectedApplicationUser.nameEn}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                                  <MapPin className="h-3 w-3 shrink-0 text-orange-500" />
                                  <span className="truncate">
                                    {lang === "ml" ? selectedApplicationUser.locationMl : selectedApplicationUser.locationEn}
                                  </span>
                                </p>
                                {selectedApplicationUser.phone && (
                                  <p className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                                    <Phone className="h-3 w-3 shrink-0 text-orange-500" />
                                    <span className="truncate">{selectedApplicationUser.phone}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const appToEdit = selectedApplicationUserApplications[0];
                                if (appToEdit) {
                                  handleEditApplicationDetails(appToEdit);
                                } else {
                                  handleAddAnotherApplicant();
                                  setCreateFullName(selectedApplicationUser.nameEn);
                                  const phoneDigits = selectedApplicationUser.phone.replace(/\D/g, "");
                                  setCreatePhone(
                                    phoneDigits.length === 12 && phoneDigits.startsWith("91")
                                      ? phoneDigits.slice(2)
                                      : phoneDigits,
                                  );
                                  setCreateFlowStep("form");
                                  setActiveTab("create");
                                  setMobileSubPage("none");
                                }
                              }}
                              className="inline-flex h-8 items-center gap-1 rounded-full border border-[#f1ddc7] bg-[#fff7ec] px-3 text-[11.5px] font-extrabold text-[#ff5500] transition-colors hover:border-orange-300 hover:bg-[#ffefdd] dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300 cursor-pointer shrink-0 shadow-2xs"
                              title={lang === "ml" ? "അപേക്ഷ തിരുത്തുക" : "Edit Application"}
                            >
                              <Pencil className="h-3 w-3 stroke-[2.5]" />
                              <span>{lang === "ml" ? "തിരുത്തുക" : "Edit"}</span>
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleAddAnotherApplicant();
                            setCreateFullName(selectedApplicationUser.nameEn);
                            const phoneDigits = selectedApplicationUser.phone.replace(/\D/g, "");
                            setCreatePhone(
                              phoneDigits.length === 12 && phoneDigits.startsWith("91")
                                ? phoneDigits.slice(2)
                                : phoneDigits,
                            );
                            setCreateFlowStep("eligible_schemes");
                          }}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#ff5500] px-3 py-2.5 text-[11.5px] font-extrabold text-white shadow-2xs transition-colors hover:bg-orange-600 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.6]" />
                          {lang === "ml" ? "പുതിയ അപേക്ഷ" : "Apply New"}
                        </button>

                        <div className="flex items-center justify-between gap-2 px-0.5">
                          <h4 className="text-[12px] font-extrabold text-foreground">
                            {lang === "ml" ? "എല്ലാ അപേക്ഷകളും" : "All Applications"}
                          </h4>
                          <span className="inline-flex h-[18px] min-w-[22px] items-center justify-center rounded-full border border-orange-200/80 bg-orange-500/10 px-1.5 text-[10px] font-extrabold text-[#ff5500] dark:border-orange-800/60 dark:bg-orange-950/40 dark:text-orange-300">
                            {selectedApplicationUserApplications.length}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {selectedApplicationUserApplications.map((application) =>
                            renderMobileApplicationListCard(application),
                          )}
                          {selectedApplicationUserApplications.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center dark:border-slate-800 dark:bg-slate-900">
                              <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                                {lang === "ml" ? "ഈ ഉപയോക്താവിന് അപേക്ഷകളില്ല." : "No applications found for this user."}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dedicated Subpage: Events & Announcements Page */}
                    {mobileSubPage === "events_announcements" && (
                      <div className="space-y-3 pt-0.5 animate-in fade-in duration-200">
                        {/* Top Bar: Back Button + Sub-Tabs directly on top */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer shrink-0"
                            title={lang === "ml" ? "തിരികെ പോവുക" : "Go back"}
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                          </button>

                          {/* Two Sub-Tabs: Events & Announcements */}
                          <div className="grid grid-cols-2 gap-1.5 p-1 flex-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs font-extrabold">
                            <button
                              type="button"
                              onClick={() => setEventsSubTab("events")}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                                eventsSubTab === "events"
                                  ? "bg-white dark:bg-slate-900 text-[#ff5500] dark:text-orange-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span>{lang === "ml" ? "പരിപാടികൾ" : "Events"}</span>
                              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                                eventsSubTab === "events"
                                  ? "bg-orange-100 text-[#ff5500] dark:bg-orange-950 dark:text-orange-300"
                                  : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                              }`}>
                                4
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEventsSubTab("announcements")}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                                eventsSubTab === "announcements"
                                  ? "bg-white dark:bg-slate-900 text-[#ff5500] dark:text-orange-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              <BellRing className="h-3.5 w-3.5" />
                              <span>{lang === "ml" ? "അറിയിപ്പുകൾ" : "Announcements"}</span>
                              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                                eventsSubTab === "announcements"
                                  ? "bg-orange-100 text-[#ff5500] dark:bg-orange-950 dark:text-orange-300"
                                  : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                              }`}>
                                4
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Tab Content List */}
                        <div className="space-y-3 pt-1">
                          {eventsSubTab === "events" ? (
                            /* Render Events List */
                            <div className="space-y-2.5">
                              {/* Event 1 */}
                              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-3 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-[#800f13] bg-red-50 dark:bg-red-950/80 border border-red-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {lang === "ml" ? "ബൂത്ത് സമ്മേളനം" : "BOOTH CONVENTION"}
                                    </span>
                                  </div>
                                  <h4 className="font-display text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    VIKASITA KERALAM SAMMELAN 2026
                                  </h4>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                    {lang === "ml" ? "സംസ്ഥാനതല മെഗാ ബൂത്ത് സമ്മേളനം" : "Statewide Mega Booth Worker Convention in TVM"}
                                  </p>
                                  <div className="pt-1">
                                    <span className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider">
                                      {lang === "ml" ? "രജിസ്റ്റർ ചെയ്യുക" : "REGISTER NOW"}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0 rounded-lg p-2 bg-[#800f13] text-white flex flex-col items-center justify-center min-w-[50px] text-center shadow-xs">
                                  <span className="text-[8px] font-black uppercase">OCT</span>
                                  <span className="text-base font-black leading-none my-0.5">15</span>
                                  <span className="text-[7px] font-bold opacity-90">2026</span>
                                </div>
                              </div>

                              {/* Event 2 */}
                              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-3 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-orange-700 bg-orange-50 dark:bg-orange-950/80 border border-orange-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {lang === "ml" ? "യുവമോർച്ച റാലി" : "YOUTH RALLY"}
                                    </span>
                                  </div>
                                  <h4 className="font-display text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    YUVA VIKAS YATRA & CONCLAVE
                                  </h4>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                    {lang === "ml" ? "തിരുവനന്തപുരത്ത് 50,000+ യുവ പ്രതിനിധികൾ" : "50,000+ Youth Leaders Gathering in TVM"}
                                  </p>
                                  <div className="pt-1">
                                    <span className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider">
                                      {lang === "ml" ? "പങ്കെടുക്കുക" : "JOIN YATRA"}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0 rounded-lg p-2 bg-[#ea580c] text-white flex flex-col items-center justify-center min-w-[50px] text-center shadow-xs">
                                  <span className="text-[8px] font-black uppercase">NOV</span>
                                  <span className="text-base font-black leading-none my-0.5">02</span>
                                  <span className="text-[7px] font-bold opacity-90">2026</span>
                                </div>
                              </div>

                              {/* Event 3 */}
                              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-3 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-teal-700 bg-teal-50 dark:bg-teal-950/80 border border-teal-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {lang === "ml" ? "ഗുണഭോക്തൃ സംഗമം" : "BENEFICIARY MEET"}
                                    </span>
                                  </div>
                                  <h4 className="font-display text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    CENTRAL SCHEMES EXPO
                                  </h4>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                    {lang === "ml" ? "കേന്ദ്ര മന്ത്രിമാരുമായുള്ള ഗുണഭോക്തൃ സംവാദം" : "Interactive Session with Union Ministers at Kochi"}
                                  </p>
                                  <div className="pt-1">
                                    <span className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider">
                                      {lang === "ml" ? "സന്ദർശിക്കുക" : "ATTEND EXPO"}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0 rounded-lg p-2 bg-[#0d9488] text-white flex flex-col items-center justify-center min-w-[50px] text-center shadow-xs">
                                  <span className="text-[8px] font-black uppercase">NOV</span>
                                  <span className="text-base font-black leading-none my-0.5">20</span>
                                  <span className="text-[7px] font-bold opacity-90">2026</span>
                                </div>
                              </div>

                              {/* Event 4 */}
                              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-3 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {lang === "ml" ? "മഹിളാ സമ്മേളനം" : "MAHILA SAMMELAN"}
                                    </span>
                                  </div>
                                  <h4 className="font-display text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    NARI SHAKTI VIKAS CONCLAVE
                                  </h4>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                    {lang === "ml" ? "വനിതാ സംരംഭകത്വ സംസ്ഥാന സമ്മേളനം" : "Empowering Women Entrepreneurs in Kozhikode"}
                                  </p>
                                  <div className="pt-1">
                                    <span className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider">
                                      {lang === "ml" ? "പാസ് നേടുക" : "GET PASS"}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0 rounded-lg p-2 bg-[#15803d] text-white flex flex-col items-center justify-center min-w-[50px] text-center shadow-xs">
                                  <span className="text-[8px] font-black uppercase">DEC</span>
                                  <span className="text-base font-black leading-none my-0.5">10</span>
                                  <span className="text-[7px] font-bold opacity-90">2026</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Render Announcements & Banners List */
                            <div className="space-y-2.5">
                              {/* Announcement Banner 1: PM Schemes */}
                              <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs h-[85px] w-full cursor-pointer group">
                                <img
                                  src="/images/pm_schemes_explore_now.png"
                                  alt="Explore PM Schemes - Viksit Bharat"
                                  className="h-full w-full object-fill group-hover:scale-102 transition-transform duration-300"
                                />
                              </div>

                              {/* Announcement Banner 2: Sabka Saath Sabka Vikas */}
                              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#800f13] via-[#a3161a] to-[#590a0d] text-white shadow-xs border border-red-900/50 p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-2 space-y-1">
                                  <span className="inline-block rounded-md bg-red-500 text-white px-2 py-0.2 text-[8px] font-black uppercase tracking-wider">
                                    {lang === "ml" ? "മോദിയുടെ ഗ്യാരണ്ടി" : "MODI'S GUARANTEE"}
                                  </span>
                                  <h4 className="font-display text-xs font-black text-white leading-tight">
                                    SABKA SAATH · SABKA VIKAS
                                  </h4>
                                  <p className="text-[10px] text-[#ffffff] font-semibold">
                                    {lang === "ml" ? "സബ്കാ സാഥ്, സബ്കാ വികാസ്, സബ്കാ വിശ്വാസ്" : "Sabka Vishwas · Sabka Prayaas (2047 Vision)"}
                                  </p>
                                </div>
                                <div className="shrink-0 h-10 w-10 rounded-full bg-red-950/70 border border-red-400/40 p-1 flex items-center justify-center shadow-xs">
                                  <img src={officialLotus} alt="Lotus" className="h-6 w-6 object-contain" />
                                </div>
                              </div>

                              {/* Announcement Banner 3: Direct Benefit Transfer */}
                              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#15803d] via-emerald-700 to-[#065f46] text-white shadow-xs border border-emerald-600/50 p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-2 space-y-1">
                                  <span className="inline-block rounded-md bg-amber-400 text-amber-950 px-2 py-0.2 text-[8px] font-black uppercase tracking-wider">
                                    {lang === "ml" ? "പി.എം കിസാൻ" : "PM KISAN SAMMAN"}
                                  </span>
                                  <h4 className="font-display text-xs font-black text-white leading-tight">
                                    DIRECT BENEFIT TRANSFER ₹6,000
                                  </h4>
                                  <p className="text-[10px] text-emerald-100/90">
                                    {lang === "ml" ? "കേരളത്തിലെ 35 ലക്ഷം കർഷകർക്ക് നേട്ടങ്ങൾ" : "Empowering 35 Lakh Farmers Across Kerala"}
                                  </p>
                                </div>
                                <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-950/70 border border-amber-300/40 p-1 flex items-center justify-center shadow-xs">
                                  <img src={officialLotus} alt="Lotus" className="h-6 w-6 object-contain" />
                                </div>
                              </div>

                              {/* Announcement Banner 4: Ayushman Bharat */}
                              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/90 dark:border-slate-800 p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-2 space-y-1">
                                  <span className="inline-block rounded-md bg-[#ff5500] text-white px-2 py-0.2 text-[8px] font-black uppercase tracking-wider">
                                    {lang === "ml" ? "ആയുഷ്മാൻ ഭാരത്" : "AYUSHMAN BHARAT"}
                                  </span>
                                  <h4 className="font-display text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    FREE HEALTH COVERAGE UP TO ₹5 LAKH
                                  </h4>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                    {lang === "ml" ? "സൗജന്യ സമഗ്ര കുടുംബ ആരോഗ്യ സുരക്ഷാ പദ്ധതി" : "Cashless Medical Treatment for All Families"}
                                  </p>
                                </div>
                                <div className="shrink-0 h-10 w-10 rounded-full bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 p-1 flex items-center justify-center shadow-xs">
                                  <img src={officialLotus} alt="Lotus" className="h-6 w-6 object-contain" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "schemes" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {mobileSubPage === "category_schemes" && selectedSchemeCategoryDetail ? (
                  /* Separate Category Schemes Page view */
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
                    {/* Back Header */}
                    <div className="flex items-center justify-between border-b border-border/80 pb-2 px-0.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileSubPage("none");
                            setSelectedSchemeCategoryDetail(null);
                          }}
                          className="p-1 rounded-lg bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
                          title={lang === "ml" ? "തിരികെ പോവുക" : "Go back"}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <h3 className="font-extrabold text-sm text-foreground">
                          {lang === "ml" ? "തിരികെ പദ്ധതികളിലേക്ക്" : "Back to Schemes"}
                        </h3>
                      </div>
                      <span className="text-[10px] font-extrabold text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-950/70 border border-orange-200/80 dark:border-orange-900/60 px-2.5 py-0.5 rounded-full">
                        {selectedSchemeCategoryDetail.count} {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                      </span>
                    </div>

                    {/* Category Title Header */}
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-purple-500/10 border border-orange-200/60 dark:border-orange-900/40">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800">
                        {lang === "ml" ? selectedSchemeCategoryDetail.categoryLabelMl : selectedSchemeCategoryDetail.categoryLabelEn}
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#0a0f1d] dark:text-white leading-tight mt-1.5">
                        {lang === "ml" ? selectedSchemeCategoryDetail.titleMl : selectedSchemeCategoryDetail.titleEn}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {lang === "ml" ? "ലഭ്യമായ പദ്ധതികളും അപേക്ഷ പ്രക്രിയകളും ചുവടെ കാണുക" : "Browse available schemes, eligibility criteria, and instant application options below."}
                      </p>
                    </div>

                    {/* Scheme Cards for Category - Central Government schemes only */}
                    <div className="space-y-3 pt-1">
                      {getMobileCentralSchemeCards(selectedSchemeCategoryDetail.id).map((scheme) => (
                        <div
                          key={scheme.titleEn}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <span className="text-[9px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 rounded-md">
                              {lang === "ml" ? "കേന്ദ്ര സർക്കാർ" : "Central Government"}
                            </span>
                            <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {lang === "ml" ? "അപേക്ഷിക്കാം" : "Accepting Applications"}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-snug">
                            {lang === "ml" ? scheme.titleMl : scheme.titleEn}
                          </h5>

                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            {lang === "ml" ? scheme.deptMl : scheme.deptEn}
                          </p>

                          <div className="mt-2.5 p-2 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/30 text-[11px]">
                            <div className="font-extrabold text-orange-800 dark:text-orange-300">
                              {lang === "ml" ? "ആനുകൂല്യം:" : "Financial Benefit:"}
                              <span className="font-medium text-slate-700 dark:text-slate-300 ml-1">
                                {lang === "ml" ? scheme.benefitMl : scheme.benefitEn}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                              <span className="font-bold text-slate-600 dark:text-slate-300">{lang === "ml" ? "യോഗ്യത:" : "Eligibility:"} </span>
                              {lang === "ml" ? scheme.eligibilityMl : scheme.eligibilityEn}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {lang === "ml" ? "ഓൺലൈനായി അപേക്ഷിക്കാം" : "Online Application Enabled"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSchemeName(scheme.titleEn);
                                setActiveTab("create");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                            >
                              <span>{lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}</span>
                              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Main Schemes Overview: Search + Categories 2-Row Grid + Popular Schemes */
                  <div className="space-y-3">
                    {/* Single Row Search & Filter */}
                    <div className="pb-0.5">
                      <div className="flex items-center gap-2">
                        {/* Scheme Search Input */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            value={schemeSearchQuery}
                            onChange={(e) => setSchemeSearchQuery(e.target.value)}
                            placeholder={lang === "ml" ? "പദ്ധതികൾ തിരയുക..." : "Search schemes..."}
                            className="w-full h-8 pl-8 pr-7 text-xs font-semibold rounded-full border border-amber-200/80 dark:border-slate-800 bg-[#fffcfa] dark:bg-slate-900 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                          />
                          {schemeSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setSchemeSearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Filter Button */}
                        <button
                          type="button"
                          onClick={() => setShowFilterMenu(!showFilterMenu)}
                          className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer shrink-0 ${
                            showFilterMenu
                              ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30 shadow-xs"
                              : "border-amber-200/80 dark:border-slate-800 bg-[#fffcf0] dark:bg-slate-900 text-[#ff5500] dark:text-slate-200 hover:bg-amber-100/50"
                          }`}
                          title="Toggle Filters"
                        >
                          <Filter className={`h-4 w-4 stroke-[2.2] shrink-0 ${showFilterMenu ? "text-white" : "text-[#ff5500]"}`} />
                        </button>
                      </div>
                    </div>

                    {/* 2-Row Scheme Categories Section */}
                    <div className="pt-1 pb-1">
                      <div className="flex items-center justify-between mb-1.5 px-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                            <LayoutGrid className="h-3.5 w-3.5 stroke-[2.2]" />
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                            {lang === "ml" ? "വിഭാഗങ്ങൾ" : "Categories"}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchemeCategoryDetail({
                              id: "all",
                              count: 128,
                              categoryLabelEn: "All Categories",
                              categoryLabelMl: "എല്ലാ വിഭാഗങ്ങളും",
                              titleEn: "All Central Government Schemes",
                              titleMl: "എല്ലാ കേന്ദ്ര സർക്കാർ ക്ഷേമപദ്ധതികൾ",
                            });
                            setSchemeCategoryFilter("all");
                            setMobileSubPage("category_schemes");
                          }}
                          className="inline-flex items-center gap-0.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-x-1 gap-y-2.5 pb-1 pt-0.5 px-0.5">
                        {schemeCategories2Row.map((cat) => {
                          const isSelected = selectedSchemeCategoryDetail?.id === cat.detail.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSelectedSchemeCategoryDetail(cat.detail);
                                setSchemeCategoryFilter(cat.id);
                                setMobileSubPage("category_schemes");
                              }}
                              className={`flex flex-col items-center text-center p-0.5 cursor-pointer transition-all duration-150 group rounded-xl ${
                                isSelected
                                  ? "scale-105"
                                  : "hover:scale-105"
                              }`}
                            >
                              <div className={`relative h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center p-0.5 rounded-xl mb-1 transition-all ${
                                isSelected
                                  ? "bg-orange-100/90 dark:bg-orange-950/70 ring-2 ring-orange-500 shadow-xs"
                                  : "bg-slate-50/80 dark:bg-slate-800/40 group-hover:bg-amber-50 dark:group-hover:bg-slate-800"
                              }`}>
                                <img
                                  src={cat.icon}
                                  alt={cat.labelEn}
                                  className="h-9 w-9 sm:h-10 sm:w-10 object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-110"
                                />
                              </div>
                              <span className={`text-[10px] sm:text-[10.5px] font-extrabold leading-[1.15] block whitespace-pre-line text-center max-w-[76px] ${
                                isSelected
                                  ? "text-orange-600 dark:text-orange-400"
                                  : "text-slate-800 dark:text-slate-100"
                              }`}>
                                {lang === "ml" ? cat.labelMl : cat.labelEn}
                              </span>
                              <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 block text-center">
                                {lang === "ml" ? cat.schemesCountMl : cat.schemesCount}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Pagination Dots */}
                      <div className="flex items-center justify-center gap-1.5 mt-1.5 pb-0.5">
                        <span className="h-2 w-2 rounded-full bg-[#ff5500] transition-all" />
                        <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700 transition-all" />
                      </div>
                    </div>

                    {/* Popular Schemes - Official Logos Single Horizontal Scroll Row (4 visible at a time) */}
                    <div className="pt-2 pb-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                            <Sparkles className="h-3.5 w-3.5 stroke-[2.2]" />
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                            {lang === "ml" ? "ജനപ്രിയ പദ്ധതികൾ" : "Popular Schemes"}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchemeCategoryDetail({
                              id: "all",
                              count: 128,
                              categoryLabelEn: "All Categories",
                              categoryLabelMl: "എല്ലാ വിഭാഗങ്ങളും",
                              titleEn: "All Central Government Schemes",
                              titleMl: "എല്ലാ കേന്ദ്ര സർക്കാർ ക്ഷേമപദ്ധതികൾ",
                            });
                            setSchemeCategoryFilter("all");
                            setMobileSubPage("category_schemes");
                          }}
                          className="inline-flex items-center gap-0.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex overflow-x-auto gap-2.5 pb-1 pt-0.5 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
                        {popularSchemesList.map((item) => {
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                const foundCat = schemeCategories2Row.find(c => c.id === item.categoryId || c.detail.id === item.categoryId);
                                if (foundCat) {
                                  setSelectedSchemeCategoryDetail(foundCat.detail);
                                  setSchemeCategoryFilter(foundCat.id);
                                } else {
                                  setSelectedSchemeCategoryDetail({
                                    id: item.id,
                                    count: 18,
                                    categoryLabelEn: item.nameEn,
                                    categoryLabelMl: item.nameMl,
                                    titleEn: item.nameEn,
                                    titleMl: item.nameMl,
                                  });
                                  setSchemeCategoryFilter("all");
                                }
                                setMobileSubPage("category_schemes");
                              }}
                              className="snap-start shrink-0 w-[calc(25%-7.5px)] min-w-[72px] flex flex-col items-center text-center p-0.5 group cursor-pointer transition-all duration-200 hover:scale-105"
                            >
                              <div className="relative h-13 w-13 sm:h-14 sm:w-14 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-700/80 shadow-2xs group-hover:border-orange-500 dark:group-hover:border-orange-400 group-hover:shadow-xs flex items-center justify-center p-1.5 transition-all overflow-hidden">
                                <img
                                  src={item.logo}
                                  alt={item.nameEn}
                                  className="h-full w-full object-contain rounded-full transition-transform duration-200 group-hover:scale-110"
                                />
                              </div>
                              <span className="text-[10px] sm:text-[10.5px] font-extrabold leading-tight text-slate-800 dark:text-slate-100 mt-1.5 block text-center max-w-[72px] line-clamp-2">
                                {lang === "ml" ? item.nameMl : item.nameEn}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scheme List Below Popular Schemes */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                      {/* Scheme Card 1: Central Govt */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <span className="text-[9px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 rounded-md">
                            {lang === "ml" ? "കേന്ദ്ര സർക്കാർ" : "Central Government"}
                          </span>
                          <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {lang === "ml" ? "അപേക്ഷിക്കാം" : "Accepting Applications"}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-snug">
                          {lang === "ml" ? "പി.എം. കിസാൻ സമ്മാൻ നിധി" : "PM Kisan Samman Nidhi"}
                        </h5>

                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          {lang === "ml" ? "കൃഷി വികസന കർഷകക്ഷേമ മന്ത്രാലയം, ഭാരത സർക്കാർ" : "Ministry of Agriculture & Farmers Welfare, Govt of India"}
                        </p>

                        <div className="mt-2.5 p-2 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/30 text-[11px]">
                          <div className="font-extrabold text-orange-800 dark:text-orange-300">
                            {lang === "ml" ? "സാമ്പത്തിക ആനുകൂല്യം:" : "Financial Benefit:"}
                            <span className="font-medium text-slate-700 dark:text-slate-300 ml-1">
                              {lang === "ml" ? "പ്രതിവർഷം ₹6,000 ബാങ്ക് അക്കൗണ്ടിലേക്ക് (3 ഗഡുക്കളായി)" : "₹6,000 / year direct bank transfer (3 installments)"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            <span className="font-bold text-slate-600 dark:text-slate-300">{lang === "ml" ? "യോഗ്യത:" : "Eligibility:"} </span>
                            {lang === "ml" ? "കൃഷിഭൂമിയുള്ള ചെറുകിട-നാമമാത്ര കർഷകർ" : "Small & marginal farmers holding cultivable land"}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {lang === "ml" ? "ഓൺലൈൻ അപേക്ഷ ലഭ്യമാണ്" : "Online Application Enabled"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSchemeName("PM Kisan Samman Nidhi");
                              setActiveTab("create");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                          >
                            <span>{lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}</span>
                            <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>

                      {/* Scheme Card 2: Central Govt */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <span className="text-[9px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 rounded-md">
                            {lang === "ml" ? "കേന്ദ്ര സർക്കാർ" : "Central Government"}
                          </span>
                          <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {lang === "ml" ? "അപേക്ഷിക്കാം" : "Accepting Applications"}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-snug">
                          {lang === "ml" ? "ആയുഷ്മാൻ ഭാരത് - പിഎം-ജയ് ആരോഗ്യ പരിരക്ഷ" : "Ayushman Bharat - PM-JAY Health Protection"}
                        </h5>

                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          {lang === "ml" ? "ദേശീയ ആരോഗ്യ അതോറിറ്റി, ഭാരത സർക്കാർ" : "National Health Authority, Govt of India"}
                        </p>

                        <div className="mt-2.5 p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 text-[11px]">
                          <div className="font-extrabold text-purple-800 dark:text-purple-300">
                            {lang === "ml" ? "സാമ്പത്തിക ആനുകൂല്യം:" : "Financial Benefit:"}
                            <span className="font-medium text-slate-700 dark:text-slate-300 ml-1">
                              {lang === "ml" ? "കുടുംബത്തിന് പ്രതിവർഷം ₹5,00,000 ക്യാഷ്‌ലെസ് ചികിത്സാ പരിരക്ഷ" : "₹5,00,000 / family / year cashless hospital cover"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            <span className="font-bold text-slate-600 dark:text-slate-300">{lang === "ml" ? "യോഗ്യത:" : "Eligibility:"} </span>
                            {lang === "ml" ? "താഴ്ന്ന വരുമാന & SECC മുൻഗണനാ കുടുംബങ്ങൾ" : "Low-income & SECC priority household members"}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {lang === "ml" ? "ഓൺലൈനായി അപേക്ഷിക്കാം" : "Online Application Enabled"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSchemeName("Ayushman Bharat - PM-JAY Health Protection");
                              setActiveTab("create");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                          >
                            <span>{lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}</span>
                            <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "applications" && (
              mobileSubPage === "app_detail" ? (
                renderAppDetailSubpage()
              ) : (
                <div className="space-y-2 animate-in fade-in duration-200">
                {/* Applications Header with Period Selector & Filter Pill */}
                <div className="flex items-center justify-between border-b border-border/80 pb-2 gap-1">
                  {/* Left Side: Formatted Period Display replacing 'Applications' title */}
                  <span className="font-extrabold text-[#0a0f1d] dark:text-white text-xs sm:text-sm tracking-tight truncate">
                    {getFormattedPeriodDisplay()}
                  </span>

                  {/* Period Selector & Filter Action in Header */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex items-center justify-between rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs hover:border-slate-300 transition-all min-h-[28px] max-w-[150px] sm:max-w-[180px]">
                      <div className="flex items-center gap-0.5 min-w-0 flex-1 justify-center">
                        <button
                          type="button"
                          onClick={() => handleStepPeriod(-1)}
                          className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                          title="Previous Period"
                        >
                          <ChevronLeft className="h-3 w-3 stroke-[2.4]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen(true)}
                          className="text-[9.5px] sm:text-[10px] font-extrabold text-[#0a0f1d] dark:text-slate-100 hover:text-[#ff5500] transition-colors cursor-pointer px-0.5 tracking-tight truncate"
                          title="Click to Open Date Picker"
                        >
                          {getFormattedPeriodDisplay()}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStepPeriod(1)}
                          className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                          title="Next Period"
                        >
                          <ChevronRight className="h-3 w-3 stroke-[2.4]" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(true)}
                        className="p-0.5 rounded-full text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-800 pl-1 ml-0.5 shrink-0"
                        title="Open Date Picker"
                      >
                        <Calendar className="h-3 w-3 stroke-[2.2]" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer shrink-0 ${
                        showFilterMenu
                          ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30 shadow-xs"
                          : "border-amber-200/60 dark:border-slate-800 bg-[#fffcf0] dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 hover:bg-amber-100/50"
                      }`}
                      title="Toggle Filters"
                    >
                      <Filter className={`h-3.5 w-3.5 stroke-[2.2] shrink-0 ${showFilterMenu ? "text-white" : "text-[#ff5500]"}`} />
                    </button>
                  </div>
                </div>

                {/* Search Input & Status Selection Dropdown Pill */}
                <div className="flex items-center gap-2">
                  {/* Application Search Input */}
                  <div className="relative min-w-0 flex-[7]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={applicationSearchQuery}
                      onChange={(e) => setApplicationSearchQuery(e.target.value)}
                      placeholder={lang === "ml" ? "അപേക്ഷകൾ തിരയുക" : "Search applications"}
                      className="w-full h-7 pl-7 pr-6 text-[11px] font-semibold rounded-full border border-amber-200/80 dark:border-slate-800 bg-[#fffcfa] dark:bg-slate-900 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                    />
                    {applicationSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setApplicationSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status Selection Dropdown Pill */}
                  <div className="relative min-w-0 flex-[3]">
                    <select
                      value={applicationStatusFilter}
                      onChange={(e) => setApplicationStatusFilter(e.target.value as MobileApplicationStatusFilter)}
                      className="h-7 w-full min-w-0 pl-2.5 pr-6 text-[9.5px] font-bold rounded-full border border-amber-200/80 dark:border-orange-800/80 bg-[#fffcf0] dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs cursor-pointer appearance-none"
                    >
                      <option value="all">{lang === "ml" ? "എല്ലാ അപേക്ഷകളും" : "All Applications"}</option>
                      <option value="application_received">{lang === "ml" ? "ലഭിച്ച അപേക്ഷകൾ" : "Application Received"}</option>
                      <option value="document_verification_completed">{lang === "ml" ? "രേഖാ പരിശോധന പൂർത്തിയായി" : "Document Verification Completed"}</option>
                      <option value="applied">{lang === "ml" ? "അപേക്ഷിച്ചു" : "Applied"}</option>
                      <option value="review">{lang === "ml" ? "പരിശോധനയിൽ" : "Review"}</option>
                      <option value="beneficiary">{lang === "ml" ? "ഗുണഭോക്താവ്" : "Beneficiary"}</option>
                      <option value="rejected">{lang === "ml" ? "നിരസിച്ചവ" : "Rejected"}</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#0a0f1d] dark:text-slate-300 pointer-events-none" />
                  </div>
                </div>

                {/* Application intake KPIs */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setApplicationStatusFilter("document_verification_completed")}
                    className={`flex min-h-[64px] items-center justify-between gap-2 rounded-xl border p-2.5 text-left shadow-2xs transition-all cursor-pointer ${
                      applicationStatusFilter === "document_verification_completed"
                        ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                        : "border-border bg-card hover:border-emerald-200"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold leading-tight text-muted-foreground">
                        {lang === "ml" ? "അപേക്ഷിക്കാൻ തയ്യാർ" : "Ready to Apply"}
                      </span>
                      <span className="mt-1 block font-display text-base font-bold leading-none text-foreground">
                        {mobileApplicationRecordsByStatus.document_verification_completed.length.toLocaleString()}
                      </span>
                    </span>
                    <img src={readyToSubmit3dIcon} alt="Ready to Apply" className="h-9 w-9 shrink-0 object-contain" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplicationStatusFilter("application_received")}
                    className={`flex min-h-[64px] items-center justify-between gap-2 rounded-xl border p-2.5 text-left shadow-2xs transition-all cursor-pointer ${
                      applicationStatusFilter === "application_received"
                        ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30"
                        : "border-border bg-card hover:border-orange-200"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold leading-tight text-muted-foreground">
                        {lang === "ml" ? "രേഖകൾ ബാക്കി" : "Document Pending"}
                      </span>
                      <span className="mt-1 block font-display text-base font-bold leading-none text-foreground">
                        {mobileApplicationRecordsByStatus.application_received.length.toLocaleString()}
                      </span>
                    </span>
                    <img src={documentsPending3dIcon} alt="Document Pending" className="h-9 w-9 shrink-0 object-contain" />
                  </button>
                </div>

                {/* SLA Breaches Banner */}
                {/* Removed per user request */}

                {/* List of Applications */}
                <div className="space-y-2">
                  {displayedMobileApplicationRecords.map(renderMobileApplicationListCard)}
                  {displayedMobileApplicationRecords.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                        {lang === "ml" ? "അപേക്ഷകൾ കണ്ടെത്തിയില്ല." : "No applications found."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

            {(activeTab as string) === "users" && (
              <MobileUsersListTab
                periodText={getFormattedPeriodDisplay()}
                onOpenDatePicker={() => setIsDatePickerOpen(true)}
                onStepPeriod={handleStepPeriod}
              />
            )}

            {(activeTab === "create" || activeTab === "helpdesk") && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className={`flex items-center justify-between border-b border-border/80 ${createFlowStep === "selected_schemes" ? "-mx-4 px-4 pb-1.5" : "px-0.5 pb-2"}`}>
                  <div className={`flex items-center ${createFlowStep === "selected_schemes" ? "gap-1.5" : "gap-2"}`}>
                    {activeTab === "create" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (createFlowStep === "scheme_details") {
                            if (schemeDetailsReturnStep === "app_detail") {
                              setActiveTab("applications");
                              setMobileSubPage("app_detail");
                            } else {
                              setCreateFlowStep(schemeDetailsReturnStep);
                            }
                          } else if (createFlowStep === "eligibility_result") {
                            setCreateFlowStep("form");
                          } else if (createFlowStep === "eligible_schemes") {
                            setCreateFlowStep("form");
                          } else if (createFlowStep === "checking") {
                            setIsCheckingEligibility(false);
                            setCreateFlowStep("form");
                          } else if (createFlowStep === "selected_schemes") {
                            setCreateFlowStep("eligible_schemes");
                          } else if (createFlowStep === "applicant_applications") {
                            setCreateFlowStep(currentApplicantApplications.length > 1 ? "selected_schemes" : "eligible_schemes");
                          } else if (createFlowStep === "collection_saved" || createFlowStep === "follow_up_scheduled") {
                            setCreateFlowStep("applicant_applications");
                          } else if (createFlowStep === "collection_record") {
                            if (collectionRecordReturnStep === "needs_attention") {
                              setActiveTab("overview");
                              setMobileSubPage("needs_attention");
                              setCreateFlowStep("form");
                            } else {
                              setCreateFlowStep(collectionRecordReturnStep);
                            }
                          } else if (editingApplicationRef) {
                            setActiveTab("applications");
                            setMobileSubPage("app_detail");
                            setAppDetailView("overview");
                            setEditingApplicationRef("");
                          } else if (selectedSchemeName) {
                            setActiveTab("schemes");
                            setSelectedSchemeName("");
                          } else {
                            setActiveTab("overview");
                            setMobileSubPage("none");
                          }
                        }}
                        className={`flex cursor-pointer items-center justify-center rounded-full transition-colors ${
                          createFlowStep === "selected_schemes"
                            ? "h-7 w-7 bg-[#FFF7EC] text-[#1b255a] hover:bg-orange-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                            : "p-1 bg-muted/60 text-foreground hover:bg-muted"
                        }`}
                        title={lang === "ml" ? "തിരികെ പോവുക" : "Go back"}
                      >
                        <ArrowLeft className={`${createFlowStep === "selected_schemes" ? "h-3.5 w-3.5" : "h-4 w-4"} stroke-[2.5]`} />
                      </button>
                    )}
                    <h3 className={`font-extrabold text-foreground ${createFlowStep === "selected_schemes" ? "text-[14px] tracking-tight" : "text-sm"}`}>
                      {activeTab === "create" ? (
                        createFlowStep === "form" && editingApplicationRef
                          ? (lang === "ml" ? "അപേക്ഷ തിരുത്തുക" : "Edit Application")
                          : createFlowStep === "eligibility_result"
                          ? (lang === "ml" ? "അർഹതാ ഫലം" : "Eligibility Result")
                          : createFlowStep === "checking"
                          ? (lang === "ml" ? "യോഗ്യത പരിശോധിക്കുന്നു..." : "Checking eligibility...")
                          : createFlowStep === "eligible_schemes"
                          ? (lang === "ml" ? "യോഗ്യതയുള്ള പദ്ധതികൾ" : "Eligible Schemes")
                          : createFlowStep === "selected_schemes"
                          ? `${lang === "ml" ? "തിരഞ്ഞെടുത്ത പദ്ധതികൾ" : "Selected Schemes"} (${String(currentApplicantApplications.length).padStart(2, "0")})`
                          : createFlowStep === "scheme_details"
                          ? (lang === "ml" ? "അവസാന വിവരങ്ങൾ" : "Final Details")
                          : createFlowStep === "collection_saved"
                          ? (lang === "ml" ? "വിവരങ്ങൾ സേവ് ചെയ്തു" : "Details Saved")
                          : createFlowStep === "follow_up_scheduled"
                          ? (lang === "ml" ? "തുടർനടപടി ഷെഡ്യൂൾ ചെയ്തു" : "Follow-up Scheduled")
                          : createFlowStep === "collection_record"
                          ? (lang === "ml" ? "ശേഖരണ രേഖ" : "Collection Record")
                          : createFlowStep === "applicant_applications"
                          ? (lang === "ml" ? "അപേക്ഷകന്റെ അപേക്ഷകൾ" : "Applicant Applications")
                          : selectedSchemeName
                          ? `${selectedSchemeName} - ${lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}`
                          : (lang === "ml" ? "പുതിയ അപേക്ഷ സമർപ്പിക്കുക" : "Create New Application")
                      ) : (
                        lang === "ml" ? "സ്കീം ഹെൽപ്പ്ഡെസ്ക്" : "Scheme Helpdesk"
                      )}
                    </h3>
                  </div>
                  {activeTab !== "create" ? (
                    <span className="text-[10.5px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full">
                      Helpdesk
                    </span>
                  ) : createFlowStep === "scheme_details" && currentApplicantApplications.length > 1 ? (
                    <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-wider text-orange-700 dark:text-orange-300">
                      {lang === "ml"
                        ? `പദ്ധതി ${activeSchemePosition} / ${currentApplicantApplications.length}`
                        : `Scheme ${activeSchemePosition} of ${currentApplicantApplications.length}`}
                    </span>
                  ) : null}
                </div>

                {activeTab === "create" ? (
                  <>
                    {/* Step 1: Form Inputs View */}
                    {createFlowStep === "form" && (
                      <div className="space-y-3.5 bg-card p-3.5 rounded-2xl border border-border shadow-2xs">
                        {/* 1. Full Name */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "പൂർണ്ണമായ പേര് *" : "Full Name *"}
                          </label>
                          <input 
                            type="text" 
                            value={createFullName}
                            onChange={(e) => setCreateFullName(e.target.value)}
                            placeholder={lang === "ml" ? "ഉദാ: സോമൻ പി" : "Enter Full Name"}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 2. Aadhaar Number */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ആധാർ നമ്പർ *" : "Aadhaar Number *"}
                          </label>
                          <input 
                            type="text"
                            maxLength={12}
                            value={createAadhaar}
                            onChange={(e) => setCreateAadhaar(e.target.value.replace(/\D/g, ''))}
                            placeholder="12-digit Aadhaar number"
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 3. Mobile Number with Country Code */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "മൊബൈൽ നമ്പർ *" : "Mobile Number *"}
                          </label>
                          <div className="flex gap-1.5">
                            <select
                              value={createCountryCode}
                              onChange={(e) => setCreateCountryCode(e.target.value)}
                              className="text-xs font-semibold p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none shrink-0 text-foreground"
                            >
                              <option value="+91">🇮🇳 +91</option>
                              <option value="+1">🇺🇸 +1</option>
                              <option value="+971">🇦🇪 +971</option>
                              <option value="+44">🇬🇧 +44</option>
                            </select>
                            <input 
                              type="tel"
                              maxLength={10}
                              value={createPhone}
                              onChange={(e) => setCreatePhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="10-digit phone number"
                              className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                            />
                          </div>
                        </div>

                        {/* 4. Email (Optional) */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ഇമെയിൽ (ഓപ്ഷണൽ)" : "Email (Optional)"}
                          </label>
                          <input 
                            type="email" 
                            value={createEmail}
                            onChange={(e) => setCreateEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 5. Date of Birth */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ജനന തീയതി *" : "Date of Birth *"}
                          </label>
                          <input 
                            type="date" 
                            value={createDob}
                            onChange={(e) => setCreateDob(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 6. Gender */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ലിംഗഭേദം *" : "Gender *"}
                          </label>
                          <select 
                            value={createGender}
                            onChange={(e) => setCreateGender(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- ലിംഗഭേദം തിരഞ്ഞെടുക്കുക --" : "-- Select Gender --"}</option>
                            <option value="Male">{lang === "ml" ? "പുരുഷൻ" : "Male"}</option>
                            <option value="Female">{lang === "ml" ? "സ്ത്രീ" : "Female"}</option>
                            <option value="Transgender / Other">{lang === "ml" ? "ട്രാൻസ്‌ജെൻഡർ / മറ്റുള്ളവ" : "Transgender / Other"}</option>
                          </select>
                        </div>

                        {/* 7. Religion */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "മതം *" : "Religion *"}
                          </label>
                          <select 
                            value={createReligion}
                            onChange={(e) => setCreateReligion(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- മതം തിരഞ്ഞെടുക്കുക --" : "-- Select Religion --"}</option>
                            <option value="Hinduism">Hinduism</option>
                            <option value="Islam">Islam</option>
                            <option value="Christianity">Christianity</option>
                            <option value="Sikhism">Sikhism</option>
                            <option value="Buddhism">Buddhism</option>
                            <option value="Jainism">Jainism</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        {/* 8. Caste */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ജാതി / വിഭാഗം *" : "Caste *"}
                          </label>
                          <select 
                            value={createCaste}
                            onChange={(e) => setCreateCaste(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- വിഭാഗം തിരഞ്ഞെടുക്കുക --" : "-- Select Caste --"}</option>
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="OBC-NCL">OBC-NCL</option>
                            <option value="EWS">EWS</option>
                          </select>
                        </div>

                        {/* 9. Marital Status */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "വൈവാഹിക അവസ്ഥ *" : "Marital Status *"}
                          </label>
                          <select 
                            value={createMaritalStatus}
                            onChange={(e) => setCreateMaritalStatus(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- വൈവാഹിക അവസ്ഥ --" : "-- Select Marital Status --"}</option>
                            <option value="Single / Unmarried">{lang === "ml" ? "അവിവാഹിതൻ / അവിവാഹിത" : "Single / Unmarried"}</option>
                            <option value="Married">{lang === "ml" ? "വിവാഹിതൻ / വിവാഹിത" : "Married"}</option>
                            <option value="Widowed">{lang === "ml" ? "വിധവ / വിധവൻ" : "Widowed"}</option>
                            <option value="Divorcee">{lang === "ml" ? "വിവാഹബന്ധം വേർപെടുത്തിയ വ്യക്തി" : "Divorcee"}</option>
                            <option value="Separated">{lang === "ml" ? "വേർപിരിഞ്ഞു കഴിയുന്ന വ്യക്തി" : "Separated"}</option>
                          </select>
                        </div>

                        {/* 10. Occupation */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "തൊഴിൽ *" : "Occupation *"}
                          </label>
                          <select 
                            value={createOccupation}
                            onChange={(e) => setCreateOccupation(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- തൊഴിൽ തിരഞ്ഞെടുക്കുക --" : "-- Select Occupation --"}</option>
                            <option value="Farmer / Agriculture">{lang === "ml" ? "കർഷകൻ / കൃഷി" : "Farmer / Agriculture"}</option>
                            <option value="Daily Wage Worker">{lang === "ml" ? "ദിനബത്ത തൊഴിലാളി" : "Daily Wage Worker"}</option>
                            <option value="Salaried (Private)">{lang === "ml" ? "സ്വകാര്യ മേഖല ഉദ്യോഗസ്ഥൻ" : "Salaried (Private)"}</option>
                            <option value="Salaried (Government)">{lang === "ml" ? "സർക്കാർ ഉദ്യോഗസ്ഥൻ" : "Salaried (Government)"}</option>
                            <option value="Self-Employed / Business">{lang === "ml" ? "സ്വയംതൊഴിൽ / ബിസിനസ്സ്" : "Self-Employed / Business"}</option>
                            <option value="Homemaker">{lang === "ml" ? "ഗൃഹനാഥ / വീട്ടമ്മ" : "Homemaker"}</option>
                            <option value="Student">{lang === "ml" ? "വിദ്യാർത്ഥി" : "Student"}</option>
                            <option value="Unemployed">{lang === "ml" ? "തൊഴിൽ രഹിതൻ" : "Unemployed"}</option>
                            <option value="Retired">{lang === "ml" ? "വിരമിച്ച വ്യക്തി" : "Retired"}</option>
                            <option value="Other">{lang === "ml" ? "മറ്റുള്ളവ" : "Other"}</option>
                          </select>
                        </div>

                        {/* 11. Income Range */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "വാർഷിക വരുമാന പരിധി *" : "Income Range *"}
                          </label>
                          <select 
                            value={createIncomeRange}
                            onChange={(e) => setCreateIncomeRange(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- വരുമാന പരിധി --" : "-- Select Income Range --"}</option>
                            <option value="Below ₹50,000">Below ₹50,000</option>
                            <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                            <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                            <option value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</option>
                            <option value="Above ₹5,00,000">Above ₹5,00,000</option>
                          </select>
                        </div>

                        {/* 1. District */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ജില്ല *" : "District *"}
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAddressSheet("district");
                              setAddressSheetSearch("");
                            }}
                            className="w-full text-xs p-3 rounded-xl border border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-800/60 focus:ring-1 focus:ring-orange-500 outline-none text-foreground flex items-center justify-between transition-colors cursor-pointer text-left"
                          >
                            <span className={createDistrict ? "font-bold" : "text-muted-foreground"}>
                              {createDistrict
                                ? (lang === "ml" ? getDistrictName(createDistrict, "ml") : createDistrict)
                                : (lang === "ml" ? "-- ജില്ല തിരഞ്ഞെടുക്കുക --" : "-- Select District --")}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        </div>

                        {/* 2. Local Body Type */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "തദ്ദേശ സ്വയംഭരണ തരം *" : "Local Body Type *"}
                          </label>
                          <select
                            value={createLocalBodyType}
                            onChange={(e) => handleLocalBodyTypeSelect(e.target.value as LocalBodyType)}
                            className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground cursor-pointer font-medium"
                          >
                            <option value="">{lang === "ml" ? "-- തരം തിരഞ്ഞെടുക്കുക --" : "-- Select Local Body Type --"}</option>
                            <option value="panchayat">{lang === "ml" ? "ഗ്രാമ പഞ്ചായത്ത് (Grama Panchayat)" : "Grama Panchayat"}</option>
                            <option value="municipality">{lang === "ml" ? "മുനിസിപ്പാലിറ്റി (Municipality)" : "Municipality"}</option>
                            <option value="corporation">{lang === "ml" ? "കോർപ്പറേഷൻ (Corporation)" : "Corporation"}</option>
                          </select>
                        </div>

                        {/* 3. Local Body */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "തദ്ദേശ സ്വയംഭരണ സ്ഥാപനം *" : "Local Body *"}
                          </label>
                          <button
                            type="button"
                            disabled={!createDistrict || !createLocalBodyType}
                            onClick={() => {
                              if (createDistrict && createLocalBodyType) {
                                setActiveAddressSheet("localBody");
                                setAddressSheetSearch("");
                              }
                            }}
                            className={`w-full text-xs p-3 rounded-xl border outline-none flex items-center justify-between transition-colors text-left ${
                              !createDistrict || !createLocalBodyType
                                ? "bg-muted/50 border-border text-muted-foreground cursor-not-allowed opacity-70"
                                : "bg-background hover:bg-slate-50 dark:hover:bg-slate-800/60 border-border text-foreground cursor-pointer"
                            }`}
                          >
                            <span className={createLocalBody ? "font-bold" : "text-muted-foreground"}>
                              {createLocalBody
                                ? createLocalBody
                                : (lang === "ml" ? "-- തദ്ദേശ സ്ഥാപനം തിരഞ്ഞെടുക്കുക --" : "-- Select Local Body --")}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        </div>

                        {/* 4. Ward */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "വാർഡ് *" : "Ward *"}
                          </label>
                          <button
                            type="button"
                            disabled={!createLocalBody}
                            onClick={() => {
                              if (createLocalBody) {
                                setActiveAddressSheet("ward");
                                setAddressSheetSearch("");
                              }
                            }}
                            className={`w-full text-xs p-3 rounded-xl border outline-none flex items-center justify-between transition-colors text-left ${
                              !createLocalBody
                                ? "bg-muted/50 border-border text-muted-foreground cursor-not-allowed opacity-70"
                                : "bg-background hover:bg-slate-50 dark:hover:bg-slate-800/60 border-border text-foreground cursor-pointer"
                            }`}
                          >
                            <span className={createWard ? "font-bold" : "text-muted-foreground"}>
                              {createWard
                                ? createWard
                                : (lang === "ml" ? "-- വാർഡ് തിരഞ്ഞെടുക്കുക --" : "-- Select Ward --")}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        </div>

                        {/* 5. Assembly Mandalam */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-foreground block">
                              {lang === "ml" ? "നിയമസഭാ മണ്ഡലം *" : "Assembly Mandalam *"}
                            </label>
                            {isMandalamAutoFilled && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                {lang === "ml" ? "ഓട്ടോ-മാപ്പ് ചെയ്തത്" : "Auto-Mapped"}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={!createDistrict}
                            onClick={() => {
                              if (createDistrict) {
                                setActiveAddressSheet("mandalam");
                                setAddressSheetSearch("");
                              }
                            }}
                            className={`w-full text-xs p-3 rounded-xl border outline-none flex items-center justify-between transition-colors text-left ${
                              !createDistrict
                                ? "bg-muted/50 border-border text-muted-foreground cursor-not-allowed opacity-70"
                                : "bg-background hover:bg-slate-50 dark:hover:bg-slate-800/60 border-border text-foreground cursor-pointer"
                            }`}
                          >
                            <span className={createMandalam ? "font-bold" : "text-muted-foreground"}>
                              {createMandalam
                                ? (lang === "ml" ? getConstituencyName(createMandalam, "ml") : createMandalam)
                                : (lang === "ml" ? "-- മണ്ഡലം തിരഞ്ഞെടുക്കുക --" : "-- Select Assembly Mandalam --")}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        </div>

                        {/* 6. House / Building Name */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "വീട്ടുപേര് / കെട്ടിടത്തിന്റെ പേര് *" : "House / Building Name *"}
                          </label>
                          <input 
                            type="text" 
                            value={createHouseName}
                            onChange={(e) => setCreateHouseName(e.target.value)}
                            placeholder={lang === "ml" ? "ഉദാ: കൃഷ്ണകൃപ, ഡോർ നമ്പർ 12/34" : "House Name / Door No."}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 7. Street / Locality */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "സ്ട്രീറ്റ് / സ്ഥലം *" : "Street / Locality *"}
                          </label>
                          <input 
                            type="text" 
                            value={createStreetLocality}
                            onChange={(e) => setCreateStreetLocality(e.target.value)}
                            placeholder={lang === "ml" ? "റോഡ് / പ്രദേശം / അടയാളം" : "Street / Locality / Landmark"}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 8. PIN Code */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "പിൻകോഡ് *" : "PIN Code *"}
                          </label>
                          <input 
                            type="text"
                            maxLength={6}
                            value={createPin}
                            onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, ''))}
                            placeholder="6-digit PIN code"
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 9. State (Fixed Read-only) */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "സംസ്ഥാനം *" : "State *"}
                          </label>
                          <div className="w-full text-xs p-2.5 rounded-xl border border-border bg-slate-100 dark:bg-slate-800 font-bold text-foreground flex items-center justify-between">
                            <span>{lang === "ml" ? "കേരളം (Kerala)" : "Kerala"}</span>
                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-md">Fixed</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Scanning / Loading View - Check Eligibility */}
                    {createFlowStep === "checking" && (
                      <div className="py-6 px-2 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300 min-h-[440px]">
                        {/* Center Graphic: Glowing Halo + Orbiting Dot + Scanning Document Icon */}
                        <div className="relative flex items-center justify-center py-2">
                          {/* Outer Orange Orbit Ring */}
                          <div className="absolute h-36 w-36 rounded-full border border-orange-300/60 dark:border-orange-700/40 animate-spin" style={{ animationDuration: '8s' }}>
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-orange-500 shadow-md" />
                          </div>
                          {/* Soft Inner Glowing Circular Gradient Background */}
                          <div className="h-28 w-28 rounded-full bg-gradient-to-b from-orange-100/90 via-orange-50/60 to-orange-100/30 dark:from-orange-950/60 dark:via-orange-900/30 dark:to-orange-950/10 border border-orange-200/80 dark:border-orange-800/60 flex items-center justify-center shadow-inner">
                            <div className="relative h-14 w-14 rounded-xl bg-orange-100/80 dark:bg-orange-900/60 border border-orange-300 dark:border-orange-700 flex flex-col items-center justify-center shadow-xs overflow-hidden">
                              <FileText className="h-9 w-9 text-orange-500 stroke-[1.8]" />
                              {/* Horizontal Scan Beam Line */}
                              <div className="absolute inset-x-0 h-0.5 bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1.5 max-w-xs">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            {lang === "ml" ? "യോഗ്യത പരിശോധിക്കുന്നു..." : "Checking eligibility..."}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-2">
                            {lang === "ml"
                              ? "നിങ്ങളുടെ വിവരങ്ങളുമായി പദ്ധതിയുടെ മാനദണ്ഡങ്ങൾ പൊരുത്തപ്പെടുത്തുന്നു."
                              : "Matching your details with the scheme requirements."}
                          </p>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="w-full max-w-sm space-y-2">
                          <div className="h-2 w-full bg-orange-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 rounded-full animate-pulse w-3/4 transition-all duration-1000" />
                          </div>
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 text-center">
                            {lang === "ml" ? "പദ്ധതി മാനദണ്ഡങ്ങൾ പരിശോധിക്കുന്നു..." : "Checking scheme criteria..."}
                          </p>
                        </div>

                        {/* Bottom Security / Keep Open Note */}
                        <div className="pt-2 flex items-start justify-center gap-2 text-left max-w-xs mx-auto">
                          <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-snug">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">
                              {lang === "ml" ? "നിങ്ങൾ നൽകിയ വിവരങ്ങൾ സൂക്ഷിച്ചിരിക്കുന്നു." : "Your entered details are saved."}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 block">
                              {lang === "ml" ? "ദയവായി ഈ സ്ക്രീൻ ഓപ്പണായി നിർത്തുക." : "Please keep this screen open."}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2.5: Specific Single Scheme Eligibility Result View */}
                    {createFlowStep === "eligibility_result" && selectedEligibleScheme && (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left pb-4">
                        {/* Top Green Checkmark Icon & Banner */}
                        <div className="text-center pt-2 pb-1 space-y-2">
                          <div className="relative flex items-center justify-center mx-auto">
                            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs border border-emerald-300 dark:border-emerald-800">
                              <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                                <Check className="h-6 w-6 stroke-[3]" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-foreground">
                              {lang === "ml" ? "നിങ്ങൾക്ക് അർഹതയുണ്ടാകാം" : "You may be eligible"}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">
                              {lang === "ml" ? "നിങ്ങൾ നൽകിയ വിവരങ്ങൾ അടിസ്ഥാനമാക്കി." : "Based on the details you provided."}
                            </p>
                          </div>
                        </div>

                        {/* Card: Selected Scheme details & Checks */}
                        <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
                          {/* Card Header Section */}
                          <div className="p-3.5 space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                              {lang === "ml" ? "തിരഞ്ഞെടുത്ത പദ്ധതി" : "SELECTED SCHEME"}
                            </span>
                            <h4 className="font-extrabold text-sm text-foreground">
                              {selectedSchemeName || (lang === "ml" ? selectedEligibleScheme.titleMl : selectedEligibleScheme.titleEn)}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {lang === "ml"
                                ? "പ്രാഥമിക അർഹതാ മാനദണ്ഡങ്ങൾ അനുസരിച്ച് നിങ്ങൾ അർഹനാണ്."
                                : "You appear to meet the initial eligibility criteria."}
                            </p>
                          </div>

                          <div className="h-[1px] bg-border/80 w-full" />

                          {/* Row 1: Applicant Details */}
                          <div className="p-3.5 flex items-center justify-between gap-3 bg-card">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/60 dark:border-orange-900/40">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-foreground leading-snug">
                                  {lang === "ml" ? "അപേക്ഷകന്റെ വിവരങ്ങൾ" : "Applicant details"}
                                </h5>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {lang === "ml" ? "നിങ്ങളുടെ അപേക്ഷയ്ക്കായി വിവരങ്ങൾ സൂക്ഷിച്ചു." : "Details saved for your application."}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCreateFlowStep("form")}
                              className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 shrink-0 cursor-pointer"
                            >
                              {lang === "ml" ? "തിരുത്തുക" : "Edit"}
                            </button>
                          </div>

                          <div className="h-[1px] bg-border/80 w-full" />

                          {/* Row 2: View Eligibility Checks Accordion */}
                          <div>
                            <button
                              type="button"
                              onClick={() => setShowEligibilityDetails(!showEligibilityDetails)}
                              className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-muted/40 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-900/40">
                                  <Check className="h-4 w-4 stroke-[2.5]" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-xs text-foreground leading-snug">
                                    {lang === "ml" ? "അർഹതാ പരിശോധനകൾ കാണുക" : "View eligibility checks"}
                                  </h5>
                                </div>
                              </div>
                              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${showEligibilityDetails ? "rotate-180" : ""}`} />
                            </button>

                            {/* Collapsible content */}
                            {showEligibilityDetails && (
                              <div className="px-3.5 pb-3.5 pt-1 space-y-2 bg-muted/20 text-xs border-t border-border/40">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <span>{lang === "ml" ? "വരുമാന പരിധി യോഗ്യത പൂർത്തിയായി" : "Income Criteria Verified"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <span>{lang === "ml" ? "മേഖല / മണ്ഡലം പരിധി യോഗ്യമാണ്" : "Regional Location Matched"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <span>{lang === "ml" ? "പ്രായപരിധി മാനദണ്ഡങ്ങൾ പാലിക്കപ്പെട്ടു" : "Age Limit Requirements Met"}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Section: What happens next? */}
                        <div className="pt-1 space-y-2.5">
                          <h4 className="font-extrabold text-xs text-foreground px-0.5">
                            {lang === "ml" ? "അടുത്തത് എന്താണ്?" : "What happens next?"}
                          </h4>

                          <div className="space-y-2">
                            {/* Step 1 */}
                            <div className="flex items-start gap-3 p-2.5 bg-card rounded-xl border border-border/70 shadow-2xs">
                              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/50 dark:border-orange-900/40">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 pt-0.5">
                                <h5 className="font-bold text-xs text-foreground leading-tight">
                                  {lang === "ml" ? "ബാക്കി വിവരങ്ങൾ പൂർത്തിയാക്കുക" : "Complete remaining details"}
                                </h5>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                  {lang === "ml" ? "പ്രൊഫൈൽ പൂർത്തിയാക്കാൻ ആവശ്യമായ വിവരങ്ങൾ നൽകുക." : "Fill required info to complete your profile."}
                                </p>
                              </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start gap-3 p-2.5 bg-card rounded-xl border border-border/70 shadow-2xs">
                              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/50 dark:border-orange-900/40">
                                <Upload className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 pt-0.5">
                                <h5 className="font-bold text-xs text-foreground leading-tight">
                                  {lang === "ml" ? "ആവശ്യമായ രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക" : "Upload required documents"}
                                </h5>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                  {lang === "ml" ? "തിരിച്ചറിയൽ രേഖയും വരുമാന സർട്ടിഫിക്കറ്റും സമർപ്പിക്കുക." : "Submit proof of identity and income."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer / Application Action */}
                        <div className="pt-2 text-center space-y-2">
                          <p className="text-[11px] text-muted-foreground font-medium">
                            {lang === "ml" ? "നിങ്ങൾ നൽകിയ വിവരങ്ങൾ ഇതോടൊപ്പം ചേർക്കും." : "Your entered details will be carried forward."}
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              const schemeId = selectedEligibleScheme.id;
                              setSelectedEligibleSchemeIds([schemeId]);
                              startSelectedSchemesCollection([schemeId]);
                            }}
                            className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>{lang === "ml" ? "അപേക്ഷ തുടരുക" : "Continue Application"}</span>
                            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                          </button>

                          <p className="text-[10px] text-muted-foreground/80 font-medium pt-0.5">
                            {lang === "ml" ? "അന്തിമ അനുമതി പരിശോധനയ്ക്ക് വിധേയമാണ്." : "Final approval is subject to verification."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Eligible Schemes View */}
                    {createFlowStep === "eligible_schemes" && (
                      <div className="space-y-2.5 animate-in fade-in duration-200">
                        {/* Search Bar for Eligible Schemes */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            value={eligibleSchemesSearchQuery}
                            onChange={(e) => setEligibleSchemesSearchQuery(e.target.value)}
                            placeholder={lang === "ml" ? "പദ്ധതിയുടെ പേര് തിരയുക..." : "Search eligible schemes..."}
                            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-border bg-card focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          />
                          {eligibleSchemesSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setEligibleSchemesSearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 px-0.5">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="shrink-0 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                              {lang === "ml"
                                ? `${mockEligibleSchemesList.length} യോഗ്യമായ പദ്ധതികൾ`
                                : `${mockEligibleSchemesList.length} Eligible Schemes for`}
                            </span>
                            <span className="inline-flex h-[18px] max-w-[110px] shrink-0 items-center truncate rounded-full border border-slate-200 bg-white px-2 text-[9.5px] font-medium leading-none text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                              {createFullName || "Soman P"}
                            </span>
                          </div>
                          <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={mockEligibleSchemesList.every((scheme) =>
                                selectedEligibleSchemeIds.includes(scheme.id)
                              )}
                              onChange={() => {
                                const allSchemeIds = mockEligibleSchemesList.map((scheme) => scheme.id);
                                setSelectedEligibleSchemeIds((current) =>
                                  mockEligibleSchemesList.every((scheme) => current.includes(scheme.id))
                                    ? []
                                    : allSchemeIds
                                );
                              }}
                              className="peer sr-only"
                            />
                            <span
                              aria-hidden="true"
                              className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 border-orange-300 bg-white text-white transition-all hover:border-orange-500 peer-checked:border-orange-500 peer-checked:bg-orange-500 peer-checked:shadow-xs dark:border-orange-900 dark:bg-slate-900"
                            >
                              {mockEligibleSchemesList.every((scheme) =>
                                selectedEligibleSchemeIds.includes(scheme.id)
                              ) && <Check className="h-2.5 w-2.5 stroke-[4]" />}
                            </span>
                            <span>{lang === "ml" ? "എല്ലാം" : "All"}</span>
                          </label>
                        </div>

                        {/* Eligible Scheme Cards or Empty State */}
                        {mockEligibleSchemesList.filter((s) => {
                          if (!eligibleSchemesSearchQuery.trim()) return true;
                          const q = eligibleSchemesSearchQuery.toLowerCase();
                          return (
                            s.titleEn.toLowerCase().includes(q) ||
                            s.titleMl.toLowerCase().includes(q) ||
                            s.deptEn.toLowerCase().includes(q) ||
                            s.benefitEn.toLowerCase().includes(q)
                          );
                        }).length > 0 ? (
                          <div className="space-y-2.5">
                            {mockEligibleSchemesList
                              .filter((s) => {
                                if (!eligibleSchemesSearchQuery.trim()) return true;
                                const q = eligibleSchemesSearchQuery.toLowerCase();
                                return (
                                  s.titleEn.toLowerCase().includes(q) ||
                                  s.titleMl.toLowerCase().includes(q) ||
                                  s.deptEn.toLowerCase().includes(q) ||
                                  s.benefitEn.toLowerCase().includes(q)
                                );
                              })
                              .map((scheme) => {
                                const isSelected = selectedEligibleSchemeIds.includes(scheme.id);
                                const category = getSchemeCategoryLabel(scheme);
                                return (
                                  <button
                                    type="button"
                                    key={scheme.id}
                                    role="checkbox"
                                    aria-checked={isSelected}
                                    aria-label={`${lang === "ml" ? "പദ്ധതി തിരഞ്ഞെടുക്കുക" : "Select scheme"}: ${lang === "ml" ? scheme.titleMl : scheme.titleEn}`}
                                    onClick={() => toggleEligibleSchemeSelection(scheme.id)}
                                    className={`w-full cursor-pointer bg-card p-3 rounded-2xl border shadow-2xs transition-all space-y-2 text-left ${
                                      isSelected
                                        ? "border-orange-400 bg-orange-50/40 ring-2 ring-orange-200/80 dark:border-orange-700 dark:bg-orange-950/20 dark:ring-orange-900/60"
                                        : "border-border hover:border-orange-300 dark:hover:border-orange-800"
                                    }`}
                                  >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex min-w-0 items-start gap-2">
                                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-orange-100 bg-white p-0.5 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
                                        <img
                                          src={getEligibleSchemeLogo(scheme)}
                                          alt=""
                                          aria-hidden
                                          className="h-full w-full object-contain"
                                        />
                                      </span>
                                      <div className="min-w-0">
                                        <h4 className="font-bold text-[13px] text-foreground leading-snug break-words">
                                          {lang === "ml" ? scheme.titleMl : scheme.titleEn}
                                        </h4>
                                        <p className="mt-0.5 text-[10.5px] font-semibold text-muted-foreground leading-snug">
                                          {lang === "ml" ? category.ml : category.en}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span
                                        aria-hidden="true"
                                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-all cursor-pointer active:scale-95 ${
                                          isSelected
                                            ? "border-orange-500 bg-orange-500 text-white shadow-xs"
                                            : "border-orange-300 bg-white hover:border-orange-500 dark:border-orange-900 dark:bg-slate-900"
                                        }`}
                                      >
                                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[4]" />}
                                      </span>
                                    </div>
                                  </div>

                                  <p className="text-[11px] text-muted-foreground leading-snug">
                                    {lang === "ml" ? scheme.benefitMl : scheme.benefitEn}
                                  </p>

                                </button>
                                );
                              })}
                          </div>
                        ) : (
                          /* Empty & Retry State */
                          <div className="bg-card border border-border p-6 rounded-2xl shadow-2xs text-center space-y-3 my-2">
                            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
                              <SearchX className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-xs text-foreground">
                                {lang === "ml" ? "പൊരുത്തപ്പെടുന്ന പദ്ധതികൾ കണ്ടെത്തിയില്ല" : "No matching schemes found"}
                              </h4>
                              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                                {lang === "ml"
                                  ? "നിങ്ങൾ നൽകിയ തിരച്ചിൽ വാക്കിന് അനുയോജ്യമായ പദ്ധതികളില്ല. തിരച്ചിൽ മാറ്റി ശ്രമിക്കുക."
                                  : "Try adjusting your search criteria or clear filters to view available schemes."}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEligibleSchemesSearchQuery("")}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-2xs cursor-pointer"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              <span>{lang === "ml" ? "വീണ്ടും ശ്രമിക്കുക" : "Retry Search"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3b: Selected Schemes - one application per scheme */}
                    {createFlowStep === "selected_schemes" && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-start gap-2.5">
                          <UserRound className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.8} />
                          <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="break-words text-[13px] font-extrabold leading-snug text-foreground">
                                {createFullName.trim() || "Applicant"}
                              </p>
                              <p className="mt-0.5 break-words text-[11px] font-medium leading-snug text-muted-foreground">
                                {lang === "ml"
                                  ? [createMandalam ? getConstituencyName(createMandalam, "ml") : "", createDistrict ? getDistrictName(createDistrict, "ml") : ""].filter(Boolean).join(", ") || "കേരളം"
                                  : [createMandalam.trim(), createDistrict.trim()].filter(Boolean).join(", ") || "Kerala"}
                              </p>
                            </div>
                            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] font-extrabold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300">
                              <Inbox className="h-3 w-3 shrink-0" strokeWidth={2} />
                              <span>
                                {lang === "ml" ? "അപേക്ഷ ലഭിച്ചു" : "Application Received"}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-orange-100 dark:border-orange-900/40" aria-hidden="true" />

                        <p className="px-1 text-[10.5px] font-medium leading-snug text-muted-foreground">
                          {lang === "ml"
                            ? "ഓരോ പദ്ധതിയുടെയും വിവരങ്ങൾ വെവ്വേറെ പൂർത്തിയാക്കുക."
                            : "Complete details for each scheme separately."}
                        </p>

                        {currentApplicantApplications.map((record) => {
                          const statusMeta = getApplicationStatusMeta(record);
                          const category = getSchemeCategoryLabel(record.scheme);
                          const isComplete = record.status === "complete" || record.status === "ready";
                          const isIncomplete = record.status === "incomplete";
                          const StatusIcon = isComplete ? CheckCircle2 : isIncomplete ? Hourglass : Clock3;
                          const statusIconClass = isComplete
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isIncomplete
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-500 dark:text-slate-400";
                          const actionLabel = isComplete
                            ? (lang === "ml" ? "രേഖ കാണുക" : "View Record")
                            : isIncomplete
                              ? (lang === "ml" ? "ശേഖരണം തുടരുക" : "Continue Collection")
                              : (lang === "ml" ? "വിവരങ്ങൾ പൂർത്തിയാക്കുക" : "Complete Details");
                          const missingLabels = record.missingItems
                            .slice(0, 2)
                            .map((item) => (lang === "ml" ? item.labelMl : item.labelEn)
                              .replace(/^Required document:\s*/i, "")
                              .replace(/^ആവശ്യമായ രേഖ:\s*/i, ""));
                          const remainingMissing = Math.max(0, record.missingItems.length - missingLabels.length);
                          const openRecord = () => {
                            if (isComplete) {
                              openCollectionRecordView(record, "selected_schemes");
                            } else {
                              openSchemeDetails(record.scheme.id, "selected_schemes");
                            }
                          };

                          return (
                            <button
                              key={record.reference}
                              type="button"
                              onClick={openRecord}
                              className="w-full rounded-2xl border border-orange-100 bg-card p-2 text-left shadow-2xs transition-colors hover:border-orange-200 hover:bg-orange-50/30 dark:border-orange-900/50 dark:hover:bg-orange-950/10"
                            >
                              <div className="flex items-start gap-2 pt-0.5">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-100 bg-[#FFF9F2] p-0.5 dark:border-orange-900/50 dark:bg-orange-950/20">
                                  <img
                                    src={getEligibleSchemeLogo(record.scheme)}
                                    alt=""
                                    aria-hidden
                                    className="h-full w-full object-contain"
                                  />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <h5 className="break-words text-[13.5px] font-extrabold leading-snug text-foreground">
                                    {lang === "ml" ? record.scheme.titleMl : record.scheme.titleEn}
                                  </h5>
                                  <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                                    {lang === "ml" ? category.ml : category.en}
                                  </p>
                                  {isIncomplete && missingLabels.length > 0 && (
                                    <p className="mt-1 text-[9.5px] leading-snug text-amber-700 dark:text-amber-300">
                                      <span className="font-extrabold">{lang === "ml" ? "ബാക്കി: " : "Missing: "}</span>
                                      {missingLabels.join("; ")}{remainingMissing > 0 ? `; +${remainingMissing}` : ""}
                                    </p>
                                  )}
                                  {record.followUpDate && (
                                    <p className="mt-1 inline-flex items-center gap-1.5 text-[9.5px] font-semibold text-amber-700 dark:text-amber-300">
                                      <Calendar className="h-3 w-3" />
                                      {lang === "ml" ? "തുടർനടപടി: " : "Follow-up: "}
                                      {formatCollectionDate(record.followUpDate)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-orange-100 pt-1.5 dark:border-orange-900/40">
                                <span className="inline-flex min-w-0 items-center gap-1 text-[10px] font-extrabold">
                                  <StatusIcon className={`h-3.5 w-3.5 shrink-0 ${statusIconClass}`} />
                                  <span className="truncate text-muted-foreground">
                                    {lang === "ml" ? statusMeta.labelMl : statusMeta.labelEn}
                                  </span>
                                </span>
                                <span className="inline-flex min-h-7 shrink-0 items-center justify-center gap-1 bg-transparent px-1 text-[12px] font-extrabold text-[#ff5500] dark:text-orange-400">
                                  {actionLabel}
                                  <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                                </span>
                              </div>
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={handleAddAnotherScheme}
                          className="flex min-h-9 w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-orange-300 bg-transparent px-3 py-2 text-[11px] font-extrabold text-orange-600 transition-colors hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/20"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-orange-500 text-orange-600 dark:border-orange-500 dark:text-orange-400">
                            <Plus className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                          {lang === "ml" ? "പദ്ധതി ചേർക്കുക" : "Add Scheme"}
                        </button>

                        <p className="text-center text-[9.5px] font-medium text-muted-foreground">
                          {lang === "ml" ? "ഓരോ പദ്ധതിയും വെവ്വേറെ സേവ് ചെയ്യും." : "Each scheme is saved separately."}
                        </p>
                      </div>
                    )}

                    {/* Step 5b: Applicant Applications - one card per scheme application */}
                    {createFlowStep === "applicant_applications" && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        {renderApplicantSummaryCard()}

                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 px-0.5">
                          <p className="text-[10.5px] font-extrabold text-foreground">
                            {lang === "ml"
                              ? `${currentApplicantApplications.length} പദ്ധതി അപേക്ഷകൾ`
                              : `${currentApplicantApplications.length} scheme application${currentApplicantApplications.length === 1 ? "" : "s"}`}
                          </p>
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {applicantFollowUpCount > 0 && (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-extrabold text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                                {lang === "ml"
                                  ? `${applicantFollowUpCount} തുടർനടപടി`
                                  : `${applicantFollowUpCount} follow-up${applicantFollowUpCount === 1 ? "" : "s"}`}
                              </span>
                            )}
                            {applicantNotStartedCount > 0 && (
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-extrabold text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                                {lang === "ml"
                                  ? `${applicantNotStartedCount} തുടങ്ങിയിട്ടില്ല`
                                  : `${applicantNotStartedCount} not started`}
                              </span>
                            )}
                            {applicantCompleteCount > 0 && (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                                {lang === "ml"
                                  ? `${applicantCompleteCount} പൂർത്തിയായി`
                                  : `${applicantCompleteCount} complete`}
                              </span>
                            )}
                          </div>
                        </div>

                        {currentApplicantApplications.length === 0 && (
                          <div className="rounded-2xl border border-border bg-card p-4 text-center text-[11px] text-muted-foreground">
                            {lang === "ml" ? "അപേക്ഷകൾ ലഭ്യമല്ല." : "No applications recorded for this applicant yet."}
                          </div>
                        )}

                        {currentApplicantApplications.map((record) => {
                          const statusMeta = getApplicationStatusMeta(record);
                          const { Icon: SchemeIcon, tileClass } = getSchemeVisual(record.scheme.id);
                          const category = getSchemeCategoryLabel(record.scheme);
                          const isDataComplete = record.status === "complete" || record.status === "ready";
                          const isNotStarted = record.status === "not_started";
                          const visibleMissingItems = record.missingItems.slice(0, 3);
                          const remainingMissingCount = Math.max(0, record.missingItems.length - visibleMissingItems.length);
                          const missingItemLabel = (item: MobileMissingItem) => {
                            const label = lang === "ml" ? item.labelMl : item.labelEn;
                            return label
                              .replace(/^Required document:\s*/i, "")
                              .replace(/^ആവശ്യമായ രേഖ:\s*/i, "");
                          };
                          return (
                            <div
                              key={record.reference}
                              className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs text-left"
                            >
                              <div className="flex items-start gap-2.5">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${tileClass}`}>
                                  <SchemeIcon className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-extrabold text-sm text-foreground leading-snug break-words">
                                    {lang === "ml" ? record.scheme.titleMl : record.scheme.titleEn}
                                  </h5>
                                  <p className="mt-0.5 text-[10.5px] font-semibold text-muted-foreground">
                                    {lang === "ml" ? category.ml : category.en}
                                  </p>
                                  <span className={`mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${statusMeta.className}`}>
                                    {lang === "ml" ? statusMeta.labelMl : statusMeta.labelEn}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3 space-y-2.5 border-t border-border/70 pt-2.5">
                                {record.status === "incomplete" && record.missingItems.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
                                    <div className="min-w-0">
                                      <p className="text-[9.5px] font-extrabold text-foreground">
                                        {lang === "ml" ? "ബാക്കിയുള്ള കാര്യങ്ങൾ" : "Missing items"}
                                      </p>
                                      <p className="mt-0.5 text-[9.5px] leading-snug text-muted-foreground">
                                        {visibleMissingItems.map(missingItemLabel).join("; ")}
                                        {remainingMissingCount > 0
                                          ? (lang === "ml" ? `; കൂടാതെ ${remainingMissingCount} എണ്ണം` : `; +${remainingMissingCount} more`)
                                          : ""}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {record.followUpDate && (
                                  <div className="flex items-start gap-2 border-t border-border/60 pt-2.5">
                                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
                                    <div className="min-w-0">
                                      <p className="text-[9.5px] font-extrabold text-foreground">
                                        {lang === "ml" ? "അടുത്ത തുടർനടപടി" : "Next follow-up"}
                                      </p>
                                      <p className="mt-0.5 text-[11px] font-extrabold text-orange-700 dark:text-orange-300">
                                        {formatCollectionDate(record.followUpDate)}
                                      </p>
                                      <p className="mt-0.5 text-[9.5px] leading-snug text-muted-foreground">
                                        {record.followUpNotes || (lang === "ml" ? "തുടർനടപടി വിവരങ്ങൾ ലഭ്യമല്ല." : "No collection notes added.")}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {isDataComplete && (
                                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50/70 px-2 py-2 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    <p className="text-[10px] font-extrabold">
                                      {lang === "ml" ? "ശേഖരണം പൂർത്തിയായി · സംസ്കരണത്തിന് തയ്യാർ." : "Collection Complete · Ready for processing."}
                                    </p>
                                  </div>
                                )}

                                {isNotStarted && (
                                  <p className="text-[10px] leading-snug text-muted-foreground">
                                    {lang === "ml" ? "ഈ പദ്ധതിയുടെ വിവരങ്ങൾ ഇതുവരെ ശേഖരിച്ചിട്ടില്ല." : "Data collection has not started for this scheme."}
                                  </p>
                                )}
                              </div>

                              <div className="mt-2.5 flex items-center gap-2 border-t border-border/70 pt-2.5">
                                {!isDataComplete && (
                                  <button
                                    type="button"
                                    onClick={() => openSchemeDetails(record.scheme.id, "applicant_applications")}
                                    className="min-h-11 flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2 text-[10.5px] font-extrabold text-white shadow-sm transition-all hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] cursor-pointer"
                                  >
                                    {isNotStarted
                                      ? (lang === "ml" ? "വിവരങ്ങൾ പൂർത്തിയാക്കുക" : "Complete Details")
                                      : (lang === "ml" ? "ശേഖരണം തുടരുക" : "Continue Collection")}
                                  </button>
                                )}
                                {(isDataComplete || !isNotStarted) && (
                                  <button
                                    type="button"
                                    onClick={() => openCollectionRecordView(record, "applicant_applications")}
                                    className={`inline-flex min-h-11 items-center justify-center gap-0.5 rounded-xl border border-orange-300 bg-orange-50 px-3 text-[10.5px] font-extrabold text-orange-700 transition-colors hover:bg-orange-100 cursor-pointer dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/70 ${isDataComplete ? "w-full" : ""}`}
                                  >
                                    <span>{lang === "ml" ? "രേഖ കാണുക" : "View Record"}</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={handleAddAnotherApplicant}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2.5 text-[11px] font-extrabold text-orange-700 transition-colors hover:bg-orange-100 cursor-pointer dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/70"
                        >
                          <Plus className="h-4 w-4" />
                          {lang === "ml" ? "മറ്റൊരു അപേക്ഷകൻ" : "Add Another Applicant"}
                        </button>
                      </div>
                    )}

                    {/* Step 4: Missing Scheme-Specific Details View */}
                    {createFlowStep === "scheme_details" && selectedEligibleScheme && (
                      <div className="space-y-3.5 text-left animate-in fade-in duration-200">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2.5">
                            <UserRound className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.8} />
                            <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="break-words text-[13px] font-extrabold leading-snug text-foreground">
                                  {createFullName.trim() || "Applicant"}
                                </p>
                                <p className="mt-0.5 break-words text-[11px] font-medium leading-snug text-muted-foreground">
                                  {lang === "ml"
                                    ? [createMandalam ? getConstituencyName(createMandalam, "ml") : "", createDistrict ? getDistrictName(createDistrict, "ml") : ""].filter(Boolean).join(", ") || "കേരളം"
                                    : [createMandalam.trim(), createDistrict.trim()].filter(Boolean).join(", ") || "Kerala"}
                                </p>
                              </div>
                              <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] font-extrabold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300">
                                <Inbox className="h-3 w-3 shrink-0" strokeWidth={2} />
                                <span>
                                  {lang === "ml" ? "അപേക്ഷ ലഭിച്ചു" : "Application Received"}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-orange-100 dark:border-orange-900/40" aria-hidden="true" />

                          <div className="flex items-start gap-2.5 rounded-2xl border border-orange-100 bg-card p-2.5 shadow-2xs dark:border-orange-900/50">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-100 bg-[#FFF9F2] p-0.5 dark:border-orange-900/50 dark:bg-orange-950/20">
                              <img
                                src={getEligibleSchemeLogo(selectedEligibleScheme)}
                                alt=""
                                aria-hidden
                                className="h-full w-full object-contain"
                              />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="break-words text-[13px] font-extrabold leading-snug text-foreground">
                                {lang === "ml" ? selectedEligibleScheme.titleMl : selectedEligibleScheme.titleEn}
                              </p>
                              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                                {lang === "ml"
                                  ? getSchemeCategoryLabel(selectedEligibleScheme).ml
                                  : getSchemeCategoryLabel(selectedEligibleScheme).en}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Required Documents */}
                        <div className="space-y-2">
                          {getSchemeRequiredDocuments(selectedEligibleScheme).map((document) => {
                            const uploadedDocumentName = uploadedDocuments[document.id] || "";
                            const uploadError = uploadErrors[document.id] || "";
                            const fileExtension = uploadedDocumentName.split(".").pop()?.toLowerCase() ?? "";
                            const fileBadge = fileExtension === "pdf"
                              ? { label: "PDF", className: "bg-rose-600" }
                              : ["jpg", "jpeg"].includes(fileExtension)
                                ? { label: "JPG", className: "bg-sky-600" }
                                : { label: "PNG", className: "bg-teal-600" };
                            return (
                              <div
                                key={document.id}
                                className="space-y-1"
                              >
                                <label
                                  htmlFor={`scheme_doc_${document.id}`}
                                  className="mb-1 block text-[11px] font-bold leading-snug text-foreground"
                                >
                                  {lang === "ml" ? document.labelMl : document.labelEn}{" "}
                                  <span className="text-orange-600 dark:text-orange-400">*</span>
                                </label>

                                <input
                                  id={`scheme_doc_${document.id}`}
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                  className="sr-only"
                                  onChange={(event) => {
                                    const input = event.currentTarget;
                                    handleDocumentFileSelect(document.id, input.files?.[0]);
                                    input.value = "";
                                  }}
                                />

                                {uploadedDocumentName ? (
                                  <div className="flex items-center gap-2 rounded-xl bg-[#FCF5ED] p-2.5 dark:bg-slate-900/70">
                                    <label
                                      htmlFor={`scheme_doc_${document.id}`}
                                      title={lang === "ml" ? "മാറ്റാൻ ക്ലിക്ക് ചെയ്യുക" : "Click to replace"}
                                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5"
                                    >
                                      <span className="relative flex h-10 w-8 shrink-0 items-start justify-center">
                                        <FileText className="h-8 w-7 text-slate-300 dark:text-slate-600" strokeWidth={1.4} />
                                        <span className={`absolute -bottom-0.5 left-0 rounded px-1 py-0.5 text-[7px] font-black leading-none text-white ${fileBadge.className}`}>
                                          {fileBadge.label}
                                        </span>
                                      </span>
                                      <span className="min-w-0 flex-1">
                                        <span
                                          title={uploadedDocumentName}
                                          className="block truncate text-[12px] font-bold leading-snug text-foreground"
                                        >
                                          {uploadedDocumentName}
                                        </span>
                                        <span className="mt-0.5 block text-[9.5px] font-medium text-muted-foreground">
                                          {fileBadge.label} · {lang === "ml" ? "അപ്‌ലോഡ് ചെയ്തു" : "Uploaded"}
                                        </span>
                                      </span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => removeDocumentUpload(document.id)}
                                      title={lang === "ml" ? "നീക്കുക" : "Remove"}
                                      aria-label={lang === "ml" ? "നീക്കുക" : "Remove"}
                                      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#F1E2D1] bg-white text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800 dark:text-red-400 dark:hover:border-red-900 dark:hover:bg-red-950/40"
                                    >
                                      <X className="h-3 w-3" strokeWidth={2.2} />
                                    </button>
                                  </div>
                                ) : (
                                  <label
                                    htmlFor={`scheme_doc_${document.id}`}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={(event) => {
                                      event.preventDefault();
                                      const file = event.dataTransfer.files?.[0];
                                      if (file) handleDocumentFileSelect(document.id, file);
                                    }}
                                    className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-3 py-2.5 text-center transition-colors ${
                                      uploadError
                                        ? "border-rose-300 bg-rose-50/50 hover:bg-rose-50 dark:border-rose-900/70 dark:bg-rose-950/20"
                                        : "border-orange-300 bg-[#FFF9F2]/60 hover:border-orange-400 hover:bg-orange-50/70 dark:border-orange-800 dark:bg-orange-950/20 dark:hover:bg-orange-950/40"
                                    }`}
                                  >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300">
                                      <CloudUpload className="h-4 w-4" strokeWidth={1.9} />
                                    </span>
                                    <span className="text-[10.5px] font-bold leading-snug text-foreground">
                                      {lang === "ml" ? "ഫയൽ തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ ഇവിടെ ഡ്രാഗ് ചെയ്യുക" : "Choose a file or drag & drop it here"}
                                    </span>
                                    <span className="text-[9.5px] font-medium text-muted-foreground">
                                      {lang === "ml" ? "PDF, JPG അല്ലെങ്കിൽ PNG · പരമാവധി 5MB" : "PDF, JPG or PNG · Max 5MB"}
                                    </span>
                                  </label>
                                )}

                                {uploadError && (
                                  <p className="text-[9.5px] font-semibold text-rose-600 dark:text-rose-400">{uploadError}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* PM-Kisan Eligibility Details */}
                        {isPmKisanScheme(selectedEligibleScheme) && (
                          <div className="space-y-3">
                            {pmKisanQuestions.map((question) => (
                              <div key={question.key}>
                                <label
                                  htmlFor={`pm_kisan_${question.key}`}
                                  className="mb-1 block text-[11px] font-bold text-foreground"
                                >
                                  {lang === "ml" ? question.labelMl : question.labelEn}{" "}
                                  <span className="text-orange-600 dark:text-orange-400">*</span>
                                </label>

                                {question.type === "choice" ? (
                                  <select
                                    id={`pm_kisan_${question.key}`}
                                    value={pmKisanDetails[question.key]}
                                    onChange={(event) => updatePmKisanDetails({ [question.key]: event.target.value } as Partial<PmKisanCollectionDetails>)}
                                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                                  >
                                    <option value="">{lang === "ml" ? "-- തിരഞ്ഞെടുക്കുക --" : "-- Select --"}</option>
                                    {question.options.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {lang === "ml" ? option.labelMl : option.labelEn}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="space-y-1">
                                    <input
                                      id={`pm_kisan_${question.key}`}
                                      type="date"
                                      value={pmKisanDetails.landAcquiredDate}
                                      disabled={pmKisanDetails.landAcquisitionNotSure}
                                      onChange={(event) => {
                                        updatePmKisanDetails({ landAcquiredDate: event.target.value, landAcquisitionNotSure: false });
                                      }}
                                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                    <label
                                      htmlFor="pm_kisan_date_not_sure"
                                      className="mt-1 flex cursor-pointer items-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground"
                                    >
                                      <input
                                        id="pm_kisan_date_not_sure"
                                        type="checkbox"
                                        checked={pmKisanDetails.landAcquisitionNotSure}
                                        onChange={(event) => updatePmKisanDetails({
                                          landAcquisitionNotSure: event.target.checked,
                                          landAcquiredDate: "",
                                        })}
                                        className="h-4 w-4 cursor-pointer rounded accent-orange-500"
                                      />
                                      {lang === "ml" ? "സ്വന്തമാക്കിയ തീയതി ഉറപ്പില്ല" : "Not sure of the acquisition date"}
                                    </label>
                                  </div>
                                )}
                              </div>
                            ))}

                            {isPmKisanAcquisitionAfterCutoff(pmKisanDetails) && (
                              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[9.5px] leading-snug text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                <span>
                                  {lang === "ml"
                                    ? "അവലോകനം ആവശ്യം: 1 ഫെബ്രുവരി 2019-ന് ശേഷം സ്വന്തമാക്കിയ ഭൂമി പരിശോധനയ്ക്ക് വിധേയമാക്കണം. പാരമ്പര്യമായി ലഭിച്ച ഭൂമി ഇതേ കാരണത്താൽ തനിയെ നിരസിക്കരുത്."
                                    : "Review required: land acquired after 1 February 2019 may need verification. Do not treat inherited land as an automatic rejection."}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bank Account Number */}
                        {activeRequiredFieldKeys.includes("bankAccountNumber") && (
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ബാങ്ക് അക്കൗണ്ട് നമ്പർ *" : "Bank Account Number *"}
                          </label>
                          <input
                            type="text"
                            value={bankAccountNumber}
                            onChange={(e) => {
                              setBankAccountNumber(e.target.value.replace(/\D/g, ''));
                              setFinalDetailsInvalidFields((current) => current.filter((field) => field !== "bankAccountNumber"));
                              setFinalDetailsSaveNotice(null);
                            }}
                            placeholder="e.g. 398201004821"
                            className={`w-full text-xs p-2.5 rounded-xl border focus:ring-1 outline-none text-foreground ${
                              finalDetailsInvalidFields.includes("bankAccountNumber")
                                ? "border-rose-400 bg-rose-50/60 focus:ring-rose-400 dark:bg-rose-950/20"
                                : "border-border bg-background focus:ring-orange-500"
                            }`}
                          />
                          {finalDetailsInvalidFields.includes("bankAccountNumber") && (
                            <p className="mt-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                              {lang === "ml" ? "9 മുതൽ 18 അക്കങ്ങൾ വരെയുള്ള സാധുവായ അക്കൗണ്ട് നമ്പർ നൽകുക." : "Enter a valid account number with 9–18 digits."}
                            </p>
                          )}
                        </div>
                        )}

                        {/* Bank IFSC Code */}
                        {activeRequiredFieldKeys.includes("bankIfscCode") && (
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ബാങ്ക് IFSC കോഡ് *" : "Bank IFSC Code *"}
                          </label>
                          <input
                            type="text"
                            value={bankIfscCode}
                            onChange={(e) => {
                              setBankIfscCode(e.target.value.toUpperCase());
                              setFinalDetailsInvalidFields((current) => current.filter((field) => field !== "bankIfscCode"));
                              setFinalDetailsSaveNotice(null);
                            }}
                            placeholder="e.g. SBIN0001234"
                            maxLength={11}
                            className={`w-full text-xs p-2.5 rounded-xl border focus:ring-1 outline-none text-foreground uppercase ${
                              finalDetailsInvalidFields.includes("bankIfscCode")
                                ? "border-rose-400 bg-rose-50/60 focus:ring-rose-400 dark:bg-rose-950/20"
                                : "border-border bg-background focus:ring-orange-500"
                            }`}
                          />
                          {finalDetailsInvalidFields.includes("bankIfscCode") && (
                            <p className="mt-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                              {lang === "ml" ? "ഉദാ: SBIN0001234 എന്ന രീതിയിൽ 11 അക്ഷരമുള്ള സാധുവായ IFSC നൽകുക." : "Enter a valid 11-character IFSC code, e.g. SBIN0001234."}
                            </p>
                          )}
                        </div>
                        )}

                        {/* Additional Eligibility Details */}
                        {hasAdditionalEligibilityFields && (
                        <div className="space-y-3 pt-3 border-t border-border">
                          <div>
                            <h5 className="text-[11px] font-extrabold text-foreground">
                              {lang === "ml" ? "അധിക യോഗ്യതാ വിവരങ്ങൾ" : "Additional Eligibility Details"}
                            </h5>
                            <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">
                              {lang === "ml"
                                ? "ഈ വിവരങ്ങൾ പദ്ധതി പ്രത്യേക യോഗ്യത നിർണ്ണയിക്കാൻ സഹായിക്കും."
                                : "These details help determine scheme-specific eligibility."}
                            </p>
                          </div>

                          {activeRequiredFieldKeys.includes("minorityStatus") && (
                          <div>
                            <label className="text-[11px] font-bold text-foreground block mb-1">
                              {lang === "ml" ? "ന്യൂനപക്ഷ പദവി *" : "Minority Status *"}
                            </label>
                            <select
                              value={finalMinorityStatus}
                              onChange={(e) => {
                                setFinalMinorityStatus(e.target.value);
                                setFinalDetailsSaveNotice(null);
                              }}
                              className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                            >
                              <option value="">{lang === "ml" ? "-- തിരഞ്ഞെടുക്കുക --" : "-- Select --"}</option>
                              <option value="yes">{lang === "ml" ? "അതെ" : "Yes"}</option>
                              <option value="no">{lang === "ml" ? "അല്ല" : "No"}</option>
                            </select>
                          </div>
                          )}

                          {activeRequiredFieldKeys.includes("disabilityStatus") && (
                          <div>
                            <label className="text-[11px] font-bold text-foreground block mb-1">
                              {lang === "ml" ? "വൈകല്യമുള്ള വ്യക്തി *" : "Person with a Disability *"}
                            </label>
                            <select
                              value={finalDisabilityStatus}
                              onChange={(e) => {
                                setFinalDisabilityStatus(e.target.value);
                                setFinalDetailsSaveNotice(null);
                              }}
                              className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                            >
                              <option value="">{lang === "ml" ? "-- തിരഞ്ഞെടുക്കുക --" : "-- Select --"}</option>
                              <option value="yes">{lang === "ml" ? "അതെ" : "Yes"}</option>
                              <option value="no">{lang === "ml" ? "അല്ല" : "No"}</option>
                            </select>
                          </div>
                          )}

                          {activeRequiredFieldKeys.includes("studentStatus") && (
                          <div>
                            <label className="text-[11px] font-bold text-foreground block mb-1">
                              {lang === "ml" ? "വിദ്യാർത്ഥി പദവി *" : "Student Status *"}
                            </label>
                            <select
                              value={finalStudentStatus}
                              onChange={(e) => {
                                const nextStatus = e.target.value;
                                setFinalStudentStatus(nextStatus);
                                if (nextStatus === "yes") setFinalEmploymentStatus("");
                                setFinalDetailsSaveNotice(null);
                              }}
                              className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                            >
                              <option value="">{lang === "ml" ? "-- തിരഞ്ഞെടുക്കുക --" : "-- Select --"}</option>
                              <option value="yes">{lang === "ml" ? "അതെ" : "Yes"}</option>
                              <option value="no">{lang === "ml" ? "അല്ല" : "No"}</option>
                            </select>
                          </div>
                          )}

                          {activeRequiredFieldKeys.includes("studentStatus") && finalStudentStatus === "no" && (
                            <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-2.5 dark:border-orange-900/70 dark:bg-orange-950/20">
                              <label className="text-[11px] font-bold text-foreground block mb-1">
                                {lang === "ml" ? "തൊഴിൽ നില *" : "Employment Status *"}
                              </label>
                              <select
                                value={finalEmploymentStatus}
                                onChange={(e) => {
                                  setFinalEmploymentStatus(e.target.value);
                                  setFinalDetailsSaveNotice(null);
                                }}
                                className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                              >
                                <option value="">{lang === "ml" ? "-- തിരഞ്ഞെടുക്കുക --" : "-- Select --"}</option>
                                <option value="employed">{lang === "ml" ? "തൊഴിലുള്ളവർ" : "Employed"}</option>
                                <option value="unemployed">{lang === "ml" ? "തൊഴിലില്ലാത്തവർ" : "Unemployed"}</option>
                                <option value="self-employed">{lang === "ml" ? "സ്വയംതൊഴിൽ / സംരംഭകൻ" : "Self-employed / Entrepreneur"}</option>
                              </select>
                            </div>
                          )}

                          {activeRequiredFieldKeys.includes("bplStatus") && (
                          <div>
                            <label className="text-[11px] font-bold text-foreground block mb-1">
                              {lang === "ml" ? "ബിപിഎൽ നില *" : "BPL Status *"}
                            </label>
                            <select
                              value={finalBplStatus}
                              onChange={(e) => {
                                const nextStatus = e.target.value;
                                setFinalBplStatus(nextStatus);
                                if (nextStatus === "yes") {
                                  setFinalAnnualFamilyIncome("");
                                } else {
                                  setFinalFinancialHardshipStatus("");
                                }
                                setFinalDetailsSaveNotice(null);
                              }}
                              className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                            >
                              <option value="">{lang === "ml" ? "-- തിരഞ്ഞെടുക്കുക --" : "-- Select --"}</option>
                              <option value="yes">{lang === "ml" ? "അതെ" : "Yes"}</option>
                              <option value="no">{lang === "ml" ? "അല്ല" : "No"}</option>
                            </select>
                          </div>
                          )}

                          {activeRequiredFieldKeys.includes("bplStatus") && finalBplStatus === "yes" && (
                            <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-2.5 dark:border-orange-900/70 dark:bg-orange-950/20">
                              <label className="text-[11px] font-bold text-foreground block mb-1">
                                {lang === "ml" ? "സാമ്പത്തിക ബുദ്ധിമുട്ട് നില *" : "Financial Hardship Status *"}
                              </label>
                              <select
                                value={finalFinancialHardshipStatus}
                                onChange={(e) => {
                                  setFinalFinancialHardshipStatus(e.target.value);
                                  setFinalDetailsSaveNotice(null);
                                }}
                                className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                              >
                                <option value="">{lang === "ml" ? "-- തിരഞ്ഞെടുക്കുക --" : "-- Select --"}</option>
                                <option value="yes">{lang === "ml" ? "അതെ" : "Yes"}</option>
                                <option value="no">{lang === "ml" ? "അല്ല" : "No"}</option>
                              </select>
                            </div>
                          )}

                          {activeRequiredFieldKeys.includes("bplStatus") && finalBplStatus === "no" && (
                            <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-2.5 dark:border-orange-900/70 dark:bg-orange-950/20">
                              <label className="text-[11px] font-bold text-foreground block mb-1">
                                {lang === "ml" ? "വാർഷിക കുടുംബ വരുമാനം *" : "Annual Family Income *"}
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  inputMode="numeric"
                                  value={finalAnnualFamilyIncome}
                                  onChange={(e) => {
                                    setFinalAnnualFamilyIncome(e.target.value);
                                    setFinalDetailsInvalidFields((current) => current.filter((field) => field !== "annualFamilyIncome"));
                                    setFinalDetailsSaveNotice(null);
                                  }}
                                  placeholder={lang === "ml" ? "വാർഷിക വരുമാനം നൽകുക" : "Enter annual family income"}
                                  className={`w-full text-xs py-2.5 pl-7 pr-3 rounded-xl border focus:ring-1 outline-none text-foreground ${
                                    finalDetailsInvalidFields.includes("annualFamilyIncome")
                                      ? "border-rose-400 bg-rose-50/60 focus:ring-rose-400 dark:bg-rose-950/20"
                                      : "border-border bg-background focus:ring-orange-500"
                                  }`}
                                />
                              </div>
                              {finalDetailsInvalidFields.includes("annualFamilyIncome") && (
                                <p className="mt-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                  {lang === "ml" ? "സാധുവായ വാർഷിക വരുമാനം നൽകുക." : "Enter a valid annual family income."}
                                </p>
                              )}
                            </div>
                          )}

                          {activeRequiredFieldKeys.includes("residenceArea") && (
                          <div>
                            <label className="text-[11px] font-bold text-foreground block mb-1">
                              {lang === "ml" ? "താമസ മേഖല *" : "Area of Residence *"}
                            </label>
                            <select
                              value={finalResidenceArea}
                              onChange={(e) => {
                                setFinalResidenceArea(e.target.value);
                                setFinalDetailsSaveNotice(null);
                              }}
                              className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                            >
                              <option value="">{lang === "ml" ? "-- തിരഞ്ഞെടുക്കുക --" : "-- Select --"}</option>
                              <option value="urban">{lang === "ml" ? "നഗരം" : "Urban"}</option>
                              <option value="rural">{lang === "ml" ? "ഗ്രാമം" : "Rural"}</option>
                            </select>
                          </div>
                          )}
                        </div>
                        )}

                        {/* Declaration Checkbox */}
                        <div className="flex items-start gap-2 pt-2 border-t border-border">
                          <input
                            type="checkbox"
                            id="scheme_decl"
                            checked={declarationAccepted}
                            onChange={(e) => {
                              setDeclarationAccepted(e.target.checked);
                              setFinalDetailsSaveNotice(null);
                            }}
                            className="mt-0.5 accent-orange-500 rounded h-4 w-4 cursor-pointer"
                          />
                          <label htmlFor="scheme_decl" className="text-[10.5px] text-muted-foreground leading-tight cursor-pointer">
                            {lang === "ml"
                              ? "ശേഖരിച്ച വിവരങ്ങൾ എന്റെ അറിവിൽ കൃത്യമാണെന്ന് ഞാൻ സ്ഥിരീകരിക്കുന്നു."
                              : "I confirm the collected information is accurate to the best of my knowledge."}
                          </label>
                        </div>

                        {finalDetailsSaveNotice === "incomplete" && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-left dark:border-amber-900 dark:bg-amber-950/30">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-extrabold text-amber-800 dark:text-amber-200">
                                  {lang === "ml" ? "പുരോഗതി സേവ് ചെയ്തു · ശേഖരണം അപൂർണ്ണം" : "Progress saved · Collection incomplete"}
                                </p>
                                <p className="mt-0.5 text-[10px] leading-snug text-amber-700 dark:text-amber-300">
                                  {lang === "ml"
                                    ? "ബാക്കിയുള്ള വിവരങ്ങൾ അടുത്ത സന്ദർശനത്തിൽ പൂർത്തിയാക്കുക."
                                    : "Complete the outstanding items during your next visit."}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => openFollowUpSheet()}
                                  className="mt-2 inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-[10.5px] font-extrabold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-amber-950/40"
                                >
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>
                                    {activeCollectionRecord?.followUpDate
                                      ? (lang === "ml" ? "തുടർനടപടി അപ്ഡേറ്റ് ചെയ്യുക" : "Update Follow-up")
                                      : (lang === "ml" ? "തുടർനടപടി ഷെഡ്യൂൾ ചെയ്യുക" : "Schedule Follow-up")}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {finalDetailsSaveNotice === "invalid" && (
                          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-left dark:border-rose-900 dark:bg-rose-950/30">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                              <div>
                                <p className="text-[11px] font-extrabold text-rose-800 dark:text-rose-200">
                                  {lang === "ml" ? "പുരോഗതി സേവ് ചെയ്തു · തിരുത്തൽ ആവശ്യം" : "Progress saved · Needs correction"}
                                </p>
                                <p className="mt-0.5 text-[10px] leading-snug text-rose-700 dark:text-rose-300">
                                  {lang === "ml"
                                    ? "ചുവപ്പിൽ അടയാളപ്പെടുത്തിയ മൂല്യങ്ങൾ ശരിയാക്കുക. ഇവ ഇതുവരെ ശേഖരിക്കാത്ത വിവരങ്ങളിൽ നിന്ന് വ്യത്യസ്തമാണ്."
                                    : "Correct the values highlighted in red. These are different from information not yet collected."}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 5: Internal Collection Saved View */}
                    {createFlowStep === "collection_saved" && activeCollectionRecord && (
                      <div className="space-y-3 animate-in zoom-in-95 duration-200">
                        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs text-center space-y-2">
                          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                          </div>
                          <h4 className="text-base font-extrabold text-foreground">
                            {lang === "ml" ? "വിവരങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു" : "Details Saved Successfully"}
                          </h4>
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            {lang === "ml"
                              ? "ശേഖരിച്ച വിവരങ്ങൾ ആന്തരികമായി സേവ് ചെയ്തു. ഇത് ഔദ്യോഗിക സ്കീം പോർട്ടലിലേക്ക് സമർപ്പിക്കുന്നതല്ല."
                              : "Collected details have been saved internally. This does not submit the application to an official scheme portal."}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-card px-3 py-2.5 shadow-2xs">
                          <h5 className="min-w-0 truncate text-[14px] font-extrabold text-foreground">
                            {lang === "ml" ? "അപേക്ഷക വിവരങ്ങൾ" : "Applicant Details"}
                          </h5>
                          <div className="mt-1">
                            <div className="flex items-start gap-2 py-1">
                              <UserRound className="mt-0.5 h-[18px] w-[18px] shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />
                              <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-[13px] font-extrabold leading-snug text-foreground">{activeCollectionRecord.applicantName}</p>
                                  <p className="mt-0.5 break-words text-[11.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                                    {lang === "ml"
                                      ? [createMandalam ? getConstituencyName(createMandalam, "ml") : "", createDistrict ? getDistrictName(createDistrict, "ml") : ""].filter(Boolean).join(", ") || "കേരളം"
                                      : [createMandalam.trim(), createDistrict.trim()].filter(Boolean).join(", ") || "Kerala"}
                                  </p>
                                </div>
                                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-extrabold ${getCollectionStatusMeta(activeCollectionRecord.status).className}`}>
                                  {activeCollectionRecord.status === "complete" ? (
                                    <CheckCircle2 className="h-3 w-3 shrink-0" strokeWidth={2.2} />
                                  ) : (
                                    <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={2.2} />
                                  )}
                                  <span>
                                    {activeCollectionRecord.status === "complete"
                                      ? (lang === "ml" ? "രേഖകൾ പരിശോധിച്ചു" : "Document Verified")
                                      : (lang === "ml" ? getCollectionStatusMeta(activeCollectionRecord.status).labelMl : getCollectionStatusMeta(activeCollectionRecord.status).labelEn)}
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800" />
                            <div className="space-y-1.5 py-1">
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-foreground">
                                  <Inbox className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={2} />
                                  {lang === "ml" ? "അപേക്ഷ ലഭിച്ചു" : "Application Received"}
                                </span>
                                <span className="shrink-0 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                  {formatCollectionDateTime(activeCollectionRecord.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-foreground">
                                  <FileCheck
                                    className={`h-3.5 w-3.5 shrink-0 ${activeCollectionRecord.status === "complete" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                                    strokeWidth={2}
                                  />
                                  {activeCollectionRecord.status === "complete"
                                    ? (lang === "ml" ? "രേഖകൾ പരിശോധിച്ചു" : "Document Verified")
                                    : (lang === "ml" ? "രേഖകൾ പരിശോധിക്കുന്നു" : "Document verification pending")}
                                </span>
                                <span className="shrink-0 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                  {formatCollectionDateTime(activeCollectionRecord.updatedAt)}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 rounded-xl border border-[#efe3d3] bg-[#fffcf7] px-3 py-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                              <div className="flex min-w-0 items-center gap-1.5">
                                <h3
                                  className="min-w-0 truncate text-[13px] font-semibold leading-[1.35] text-foreground"
                                  title={lang === "ml" ? activeCollectionRecord.scheme.titleMl : activeCollectionRecord.scheme.titleEn}
                                >
                                  {lang === "ml" ? activeCollectionRecord.scheme.titleMl : activeCollectionRecord.scheme.titleEn}
                                </h3>
                                {getMobileSchemeWebsiteUrl(activeCollectionRecord.scheme.titleEn) && (
                                  <a
                                    href={getMobileSchemeWebsiteUrl(activeCollectionRecord.scheme.titleEn)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={lang === "ml" ? "പദ്ധതിയുടെ ഔദ്യോഗിക വെബ്സൈറ്റ് തുറക്കുക" : "Open official scheme website"}
                                    title={lang === "ml" ? "പദ്ധതിയുടെ ഔദ്യോഗിക വെബ്സൈറ്റ്" : "Open official scheme website"}
                                    className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded text-slate-400 transition-colors before:absolute before:-inset-2.5 before:content-[''] hover:bg-[#fff4e5] hover:text-[#ff5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-orange-300"
                                  >
                                    <ExternalLink className="h-[13px] w-[13px]" strokeWidth={2.1} />
                                  </a>
                                )}
                              </div>
                              <div className="mt-1 flex min-w-0 items-center gap-1.5">
                                <img
                                  src={getMobileCategoryIconSrc(activeCollectionRecord.scheme.categoryEn)}
                                  alt=""
                                  aria-hidden
                                  className="h-3.5 w-3.5 shrink-0 object-contain"
                                />
                                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                  {lang === "ml" ? getSchemeCategoryLabel(activeCollectionRecord.scheme).ml : getSchemeCategoryLabel(activeCollectionRecord.scheme).en}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {createFlowStep === "follow_up_scheduled" && activeCollectionRecord && (
                      <div className="space-y-3 animate-in zoom-in-95 duration-200">
                        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs text-center space-y-2">
                          <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-sm border border-orange-200 dark:border-orange-900">
                            <CalendarDays className="h-8 w-8 stroke-[2.4]" />
                          </div>
                          <h4 className="text-base font-extrabold text-foreground">
                            {lang === "ml" ? "തുടർനടപടി ഷെഡ്യൂൾ ചെയ്തു" : "Follow-up Scheduled"}
                          </h4>
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            {lang === "ml"
                              ? "അപേക്ഷകന്റെ വിവരങ്ങൾ സേവ് ചെയ്തു. അടുത്ത സന്ദർശനത്തിന് ശേഷം ബാക്കിയുള്ള കാര്യങ്ങൾ പൂർത്തിയാക്കുക."
                              : "Applicant details are saved. Complete the remaining items after your next visit."}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-[11px] font-extrabold text-foreground">
                              {lang === "ml" ? "അപേക്ഷക സംഗ്രഹം" : "Applicant Summary"}
                            </h5>
                            <span className={`rounded-full border px-2 py-0.5 text-[9.5px] font-extrabold ${getCollectionStatusMeta(activeCollectionRecord.status).className}`}>
                              {lang === "ml" ? getCollectionStatusMeta(activeCollectionRecord.status).labelMl : getCollectionStatusMeta(activeCollectionRecord.status).labelEn}
                            </span>
                          </div>
                          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[11px]">
                            <span className="text-muted-foreground">{lang === "ml" ? "അപേക്ഷകൻ" : "Applicant"}</span>
                            <span className="font-extrabold text-foreground">{activeCollectionRecord.applicantName}</span>
                            <span className="text-muted-foreground">{lang === "ml" ? "പദ്ധതി" : "Scheme"}</span>
                            <span className="font-bold text-foreground">{lang === "ml" ? activeCollectionRecord.scheme.titleMl : activeCollectionRecord.scheme.titleEn}</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs space-y-3">
                          <h5 className="text-[11px] font-extrabold text-foreground">
                            {lang === "ml" ? "തുടർനടപടി വിവരങ്ങൾ" : "Follow-up Details"}
                          </h5>
                          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[11px]">
                            <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{lang === "ml" ? "തീയതി" : "Follow-up date"}</span>
                            <span className="font-extrabold text-foreground">{formatCollectionDate(activeCollectionRecord.followUpDate)}</span>
                            <span className="flex items-center gap-1 text-muted-foreground"><FileText className="h-3.5 w-3.5" />{lang === "ml" ? "കുറിപ്പുകൾ" : "Notes"}</span>
                            <span className="whitespace-pre-wrap leading-relaxed text-foreground">{activeCollectionRecord.followUpNotes || "—"}</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs space-y-2">
                          <h5 className="text-[11px] font-extrabold text-foreground">
                            {lang === "ml" ? "ബാക്കിയുള്ള കാര്യങ്ങൾ" : "Missing Items"}
                          </h5>
                          <div className="space-y-1.5">
                            {activeCollectionRecord.missingItems.length > 0 ? activeCollectionRecord.missingItems.map((item) => (
                              <div key={item.key} className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/60 px-2.5 py-2 text-[10.5px] text-foreground dark:border-amber-900/60 dark:bg-amber-950/20">
                                {item.kind === "document" ? <FileCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}
                                <span>{lang === "ml" ? item.labelMl : item.labelEn}</span>
                              </div>
                            )) : (
                              <p className="text-[10.5px] text-muted-foreground">
                                {lang === "ml" ? "ബാക്കിയുള്ള കാര്യങ്ങളൊന്നുമില്ല." : "No outstanding items recorded."}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-border bg-muted/50 p-2.5 text-center">
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            {lang === "ml" ? "ശേഖരണ റഫറൻസ്" : "Collection Reference"}
                          </span>
                          <span className="mt-0.5 block font-mono text-xs font-black tracking-wide text-orange-600 dark:text-orange-400">
                            {activeCollectionRecord.reference}
                          </span>
                        </div>

                        <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-3 text-left dark:border-orange-900/60 dark:bg-orange-950/30">
                          <p className="text-[9px] font-extrabold uppercase tracking-wider text-orange-700 dark:text-orange-300">
                            {nextSelectedApplication
                              ? (lang === "ml" ? "അടുത്ത പദ്ധതി" : "Next Selected Scheme")
                              : (lang === "ml" ? "അവലോകനം പൂർത്തിയായി" : "Selected Scheme Review Complete")}
                          </p>
                          <p className="mt-0.5 text-[11px] font-bold text-foreground">
                            {nextSelectedApplication
                              ? (lang === "ml" ? nextSelectedApplication.scheme.titleMl : nextSelectedApplication.scheme.titleEn)
                              : (lang === "ml" ? "എല്ലാ അപേക്ഷകളും പരിശോധിക്കുക" : "Review every application record")}
                          </p>
                          <button
                            type="button"
                            onClick={handleContinueToNextScheme}
                            className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-extrabold text-orange-700 hover:underline cursor-pointer dark:text-orange-300"
                          >
                            {nextSelectedApplication
                              ? (lang === "ml" ? "അടുത്ത പദ്ധതിയിലേക്ക്" : "Continue to Next Scheme")
                              : (lang === "ml" ? "അപേക്ഷകൾ കാണുക" : "View Applications")}
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {createFlowStep === "collection_record" && activeCollectionRecord && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-extrabold text-foreground">{activeCollectionRecord.applicantName}</h4>
                                <p className="truncate text-[10.5px] text-muted-foreground">{lang === "ml" ? activeCollectionRecord.scheme.titleMl : activeCollectionRecord.scheme.titleEn}</p>
                              </div>
                            </div>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9.5px] font-extrabold ${getCollectionStatusMeta(activeCollectionRecord.status).className}`}>
                              {lang === "ml" ? getCollectionStatusMeta(activeCollectionRecord.status).labelMl : getCollectionStatusMeta(activeCollectionRecord.status).labelEn}
                            </span>
                          </div>
                          <p className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-center font-mono text-xs font-black tracking-wide text-orange-600 dark:text-orange-400">
                            {activeCollectionRecord.reference}
                          </p>
                          <div className="space-y-2 text-[10px]">
                            <div className="rounded-xl border border-border bg-background p-2">
                              <span className="block font-semibold text-muted-foreground">
                                {lang === "ml" ? "രേഖകൾ" : "Documents"} ({String(Object.keys(activeCollectionRecordUploadedDocuments).length).padStart(2, "0")})
                              </span>
                              {Object.keys(activeCollectionRecordUploadedDocuments).length > 0 ? (
                                <div className="mt-1.5 space-y-1.5">
                                  {Object.entries(activeCollectionRecordUploadedDocuments).map(([documentId, fileName]) => {
                                    const document = getSchemeRequiredDocuments(activeCollectionRecord.scheme).find((item) => item.id === documentId);
                                    return (
                                      <div key={documentId} className="flex items-start gap-1.5">
                                        <FileCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                        <div className="min-w-0">
                                          <span className="block font-bold leading-snug text-foreground">
                                            {document ? (lang === "ml" ? document.labelMl : document.labelEn) : (lang === "ml" ? "രേഖ" : "Document")}
                                          </span>
                                          <span className="mt-0.5 block break-all text-muted-foreground">{fileName}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="mt-0.5 block font-bold text-foreground">—</span>
                              )}
                            </div>
                            {!isPmKisanScheme(activeCollectionRecord.scheme) && (
                              <div className="rounded-xl border border-border bg-background p-2">
                                <span className="block text-muted-foreground">{lang === "ml" ? "ബാങ്ക് അക്കൗണ്ട്" : "Bank account"}</span>
                                <span className="mt-0.5 block truncate font-bold text-foreground">{activeCollectionRecord.bankAccountNumber ? `•••• ${activeCollectionRecord.bankAccountNumber.slice(-4)}` : "—"}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isPmKisanScheme(activeCollectionRecord.scheme) && activeCollectionRecord.pmKisanDetails && (
                          <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs space-y-2">
                            <div className="flex items-center gap-1.5">
                              <Sprout className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              <h5 className="text-[11px] font-extrabold text-foreground">
                                {lang === "ml" ? "പി.എം-കിസാൻ വിവരങ്ങൾ" : "PM-KISAN details"}
                              </h5>
                            </div>
                            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-[10.5px]">
                              {pmKisanQuestions.map((question) => (
                                <React.Fragment key={question.key}>
                                  <span className="text-muted-foreground">{lang === "ml" ? question.labelMl : question.labelEn}</span>
                                  <span className="text-right font-bold text-foreground">
                                    {activeCollectionRecord.pmKisanDetails
                                      ? getPmKisanAnswerLabel(activeCollectionRecord.pmKisanDetails, question, lang === "ml" ? "ml" : "en")
                                      : "—"}
                                  </span>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs space-y-2">
                          <h5 className="text-[11px] font-extrabold text-foreground">{lang === "ml" ? "തുടർനടപടി" : "Follow-up"}</h5>
                          {activeCollectionRecord.followUpDate ? (
                            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[10.5px]">
                              <span className="text-muted-foreground">{lang === "ml" ? "തീയതി" : "Date"}</span>
                              <span className="font-extrabold text-foreground">{formatCollectionDate(activeCollectionRecord.followUpDate)}</span>
                              <span className="text-muted-foreground">{lang === "ml" ? "കുറിപ്പുകൾ" : "Notes"}</span>
                              <span className="whitespace-pre-wrap text-foreground">{activeCollectionRecord.followUpNotes || "—"}</span>
                            </div>
                          ) : (
                            <p className="text-[10.5px] text-muted-foreground">{lang === "ml" ? "തുടർനടപടി ഇതുവരെ ഷെഡ്യൂൾ ചെയ്തിട്ടില്ല." : "No follow-up scheduled yet."}</p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-[11px] font-extrabold text-foreground">{lang === "ml" ? "ബാക്കിയുള്ള കാര്യങ്ങൾ" : "Outstanding Items"}</h5>
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9.5px] font-extrabold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              {activeCollectionRecord.missingItems.length}
                            </span>
                          </div>
                          {activeCollectionRecord.missingItems.length > 0 ? activeCollectionRecord.missingItems.map((item) => (
                            <div key={item.key} className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/60 px-2.5 py-2 text-[10.5px] dark:border-amber-900/60 dark:bg-amber-950/20">
                              {item.kind === "document" ? <FileCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}
                              <span>{lang === "ml" ? item.labelMl : item.labelEn}</span>
                            </div>
                          )) : (
                            <p className="text-[10.5px] text-muted-foreground">{lang === "ml" ? "ബാക്കിയുള്ള കാര്യങ്ങളൊന്നുമില്ല." : "No outstanding items."}</p>
                          )}
                          {activeCollectionRecord.status === "incomplete" && (
                            <button
                              type="button"
                              onClick={() => openFollowUpSheet(activeCollectionRecord.missingItems)}
                              className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-[10.5px] font-extrabold text-orange-700 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              {activeCollectionRecord.followUpDate
                                ? (lang === "ml" ? "തുടർനടപടി അപ്ഡേറ്റ് ചെയ്യുക" : "Update Follow-up")
                                : (lang === "ml" ? "തുടർനടപടി ഷെഡ്യൂൾ ചെയ്യുക" : "Schedule Follow-up")}
                            </button>
                          )}
                        </div>

                        <p className="px-1 text-center text-[9.5px] leading-relaxed text-muted-foreground">
                          {lang === "ml"
                            ? "ഇത് ആന്തരിക ശേഖരണ രേഖയാണ്. സർക്കാർ പോർട്ടലിലേക്ക് സമർപ്പിച്ചതല്ല."
                            : "This is an internal collection record. It has not been submitted to a government portal."}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3 bg-card p-3 rounded-2xl border border-border shadow-2xs">
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 font-bold">
                        AI
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">SahAI Scheme Assistant</h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "പദ്ധതി സംശയങ്ങൾക്കും സഹായങ്ങൾക്കുമായി സംസാരിക്കൂ." : "Instant assistance for scheme eligibility and application guidance."}
                        </p>
                      </div>
                    </div>
                    <div className="border border-border rounded-xl p-2.5 bg-background text-xs space-y-2">
                      <p className="text-muted-foreground font-medium">
                        {lang === "ml" ? "ഹെൽപ്പ്ഡെസ്ക് നമ്പർ: +91 1800 200 400" : "Helpdesk Helpline: 1800-200-400 (Toll Free)"}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("create");
                          setCreateFlowStep("form");
                        }}
                        className="w-full py-2 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors"
                      >
                        {lang === "ml" ? "നേരിട്ട് അപേക്ഷിക്കുക" : "Apply Directly"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(activeTab as string) === "more" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-border/80 pb-2 px-0.5">
                  <h3 className="font-extrabold text-sm text-foreground">
                    {lang === "ml" ? "കൂടുതൽ സേവനങ്ങൾ" : "More Navigation"}
                  </h3>
                  <span className="text-[10.5px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                    {lang === "ml" ? "മെനു" : "Quick Menu"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* 1. Leaderboard */}
                  <button
                    type="button"
                    onClick={() => setMobileSubPage("leaderboard")}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-all cursor-pointer shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-amber-600 transition-colors">
                          {lang === "ml" ? "ലീഡർബോർഡ്" : "Leaderboard"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "വാർഡ്, പ്രവർത്തക റാങ്കിംഗുകൾ" : "Ward & worker performance rankings"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 2. Beneficiaries */}
                  <button
                    type="button"
                    onClick={() => setMobileSubPage("beneficiaries")}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-all cursor-pointer shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-rose-600 transition-colors">
                          {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "സ്ഥിരീകരിച്ച ഗുണഭോക്താക്കളുടെ വിവരങ്ങൾ" : "Verified benefit recipients list"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 3. Applications */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("applications");
                      setMobileSubPage("none");
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all cursor-pointer shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-blue-600 transition-colors">
                          {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "അപേക്ഷകളും എസ്‌എൽഎ ട്രാക്കിംഗും" : "SLA tracking & service requests"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 4. Schemes */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("schemes");
                      setMobileSubPage("none");
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-all cursor-pointer shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-purple-600 transition-colors">
                          {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "കേന്ദ്ര സർക്കാർ ക്ഷേമപദ്ധതികൾ" : "Central Government welfare schemes"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 5. Settings */}
                  <button
                    type="button"
                    onClick={() => setShowFilterMenu(true)}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                        <Sliders className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-emerald-600 transition-colors">
                          {lang === "ml" ? "ക്രമീകരണങ്ങൾ" : "Settings"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "ആപ്പ് ക്രമീകരണങ്ങളും ഫിൽട്ടറുകളും" : "App scope filters & preferences"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            )
          }
          </>
          )}
          </div>

          {/* Sticky Phone App Bottom Footer Navigation */}
          {activeTab === "create" && createFlowStep !== "applicant_applications" && createFlowStep !== "selected_schemes" && (
            <div className="sticky bottom-0 left-0 right-0 p-3 bg-card/95 backdrop-blur-md border-t border-border z-30 shadow-lg">
              {createFlowStep === "form" && (
                <button
                  type="button"
                  disabled={!isCreateFormValid}
                  onClick={editingApplicationRef ? handleSaveEditedApplicationDetails : handleStartEligibilityCheck}
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all ${
                    isCreateFormValid
                      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-primary text-white active:scale-[0.98] cursor-pointer"
                      : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                  }`}
                >
                  {editingApplicationRef
                    ? (lang === "ml" ? "സേവ് ചെയ്ത് അപ്ഡേറ്റ് ചെയ്യുക" : "Save and Update")
                    : (lang === "ml" ? "സേവ് ചെയ്ത് തുടരുക" : "Save and Continue")}
                </button>
              )}

              {createFlowStep === "checking" && (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-xl font-bold text-xs shadow-md bg-orange-500/80 text-white flex items-center justify-center gap-2 cursor-wait"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>{lang === "ml" ? "യോഗ്യത പരിശോധിക്കുന്നു..." : "Checking eligibility…"}</span>
                </button>
              )}

              {createFlowStep === "eligible_schemes" && (
                <div className="space-y-2">
                  <div className="flex min-h-5 items-center justify-between gap-2 px-1">
                    <span className={`text-[10.5px] font-bold ${selectedEligibleSchemeIds.length > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
                      {lang === "ml"
                        ? `${selectedEligibleSchemeIds.length} പദ്ധതികൾ തിരഞ്ഞെടുത്തു`
                        : `${selectedEligibleSchemeIds.length} scheme${selectedEligibleSchemeIds.length === 1 ? "" : "s"} selected`}
                    </span>
                    {selectedEligibleSchemeIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedEligibleSchemeIds([])}
                        className="text-[10.5px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {lang === "ml" ? "മായ്ക്കുക" : "Clear"}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("schemes");
                        setMobileSubPage("none");
                      }}
                      className="min-h-11 rounded-xl border border-orange-200 bg-card px-2 py-2.5 text-[11px] font-extrabold text-orange-600 transition-colors hover:border-orange-300 hover:bg-orange-50 cursor-pointer dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300 dark:hover:bg-orange-950/60"
                    >
                      {lang === "ml" ? "പദ്ധതികൾ പരിശോധിക്കുക" : "Explore Schemes"}
                    </button>
                    <button
                      type="button"
                      disabled={selectedEligibleSchemeIds.length === 0}
                      onClick={() => startSelectedSchemesCollection(selectedEligibleSchemeIds, "home")}
                      className={`min-h-11 rounded-xl px-3 py-3 font-extrabold text-xs shadow-md transition-all ${
                        selectedEligibleSchemeIds.length > 0
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] cursor-pointer"
                          : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                      }`}
                    >
                      {lang === "ml" ? "അപേക്ഷ സേവ് ചെയ്യുക" : "Save Application"}
                    </button>
                  </div>
                </div>
              )}

              {createFlowStep === "scheme_details" && (
                <div className="space-y-2">
                  <p className={`text-center text-[9.5px] font-bold ${
                    finalDetailsValidation.invalidFields.length > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : finalDetailsValidation.missingItems.length > 0
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-emerald-700 dark:text-emerald-400"
                  }`}>
                    {finalDetailsValidation.invalidFields.length > 0
                      ? (lang === "ml" ? "അടയാളപ്പെടുത്തിയ മൂല്യങ്ങൾ ശരിയാക്കുക" : "Correct the highlighted invalid values")
                      : finalDetailsValidation.missingItems.length > 0
                      ? (lang === "ml"
                          ? `${finalDetailsValidation.missingItems.length} ആവശ്യമായ കാര്യങ്ങൾ ബാക്കിയുണ്ട്`
                          : `${finalDetailsValidation.missingItems.length} required item${finalDetailsValidation.missingItems.length === 1 ? "" : "s"} remaining`)
                      : (lang === "ml" ? "എല്ലാ ആവശ്യമായ വിവരങ്ങളും ശേഖരിച്ചു" : "All required details collected")}
                  </p>
                  <button
                    type="button"
                    onClick={handleFinalDetailsSave}
                    className="min-h-11 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-3 text-xs font-extrabold text-white shadow-md hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {lang === "ml" ? "വിവരങ്ങൾ സേവ് ചെയ്യുക" : "Save Details"}
                  </button>
                </div>
              )}

              {(createFlowStep === "collection_saved" || createFlowStep === "follow_up_scheduled") && activeCollectionRecord && (
                <div className="grid grid-cols-2 gap-2">
                  {currentApplicantApplications.length === 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openCollectionRecordView(
                          activeCollectionRecord,
                          createFlowStep === "follow_up_scheduled" ? "follow_up_scheduled" : "collection_saved"
                        )}
                        className="min-h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-2.5 text-[11px] font-extrabold text-white shadow-md hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        {lang === "ml" ? "രേഖ കാണുക" : "View Record"}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddAnotherApplicant}
                        className="min-h-11 rounded-xl border border-orange-300 bg-orange-50 px-2 py-2.5 text-[11px] font-extrabold text-orange-700 hover:bg-orange-100 transition-colors cursor-pointer dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/70"
                      >
                        {lang === "ml" ? "മറ്റൊരു അപേക്ഷകൻ" : "Add Another Applicant"}
                      </button>
                    </>
                  ) : nextSelectedApplication ? (
                    <>
                      <button
                        type="button"
                        onClick={handleContinueToNextScheme}
                        className="min-h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-2.5 text-[11px] font-extrabold text-white shadow-md hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        {lang === "ml" ? "അടുത്ത പദ്ധതി" : "Next Scheme"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateFlowStep("applicant_applications")}
                        className="min-h-11 rounded-xl border border-orange-300 bg-orange-50 px-2 py-2.5 text-[11px] font-extrabold text-orange-700 hover:bg-orange-100 transition-colors cursor-pointer dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/70"
                      >
                        {lang === "ml" ? "അപേക്ഷകൾ കാണുക" : "View Applications"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setCreateFlowStep("applicant_applications")}
                        className="min-h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-2.5 text-[11px] font-extrabold text-white shadow-md hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        {lang === "ml" ? "അപേക്ഷകൾ കാണുക" : "View Applications"}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddAnotherApplicant}
                        className="min-h-11 rounded-xl border border-orange-300 bg-orange-50 px-2 py-2.5 text-[11px] font-extrabold text-orange-700 hover:bg-orange-100 transition-colors cursor-pointer dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/70"
                      >
                        {lang === "ml" ? "മറ്റൊരു അപേക്ഷകൻ" : "Add Another Applicant"}
                      </button>
                    </>
                  )}
                </div>
              )}

              {createFlowStep === "collection_record" && activeCollectionRecord && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleEditActiveCollectionRecord}
                    className="min-h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-2.5 text-[11px] font-extrabold text-white shadow-md hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {lang === "ml" ? "രേഖ തിരുത്തുക" : "Edit Record"}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAnotherApplicant}
                    className="min-h-11 rounded-xl border border-orange-300 bg-orange-50 px-2 py-2.5 text-[11px] font-extrabold text-orange-700 hover:bg-orange-100 transition-colors cursor-pointer dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/70"
                  >
                    {lang === "ml" ? "മറ്റൊരു അപേക്ഷകൻ" : "Add Another Applicant"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Nav Bar - Hidden in Guest Mode */}
          {!isGuest && !isMobileAuthOpen && activeTab !== "create" && mobileSubPage !== "app_detail" && (mobileSubPage === "none" || mobileSubPage === "leaderboard" || mobileSubPage === "beneficiaries" || mobileSubPage === "applications") && (
            <AdminMobileAppBottomNav
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setMobileSubPage("none");
                setShowMoreMenu(false);
              }}
            />
          )}

          {/* Guest Footer Action Bar */}
          {isGuest && !isGuestEligibilityOpen && !isMobileAuthOpen && (
            <div className="absolute bottom-0 left-0 right-0 z-50 rounded-b-[2rem] border-t border-slate-200/90 bg-white px-3 pb-3 pt-2.5 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={openGuestEligibility}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#0b3b66] px-4 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(11,59,102,0.25)] transition-all hover:bg-[#092f52] active:scale-[0.99] cursor-pointer"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <SearchCheck className="h-4.5 w-4.5 stroke-[2.4]" />
                </span>
                <span>{lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}</span>
              </button>
            </div>
          )}

          {/* Floating SahAI Help Chatbot Button - Guest (public) mode only */}
          {isGuest && !isGuestEligibilityOpen && !isMobileAuthOpen && (
            <button
              type="button"
              onClick={() => setIsSahAiOpen(true)}
              className="absolute bottom-24 right-3.5 z-40 flex items-center gap-1.5 p-1.5 pl-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40 group"
              title="Help / SahAI Assistant"
            >
              <span className="text-[10.5px] font-black tracking-tight">{lang === "ml" ? "സഹായം" : "Help"}</span>
              <div className="h-7 w-7 rounded-full overflow-hidden border border-white/80 bg-white/20 shrink-0">
                <img src={sahaiAvatar} alt="SahAI Assistant" className="h-full w-full object-cover" />
              </div>
            </button>
          )}

          {/* Tracking ID bottom sheet */}
          {isTrackingSheetOpen && (
            <div
              className="absolute inset-0 z-[70] flex items-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 rounded-[36px]"
              onClick={() => setIsTrackingSheetOpen(false)}
            >
              <div
                className="w-full rounded-t-3xl border-t border-border bg-background p-4 pb-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-extrabold text-[#0F172A] dark:text-white">
                    {selectedApplicationRecord?.trackingId
                      ? lang === "ml"
                        ? "ട്രാക്കിംഗ് ഐഡി എഡിറ്റ് ചെയ്യുക"
                        : "Edit tracking ID"
                      : lang === "ml"
                        ? "ട്രാക്കിംഗ് ഐഡി ചേർക്കുക"
                        : "Add tracking ID"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsTrackingSheetOpen(false)}
                    aria-label={lang === "ml" ? "അടയ്ക്കുക" : "Close"}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5 stroke-[2]" />
                  </button>
                </div>

                <label
                  htmlFor="tracking-id-input"
                  className="mt-3 block text-[11.5px] font-medium text-slate-500 dark:text-slate-400"
                >
                  {lang === "ml" ? "ട്രാക്കിംഗ് ഐഡി" : "Tracking ID"}
                </label>
                <input
                  id="tracking-id-input"
                  type="text"
                  value={trackingIdDraft}
                  onChange={(event) => setTrackingIdDraft(event.target.value)}
                  placeholder={lang === "ml" ? "ട്രാക്കിംഗ് ഐഡി നൽകുക" : "Enter tracking ID"}
                  autoFocus
                  className="mt-1.5 flex h-11 w-full rounded-xl border border-[#f1ddc7] bg-[#fffaf3] px-3.5 text-[13.5px] font-semibold text-[#0F172A] outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-[#ff5500] focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />

                <div className="mt-4 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsTrackingSheetOpen(false)}
                    className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-[13px] font-extrabold text-[#0F172A] transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {lang === "ml" ? "റദ്ദാക്കുക" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTrackingId}
                    disabled={!trackingIdDraft.trim()}
                    className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#ff5500] text-[13px] font-extrabold text-white shadow-xs transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400 cursor-pointer"
                  >
                    {lang === "ml" ? "സേവ് ചെയ്യുക" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tracking ID saved success dialog */}
          {isTrackingSuccessOpen && (
            <div
              className="absolute inset-0 z-[80] flex items-center justify-center rounded-[36px] bg-black/60 px-2.5 py-3 backdrop-blur-xs animate-in fade-in duration-200"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tracking-success-title"
            >
              <div className="relative max-h-full w-full max-w-[366px] overflow-y-auto rounded-[22px] bg-white px-4 pb-3 pt-3 shadow-2xl animate-in zoom-in-95 duration-200 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setIsTrackingSuccessOpen(false)}
                  aria-label={lang === "ml" ? "അടയ്ക്കുക" : "Close"}
                  className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-4 w-4 stroke-[2]" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className="relative mt-1 flex h-[136px] w-[136px] items-center justify-center rounded-3xl bg-white dark:bg-white/95">
                    <Sparkles className="absolute -left-2 top-5 h-4 w-4 rotate-12 text-orange-400" />
                    <Sparkles className="absolute -right-2 top-8 h-3.5 w-3.5 -rotate-12 text-emerald-500" />
                    <img
                      src={readyToSubmit3dIcon}
                      alt=""
                      aria-hidden
                      className="h-[128px] w-[128px] scale-125 object-contain"
                    />
                  </div>
                  <h2
                    id="tracking-success-title"
                    className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-[#0b3b66] dark:text-white"
                  >
                    {lang === "ml" ? "മികച്ച ജോലി!" : "Great work!"}
                  </h2>
                  <p className="mt-1.5 max-w-[310px] text-[14.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                    {lang === "ml"
                      ? `${successApplicantName} ഒരു പദ്ധതിക്ക് അപേക്ഷിക്കാൻ നിങ്ങൾ സഹായിച്ചു.`
                      : `You helped ${successApplicantName} apply for a scheme.`}
                  </p>
                </div>

                <div className="mt-4 overflow-hidden rounded-[14px] border border-[#f3e7d7] bg-[#fffaf3] dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="grid grid-cols-[96px_1fr] items-center gap-3 border-b border-[#efe3d3] px-4 py-3 dark:border-slate-700">
                    <span className="text-[13.5px] font-medium text-slate-500 dark:text-slate-400">
                      {lang === "ml" ? "പദ്ധതി" : "Scheme"}
                    </span>
                    <span className="min-w-0 text-left text-[14px] font-semibold leading-snug text-[#0F172A] dark:text-white">
                      {successSchemeName}
                    </span>
                  </div>
                  <div className="grid grid-cols-[96px_1fr] items-center gap-3 px-4 py-3">
                    <span className="text-[13.5px] font-medium text-slate-500 dark:text-slate-400">
                      {lang === "ml" ? "നില" : "Status"}
                    </span>
                    <span className="min-w-0 text-left text-[14px] font-semibold text-[#0F172A] dark:text-white">
                      {lang === "ml" ? successStatusLabelMl : successStatusLabelEn}
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 flex items-start justify-center gap-2.5 text-center">
                  <Star className="mt-0.5 h-4 w-4 shrink-0 fill-[#ff5500] text-[#ff5500]" />
                  <div>
                    <p className="text-[13px] font-medium leading-snug text-slate-600 dark:text-slate-300">
                      {lang === "ml"
                        ? "നിങ്ങളുടെ സംഭാവന രേഖപ്പെടുത്തിയിട്ടുണ്ട്."
                        : "Your contribution has been recorded."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTrackingSuccessOpen(false);
                        setActiveTab("overview");
                        setMobileSubPage("leaderboard");
                      }}
                      className="mt-1 inline-flex items-center gap-0.5 text-[13px] font-extrabold text-[#ff5500] hover:text-orange-600 cursor-pointer"
                    >
                      {lang === "ml" ? "ലീഡർബോർഡ് കാണുക" : "View Leaderboard"}
                      <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTrackingSuccessOpen(false)}
                  className="mt-3 flex h-11 w-full items-center justify-center rounded-lg bg-[#ff5500] text-[14px] font-extrabold text-white shadow-xs transition-colors hover:bg-orange-600 cursor-pointer active:scale-[0.99]"
                >
                  {lang === "ml" ? "അപേക്ഷാ വിശദാംശങ്ങളിലേക്ക് മടങ്ങുക" : "Back To Application Details"}
                </button>
              </div>
            </div>
          )}

          {/* Confirm scheme decision bottom sheet */}
          {isDecisionSheetOpen && (
            <div
              className="absolute inset-0 z-[72] flex items-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 rounded-[36px]"
              onClick={handleCloseDecisionSheet}
            >
              <div
                className="w-full rounded-t-3xl border-t border-border bg-background p-4 pb-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-extrabold text-[#0F172A] dark:text-white">
                      {lang === "ml" ? "സ്കീം തീരുമാനം സ്ഥിരീകരിക്കുക" : "Confirm scheme decision"}
                    </h3>
                    <p className="mt-1 text-[11.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                      {lang === "ml"
                        ? "അപേക്ഷയുടെ ഔദ്യോഗിക തീരുമാനം എന്താണ്?"
                        : "What is the application’s official decision?"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseDecisionSheet}
                    aria-label={lang === "ml" ? "അടയ്ക്കുക" : "Close"}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5 stroke-[2]" />
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => setDecisionChoice("approved")}
                    aria-pressed={decisionChoice === "approved"}
                    className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                      decisionChoice === "approved"
                        ? "border-[#ff5500] bg-[#fff7ec] dark:border-orange-700 dark:bg-orange-950/40"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        decisionChoice === "approved"
                          ? "bg-[#ff5500] text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4 stroke-[2]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-extrabold text-[#0F172A] dark:text-white">
                        {lang === "ml" ? "അംഗീകരിച്ചു" : "Approved"}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
                        {lang === "ml" ? "അപേക്ഷ അംഗീകരിച്ചു" : "Application approved by the scheme"}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionChoice("rejected")}
                    aria-pressed={decisionChoice === "rejected"}
                    className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                      decisionChoice === "rejected"
                        ? "border-[#ff5500] bg-[#fff7ec] dark:border-orange-700 dark:bg-orange-950/40"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        decisionChoice === "rejected"
                          ? "bg-[#ff5500] text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <XCircle className="h-4 w-4 stroke-[2]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-extrabold text-[#0F172A] dark:text-white">
                        {lang === "ml" ? "നിരസിച്ചു" : "Rejected"}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
                        {lang === "ml" ? "അപേക്ഷ നിരസിച്ചു" : "Application rejected by the scheme"}
                      </span>
                    </span>
                  </button>
                </div>

                {decisionChoice === "rejected" && (
                  <div className="mt-3">
                    <label
                      htmlFor="decision-notes-input"
                      className="block text-[11.5px] font-medium text-slate-500 dark:text-slate-400"
                    >
                      {lang === "ml" ? "കാരണം / കുറിപ്പുകൾ" : "Reason / Notes"}
                    </label>
                    <textarea
                      id="decision-notes-input"
                      rows={3}
                      value={decisionNotes}
                      onChange={(event) => setDecisionNotes(event.target.value)}
                      placeholder={
                        lang === "ml" ? "നിരസിക്കാനുള്ള കാരണം രേഖപ്പെടുത്തുക" : "Record the reason for rejection"
                      }
                      className="mt-1.5 w-full resize-none rounded-xl border border-[#f1ddc7] bg-[#fffaf3] px-3.5 py-2.5 text-[13px] font-medium text-[#0F172A] outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-[#ff5500] focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div className="mt-4 flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseDecisionSheet}
                    className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-[13px] font-extrabold text-[#0F172A] transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {lang === "ml" ? "റദ്ദാക്കുക" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDecision}
                    disabled={!decisionChoice}
                    className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#ff5500] text-[13px] font-extrabold text-white shadow-xs transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400 cursor-pointer"
                  >
                    {lang === "ml" ? "തീരുമാനം സേവ് ചെയ്യുക" : "Save Decision"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Document preview bottom sheet */}
          {previewDocument && (() => {
            const meta = mobileDocumentKindMeta[previewDocument.kind];
            const PreviewIcon = meta.Icon;
            return (
              <div
                className="absolute inset-0 z-[75] flex items-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 rounded-[36px]"
                onClick={() => setPreviewDocument(null)}
              >
                <div
                  className="w-full rounded-t-3xl border-t border-border bg-background p-4 pb-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[15px] font-extrabold text-[#0F172A] dark:text-white">
                      {lang === "ml" ? "രേഖാ പ്രിവ്യൂ" : "Document preview"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPreviewDocument(null)}
                      aria-label={lang === "ml" ? "അടയ്ക്കുക" : "Close"}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <X className="h-4.5 w-4.5 stroke-[2]" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.tileClass}`}>
                      <PreviewIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-[#0F172A] dark:text-white">{previewDocument.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <span className={`rounded px-1 py-px text-[9px] font-extrabold uppercase tracking-wide ${meta.chipClass}`}>
                          {meta.label}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{previewDocument.size}</span>
                        <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3 stroke-[3]" />
                          {lang === "ml" ? "അപ്‌ലോഡ്" : "Uploaded"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40">
                    <div className="flex h-[112px] w-[86px] flex-col gap-1.5 rounded-md border border-slate-200 bg-white p-2.5 shadow-xs dark:border-slate-700 dark:bg-slate-900">
                      <span className={`mb-0.5 inline-flex w-fit rounded px-1 py-px text-[8px] font-extrabold uppercase tracking-wide ${meta.chipClass}`}>
                        {meta.label}
                      </span>
                      <span className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
                      <span className="h-1.5 w-5/6 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <span className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
                      <span className="h-1.5 w-2/3 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <span className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                  <p className="mt-2 text-center text-[10.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                    {lang === "ml"
                      ? "ഡെമോ പ്രിവ്യൂവിൽ യഥാർത്ഥ ഫയൽ ലഭ്യമല്ല."
                      : "The original file isn't available in this demo preview."}
                  </p>

                  <div className="mt-3 flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPreviewDocument(null)}
                      className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-[13px] font-extrabold text-[#0F172A] transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
                    >
                      {lang === "ml" ? "അടയ്ക്കുക" : "Close"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadDocument}
                      className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#ff5500] text-[13px] font-extrabold text-white shadow-xs transition-colors hover:bg-orange-600 cursor-pointer"
                    >
                      <Download className="h-4 w-4 stroke-[2.5]" />
                      {lang === "ml" ? "ഡൗൺലോഡ്" : "Download"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {documentActionNotice && (
            <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[90] flex justify-center px-6">
              <span className="rounded-full bg-slate-900/90 px-3.5 py-2 text-center text-[11px] font-semibold text-white shadow-lg animate-in fade-in duration-150">
                {documentActionNotice}
              </span>
            </div>
          )}

          {/* SahAI Help Chatbot Overlay Modal */}
          {isSahAiOpen && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
              <div className="bg-background border-t border-border rounded-t-3xl p-4 max-h-[85%] h-[480px] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full overflow-hidden border border-orange-400 p-0.5 bg-orange-50">
                      <img src={sahaiAvatar} alt="SahAI" className="h-full w-full object-cover rounded-full" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
                        SahAI Assistant
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        {lang === "ml" ? "24x7 ക്ഷേമ പദ്ധതി സഹായം" : "24x7 Welfare Scheme Assistance"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSahAiOpen(false)}
                    className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="h-7 w-7 rounded-full overflow-hidden border border-orange-300 shrink-0 bg-orange-50">
                      <img src={sahaiAvatar} alt="SahAI" className="h-full w-full object-cover rounded-full" />
                    </div>
                    <div className="p-3 rounded-2xl rounded-tl-xs bg-muted/70 text-foreground text-[11px] leading-relaxed">
                      {lang === "ml"
                        ? "നമസ്കാരം! വികസിത കേരളം സഹായ പേജിലേക്ക് സ്വാഗതം. പദ്ധതികൾ, അപേക്ഷാ യോഗ്യതകൾ അല്ലെങ്കിൽ സഹായ കേന്ദ്രങ്ങളെക്കുറിച്ച് ചോദിക്കൂ."
                        : "Namaskaram! Welcome to Vikasita Keralam Help Desk. Ask me any question about schemes, eligibility, or local help centers."}
                    </div>
                  </div>
                </div>

                {/* Quick Suggestions & Input */}
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <button
                      type="button"
                      onClick={() => { if (isGuest) openGuestEligibility(); }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 hover:bg-orange-200 transition-colors shrink-0"
                    >
                      {lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}
                    </button>
                    <button
                      type="button"
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 hover:bg-orange-200 transition-colors shrink-0"
                    >
                      {lang === "ml" ? "അപേക്ഷിക്കുന്ന വിധം" : "How to Apply"}
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder={lang === "ml" ? "നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക..." : "Type your query here..."}
                      className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-border bg-muted/40 focus:bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                    />
                    <button
                      type="button"
                      className="absolute right-2 p-1 text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Follow-up Bottom Sheet */}
          {isFollowUpSheetOpen && (
            <div
              className="absolute inset-0 z-[70] flex items-end overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 rounded-[36px]"
              onClick={() => setIsFollowUpSheetOpen(false)}
            >
              <div
                className="flex max-h-[90%] w-full flex-col overflow-hidden rounded-t-3xl border-t border-border bg-background shadow-2xl animate-in slide-in-from-bottom duration-300"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-border px-4 pb-2.5 pt-2.5">
                  <div>
                    <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-muted-foreground/30" />
                    <h3 className="max-w-[240px] text-sm font-extrabold leading-tight text-foreground">
                      {lang === "ml"
                        ? `തുടർനടപടി ഷെഡ്യൂൾ ചെയ്യുക — ${activeCollectionRecord ? activeCollectionRecord.scheme.titleMl : "പദ്ധതി"}`
                        : `Schedule Follow-up — ${activeCollectionRecord ? activeCollectionRecord.scheme.titleEn : "Scheme"}`}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFollowUpSheetOpen(false)}
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Close follow-up sheet"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3 [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-[11px] font-extrabold text-amber-800 dark:text-amber-200">
                          {lang === "ml" ? "പുരോഗതി സേവ് ചെയ്തു · ശേഖരണം അപൂർണ്ണം" : "Progress saved · Collection incomplete"}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-snug text-amber-700 dark:text-amber-300">
                          {lang === "ml" ? "അടുത്ത സന്ദർശനത്തിൽ ഇനിപ്പറയുന്ന കാര്യങ്ങൾ ശേഖരിക്കുക." : "Collect the following items during your next visit."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {activeCollectionRecord && (
                    <div className="rounded-xl border border-border bg-muted/40 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-extrabold text-foreground">{activeCollectionRecord.applicantName}</p>
                          <p className="truncate text-[9.5px] text-muted-foreground">{lang === "ml" ? activeCollectionRecord.scheme.titleMl : activeCollectionRecord.scheme.titleEn}</p>
                        </div>
                        <span className="shrink-0 font-mono text-[9px] font-bold text-orange-600 dark:text-orange-400">{activeCollectionRecord.reference}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-[11px] font-extrabold text-foreground">
                      {lang === "ml" ? "ബാക്കിയുള്ള കാര്യങ്ങൾ" : "Missing items"}
                    </h4>
                    {followUpMissingItems.length > 0 ? (
                      <div className="space-y-1.5">
                        {followUpMissingItems.map((item) => (
                          <div key={item.key} className="flex items-start gap-2 rounded-xl border border-border bg-card px-2.5 py-2 text-[10.5px] text-foreground shadow-2xs">
                            {item.kind === "document" ? <FileCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600" /> : <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}
                            <span>{lang === "ml" ? item.labelMl : item.labelEn}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-[10.5px] text-muted-foreground">
                        {lang === "ml" ? "ബാക്കിയുള്ള കാര്യങ്ങളൊന്നുമില്ല." : "No outstanding items recorded."}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-foreground">
                      {lang === "ml" ? "തുടർനടപടി തീയതി *" : "Follow-up Date *"}
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-orange-600" />
                      <input
                        type="date"
                        value={followUpDate}
                        min={getLocalIsoDate()}
                        onChange={(event) => {
                          setFollowUpDate(event.target.value);
                          setFollowUpDateError("");
                        }}
                        className={`w-full rounded-xl border bg-background py-2.5 pl-8 pr-2.5 text-xs text-foreground outline-none focus:ring-1 ${
                          followUpDateError
                            ? "border-rose-400 focus:ring-rose-400"
                            : "border-border focus:ring-orange-500"
                        }`}
                      />
                    </div>
                    {followUpDateError && (
                      <p className="mt-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                        {followUpDateError === "past"
                          ? (lang === "ml" ? "ഇന്നോ അതിനുശേഷമുള്ള തീയതി തിരഞ്ഞെടുക്കുക." : "Choose today or a future date.")
                          : (lang === "ml" ? "തുടർനടപടി തീയതി നിർബന്ധമാണ്." : "Follow-up date is required.")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-foreground">
                      {lang === "ml" ? "കുറിപ്പുകൾ" : "Notes"}
                    </label>
                    <textarea
                      rows={4}
                      value={followUpNotes}
                      onChange={(event) => setFollowUpNotes(event.target.value)}
                      placeholder={lang === "ml" ? "ശേഖരണ നിർദ്ദേശങ്ങൾ രേഖപ്പെടുത്തുക..." : "Add collection instructions..."}
                      className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="shrink-0 border-t border-border bg-background px-4 pb-5 pt-3">
                  <button
                    type="button"
                    onClick={handleSaveFollowUp}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-xs font-extrabold text-white shadow-md transition-all hover:from-orange-600 hover:to-amber-600 active:scale-[0.98]"
                  >
                    {lang === "ml" ? "തുടർനടപടി സേവ് ചെയ്യുക" : "Save Follow-up"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Home Bar Indicator */}
          {deviceModel === "iphone" && (
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-28 bg-foreground/30 rounded-full z-50 pointer-events-none" />
          )}

          {/* More Navigation Menu Popup Modal */}
          {showMoreMenu && (
            <div 
              className="absolute inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 rounded-[36px] overflow-hidden"
              onClick={() => setShowMoreMenu(false)}
            >
              <div 
                className="w-full rounded-t-[28px] bg-white dark:bg-slate-900 p-4 shadow-2xl transition-all border-t border-x border-amber-200/80 dark:border-amber-900/60 animate-in slide-in-from-bottom-full duration-300 flex flex-col space-y-3 pb-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Sheet Handle */}
                <div className="w-9 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-1 mb-1 shrink-0" />
                
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <span className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <LayoutGrid className="h-4 w-4 text-[#ea580c]" />
                    <span>{lang === "ml" ? "കൂടുതൽ മെനു" : "More Options"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMoreMenu(false)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Popup Options List */}
                <div className="space-y-2 pt-1">
                  {/* Option 1: Leaderboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSubPage("leaderboard");
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-300 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-amber-600 transition-colors">
                          {lang === "ml" ? "ലീഡർബോർഡ്" : "Leaderboard"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground leading-tight">
                          {lang === "ml" ? "വാർഡ്, പ്രവർത്തക റാങ്കിംഗുകൾ" : "Ward & worker rankings"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Option 2: Beneficiaries */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSubPage("beneficiaries");
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-rose-600 transition-colors">
                          {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground leading-tight">
                          {lang === "ml" ? "സ്ഥിരീകരിച്ച ഗുണഭോക്താക്കളുടെ വിവരങ്ങൾ" : "Verified beneficiaries list"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Option 3: Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setShowFilterMenu(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                        <Sliders className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-emerald-600 transition-colors">
                          {lang === "ml" ? "ക്രമീകരണങ്ങൾ" : "Settings"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground leading-tight">
                          {lang === "ml" ? "ഭൂമിശാസ്ത്ര ഫിൽട്ടറുകളും ക്രമീകരണങ്ങളും" : "App scope filters & preferences"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Date & Period Picker Bottom Sheet Modal (In-App Popup) */}
          <DatePickerModal
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={(period, customLabel) => {
              setSelectedPeriod(period);
              if (customLabel) setPeriodCustomLabel(customLabel);
            }}
            inlineInApp={true}
          />

          {/* Interactive Filter Modal Overlay (Same popup UI as Calendar Modal) */}
          {showFilterMenu && (
            <div 
              className="absolute inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 rounded-[36px] overflow-hidden"
              onClick={() => {
                      setAppliedGeoMode(geoMode);
                      if (geoMode === "assembly") {
                        setAppliedDistrict(draftDistrict);
                        setAppliedMandalam(draftMandalam);
                        setAppliedBooth(draftBooth);
                        if (draftBooth !== "all") {
                          setFilterGeoScope("booth");
                          setSelectedDistrict(draftDistrict);
                          setSelectedMandalam(draftMandalam);
                          setSelectedBooth(draftBooth);
                        } else if (draftMandalam !== "all") {
                          setFilterGeoScope("mandalam");
                          setSelectedDistrict(draftDistrict);
                          setSelectedMandalam(draftMandalam);
                        } else if (draftDistrict !== "all") {
                          setFilterGeoScope("district");
                          setSelectedDistrict(draftDistrict);
                        } else {
                          setFilterGeoScope("state");
                        }
                      } else {
                        setAppliedLBType(draftLBType);
                        setAppliedLBDistrict(draftLBDistrict);
                        setAppliedLocalBody(draftLocalBody);
                        setAppliedWard(draftWard);
                        if (draftWard !== "all") {
                          setFilterGeoScope("booth");
                        } else if (draftLocalBody !== "all") {
                          setFilterGeoScope("area");
                        } else if (draftLBDistrict !== "all") {
                          setFilterGeoScope("district");
                        } else {
                          setFilterGeoScope("state");
                        }
                      }
                      setShowFilterMenu(false);
                    }}
            >
              <div 
                className="w-full rounded-t-[28px] bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xl transition-all border-t border-x border-amber-200/80 dark:border-amber-900/60 animate-in slide-in-from-bottom-full duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Sheet Handle */}
                <div className="w-9 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-1 mb-2 shrink-0" />
                
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-amber-200/60 dark:border-amber-900/40 shrink-0">
                  <span className="text-sm sm:text-base font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-[#ff5500]" />
                    <span>{lang === "ml" ? "ഫിൽട്ടറുകൾ" : "Filters"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFilterMenu(false)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Filter Inputs Area - Clean layout with generous spacing */}
                <div className="space-y-3.5 my-2.5 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Geography / Scope Filter + Cascading Selection Controls */}
                    <div className="col-span-2 flex flex-col gap-3 p-3 rounded-xl bg-amber-100/60 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/80">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1">
                          <span>{lang === "ml" ? "ഭൂമിശാസ്ത്രം / മേഖല" : "GEOGRAPHY SCOPE"}</span>
                        </label>
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/80 px-2 py-0.5 rounded-full uppercase">
                          {geoMode === "assembly" ? "Assembly / Booth" : "Local Bodies"}
                        </span>
                      </div>

                      {/* Mode Segmented Tab Selector */}
                      <div className="flex rounded-lg bg-amber-200/60 dark:bg-amber-950/60 p-0.5 border border-amber-300/80 dark:border-amber-800/80">
                        <button
                          type="button"
                          onClick={() => setGeoMode("assembly")}
                          className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            geoMode === "assembly"
                              ? "bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-100 shadow-2xs"
                              : "text-amber-800 dark:text-amber-300 hover:text-amber-950"
                          }`}
                        >
                          {lang === "ml" ? "അസംബ്ലി / ബൂത്ത്" : "Assembly / Booth"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setGeoMode("local_body")}
                          className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            geoMode === "local_body"
                              ? "bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-100 shadow-2xs"
                              : "text-amber-800 dark:text-amber-300 hover:text-amber-950"
                          }`}
                        >
                          {lang === "ml" ? "തദ്ദേശ സ്ഥാപനങ്ങൾ" : "Local Bodies"}
                        </button>
                      </div>

                      {/* Mode 1: Assembly / Booth */}
                      {geoMode === "assembly" && (
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* District */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "ജില്ല" : "District"}
                            </label>
                            <select
                              value={draftDistrict}
                              onChange={(e) => {
                                const newDist = e.target.value;
                                setDraftDistrict(newDist);
                                setDraftMandalam("all");
                                setDraftBooth("all");
                              }}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ ജില്ലകളും" : "All Districts"}</option>
                              {districts.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d[lang]}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Mandalam */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "മണ്ഡലം" : "Mandalam"}
                            </label>
                            <select
                              value={draftMandalam}
                              disabled={draftDistrict === "all"}
                              onChange={(e) => {
                                setDraftMandalam(e.target.value);
                                setDraftBooth("all");
                              }}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ മണ്ഡലങ്ങളും" : "All Mandalams"}</option>
                              {(draftDistrict === "all"
                                ? constituencies
                                : constituencies.filter((c) => c.districtId === draftDistrict)
                              ).map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c[lang]}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Booth */}
                          <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "ബൂത്ത്" : "Booth"}
                            </label>
                            <select
                              value={draftBooth}
                              disabled={draftMandalam === "all"}
                              onChange={(e) => setDraftBooth(e.target.value)}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ ബൂത്തുകളും" : "All Booths"}</option>
                              {[101, 102, 103, 104, 105, 106, 107, 108, 109, 110].map((num) => (
                                <option key={num} value={`booth_${num}`}>
                                  {lang === "ml" ? `ബൂത്ത് #${num}` : `Booth #${num}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Mode 2: Local Bodies */}
                      {geoMode === "local_body" && (
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* District */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "ജില്ല" : "District"}
                            </label>
                            <select
                              value={draftLBDistrict}
                              onChange={(e) => {
                                setDraftLBDistrict(e.target.value);
                                setDraftLocalBody("all");
                                setDraftWard("all");
                              }}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ ജില്ലകളും" : "All Districts"}</option>
                              {districts.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d[lang]}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Local Body Type */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "തദ്ദേശ സ്ഥാപന തരം" : "Local Body Type"}
                            </label>
                            <select
                              value={draftLBType}
                              onChange={(e) => {
                                setDraftLBType(e.target.value);
                                setDraftLocalBody("all");
                                setDraftWard("all");
                              }}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ തരങ്ങളും" : "All Types"}</option>
                              <option value="corporation">{lang === "ml" ? "കോർപ്പറേഷൻ" : "Corporation"}</option>
                              <option value="municipality">{lang === "ml" ? "മുനിസിപ്പാലിറ്റി" : "Municipality"}</option>
                              <option value="panchayat">{lang === "ml" ? "ഗ്രാമ പഞ്ചായത്ത്" : "Grama Panchayat"}</option>
                            </select>
                          </div>

                          {/* Local Body */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "തദ്ദേശ സ്ഥാപനം" : "Local Body"}
                            </label>
                            <select
                              value={draftLocalBody}
                              onChange={(e) => {
                                setDraftLocalBody(e.target.value);
                                setDraftWard("all");
                              }}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ തദ്ദേശ സ്ഥാപനങ്ങളും" : "All Local Bodies"}</option>
                              {panchayats
                                .filter((p) => (draftLBDistrict === "all" || p.districtId === draftLBDistrict) && (draftLBType === "all" || p.type === draftLBType))
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p[lang]}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Ward */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "വാർഡ്" : "Ward"}
                            </label>
                            <select
                              value={draftWard}
                              disabled={draftLocalBody === "all"}
                              onChange={(e) => setDraftWard(e.target.value)}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ വാർഡുകളും" : "All Wards"}</option>
                              {wards.map((w) => (
                                <option key={w.id} value={w.id}>
                                  {lang === "ml" ? `വാർഡ് ${w.label}` : `Ward ${w.label}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scheme Category Filter */}
                    <div className="col-span-2 flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>{lang === "ml" ? "പദ്ധതി വിഭാഗം" : "Scheme Category"}</span>
                        <span className="text-[10px] text-slate-500">Default: All Categories</span>
                      </label>
                      <select
                        value={appSchemeCategoryFilter}
                        onChange={(e) => setAppSchemeCategoryFilter(e.target.value)}
                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ വിഭാഗങ്ങളും" : "All Categories"}</option>
                        <option value="agriculture">{lang === "ml" ? "കൃഷി" : "Agriculture"}</option>
                        <option value="education">{lang === "ml" ? "വിദ്യാഭ്യാസം" : "Education"}</option>
                        <option value="health">{lang === "ml" ? "ആരോഗ്യം" : "Health"}</option>
                        <option value="housing">{lang === "ml" ? "ഭവനം" : "Housing"}</option>
                        <option value="pension_welfare">{lang === "ml" ? "പെൻഷൻ & ക്ഷേമം" : "Pension & Welfare"}</option>
                        <option value="women_welfare">{lang === "ml" ? "വനിതാ ക്ഷേമം" : "Women Welfare"}</option>
                        <option value="employment">{lang === "ml" ? "തൊഴിൽ" : "Employment"}</option>
                        <option value="msme">{lang === "ml" ? "എം.എസ്.എം.ഇ & ബിസിനസ്" : "MSME & Business"}</option>
                      </select>
                    </div>

                    {/* Application Date Filter */}
                    <div className="col-span-2 flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>{lang === "ml" ? "അപേക്ഷാ തീയതി" : "Application Date"}</span>
                        <span className="text-[10px] text-slate-500">Default: All Dates</span>
                      </label>
                      <select
                        value={appDateFilter}
                        onChange={(e) => setAppDateFilter(e.target.value)}
                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ തീയതികളും" : "All Dates"}</option>
                        <option value="today">{lang === "ml" ? "ഇന്ന്" : "Today"}</option>
                        <option value="7days">{lang === "ml" ? "കഴിഞ്ഞ 7 ദിവസം" : "Last 7 Days"}</option>
                        <option value="30days">{lang === "ml" ? "കഴിഞ്ഞ 30 ദിവസം" : "Last 30 Days"}</option>
                        <option value="custom">{lang === "ml" ? "കസ്റ്റം പരിധി" : "Custom Range"}</option>
                      </select>

                      {appDateFilter === "custom" && (
                        <div className="grid grid-cols-2 gap-2 pt-1.5">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">From Date</span>
                            <input
                              type="date"
                              value={appCustomStartDate}
                              onChange={(e) => setAppCustomStartDate(e.target.value)}
                              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">To Date</span>
                            <input
                              type="date"
                              value={appCustomEndDate}
                              onChange={(e) => setAppCustomEndDate(e.target.value)}
                              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar: Reset & Apply Filters */}
                <div className="pt-2.5 mt-2 border-t border-amber-200/80 dark:border-amber-900/60 shrink-0 z-20 bg-white dark:bg-slate-900 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterGeoScope("state");
                      setFilterScheme("all");
                      setFilterSchemeCategory("all");
                      setFilterSchemeType("all");
                      setFilterDepartment("all");
                      setFilterPerformance("all");
                      setActiveDistrictFilter("all");
                      setAppSchemeCategoryFilter("all");
                      setAppAssistanceStatusFilter("all");
                      setAppDateFilter("all");
                      setAppCustomStartDate("");
                      setAppCustomEndDate("");
                    }}
                    className="w-1/3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold text-xs py-3 shadow-xs hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>{lang === "ml" ? "റീസെറ്റ്" : "Reset"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFilterMenu(false)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white font-black text-xs sm:text-sm py-3 shadow-lg hover:from-amber-600 hover:to-orange-700 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    <span>{lang === "ml" ? "ഫിൽട്ടറുകൾ പ്രയോഗിക്കുക" : "Apply Filters"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Address Searchable Bottom Sheet Overlay Modal */}
          {activeAddressSheet && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
              <div className="bg-background border-t border-border rounded-t-3xl p-4 max-h-[80%] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="font-extrabold text-sm text-foreground">
                    {activeAddressSheet === "district" && (lang === "ml" ? "ജില്ല തിരഞ്ഞെടുക്കുക" : "Select District")}
                    {activeAddressSheet === "localBody" && (lang === "ml" ? "തദ്ദേശ സ്ഥാപനം തിരഞ്ഞെടുക്കുക" : "Select Local Body")}
                    {activeAddressSheet === "ward" && (lang === "ml" ? "വാർഡ് തിരഞ്ഞെടുക്കുക" : "Select Ward")}
                    {activeAddressSheet === "mandalam" && (lang === "ml" ? "നിയമസഭാ മണ്ഡലം തിരഞ്ഞെടുക്കുക" : "Select Assembly Mandalam")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAddressSheet(null);
                      setAddressSheetSearch("");
                    }}
                    className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="py-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={addressSheetSearch}
                      onChange={(e) => setAddressSheetSearch(e.target.value)}
                      placeholder={lang === "ml" ? "തിരയുക..." : "Search..."}
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-border bg-muted/40 focus:bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                    />
                    {addressSheetSearch && (
                      <button
                        type="button"
                        onClick={() => setAddressSheetSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Options List */}
                <div className="overflow-y-auto flex-1 space-y-1 pr-1 min-h-[200px]">
                  {activeAddressSheet === "district" &&
                    districts
                      .filter((d) =>
                        d.en.toLowerCase().includes(addressSheetSearch.toLowerCase()) ||
                        d.ml.includes(addressSheetSearch)
                      )
                      .map((d) => {
                        const isSelected = createDistrict === d.en;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleDistrictSelect(d.en)}
                            className={`w-full p-3 text-left rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 text-white font-bold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span>{lang === "ml" ? d.ml : d.en}</span>
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}

                  {activeAddressSheet === "localBody" &&
                    panchayats
                      .filter((p) => {
                        const distObj = districts.find((d) => d.en === createDistrict);
                        const isDistrictMatch = !distObj || p.districtId === distObj.id;
                        const isTypeMatch = !createLocalBodyType || p.type === createLocalBodyType;
                        const isSearchMatch =
                          p.en.toLowerCase().includes(addressSheetSearch.toLowerCase()) ||
                          p.ml.includes(addressSheetSearch);
                        return isDistrictMatch && isTypeMatch && isSearchMatch;
                      })
                      .map((p) => {
                        const isSelected = createLocalBody === p.en;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleLocalBodySelect(p.en)}
                            className={`w-full p-3 text-left rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 text-white font-bold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span>{lang === "ml" ? p.ml : p.en}</span>
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}

                  {activeAddressSheet === "ward" &&
                    getWardsForLocalBody(createLocalBody)
                      .filter(
                        (w) =>
                          w.nameEn.toLowerCase().includes(addressSheetSearch.toLowerCase()) ||
                          w.nameMl.includes(addressSheetSearch) ||
                          w.number.toString().includes(addressSheetSearch)
                      )
                      .map((w) => {
                        const wardDisplay = `Ward ${w.number} - ${lang === "ml" ? w.nameMl : w.nameEn}`;
                        const isSelected = createWard === wardDisplay;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => handleWardSelect(w)}
                            className={`w-full p-3 text-left rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 text-white font-bold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <div>
                              <span className="font-bold">Ward {w.number}: </span>
                              <span>{lang === "ml" ? w.nameMl : w.nameEn}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}

                  {activeAddressSheet === "mandalam" &&
                    constituencies
                      .filter((c) => {
                        const distObj = districts.find((d) => d.en === createDistrict);
                        const isDistrictMatch = !distObj || c.districtId === distObj.id;
                        const isSearchMatch =
                          c.en.toLowerCase().includes(addressSheetSearch.toLowerCase()) ||
                          c.ml.includes(addressSheetSearch);
                        return isDistrictMatch && isSearchMatch;
                      })
                      .map((c) => {
                        const isSelected = createMandalam === c.en;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleMandalamSelect(c.en)}
                            className={`w-full p-3 text-left rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 text-white font-bold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span>{lang === "ml" ? c.ml : c.en}</span>
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
