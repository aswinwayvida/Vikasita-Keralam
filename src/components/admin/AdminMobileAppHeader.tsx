import React, { useState } from "react";
import {
  Menu,
  Bell,
  X,
  ChevronRight,
  ShieldCheck,
  Settings,
  Globe,
  Home,
  FileText,
  Users,
  Layers,
  ListTodo,
  BarChart2,
  Users2,
  Megaphone,
  User,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { Link } from "@tanstack/react-router";
import { AdminMobileTab } from "./AdminMobileAppBottomNav";

interface AdminMobileAppHeaderProps {
  onNavigateTab?: (tab: AdminMobileTab) => void;
  onOpenNotifications?: () => void;
  userRole?: "state_admin" | "party_worker";
  onSwitchRole?: (role: "state_admin" | "party_worker") => void;
}

export function AdminMobileAppHeader({
  onNavigateTab,
  onOpenNotifications,
  userRole = "state_admin",
  onSwitchRole,
}: AdminMobileAppHeaderProps = {}) {
  const { lang, setLang } = useLang();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="relative z-40 w-full bg-[#FFFDF9] dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
      {/* Standard Header Bar Height (60px / h-15) */}
      <div className="flex h-15 items-center justify-between px-2.5">
        {/* Left Side: 3-line Menu Button & Logo positioned tight right next to it */}
        <div className="flex items-center gap-0.5 min-w-0 flex-1 mr-1">
          {/* Clean 3-line Hamburger Menu Button (No Circle) */}
          <button
            onClick={() => {
              setIsMenuOpen(true);
              setIsProfileOpen(false);
            }}
            className="flex p-0.5 items-center justify-center rounded-md text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all shrink-0 focus:outline-none cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-6 w-6 text-slate-900 dark:text-white stroke-[2.2]" />
          </button>

          {/* Brand Logo directly adjacent to menu icon with minimal gap */}
          <div className="flex items-center min-w-0 shrink">
            <img
              src="/images/vikasita-logo.png"
              alt="Vikasita Keralam"
              className="h-11 sm:h-12 w-auto object-contain max-w-[210px] sm:max-w-[240px] shrink-0 drop-shadow-2xs"
            />
          </div>
        </div>

        {/* Right Controls: Uniform size controls with tight 4px gap [EN] [🔔4] [👤] */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Clear Compact Language Switcher Pill */}
          <button
            onClick={() => setLang(lang === "ml" ? "en" : "ml")}
            className="flex h-9 px-2.5 items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs shrink-0 focus:outline-none cursor-pointer"
            aria-label="Switch Language"
            title={lang === "ml" ? "Switch to English" : "മലയാളത്തിലേക്ക് മാറ്റുക"}
          >
            {lang === "ml" ? "മല" : "EN"}
          </button>

          {/* Simplified Notification Bell Button */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                if (onOpenNotifications) {
                  onOpenNotifications();
                }
                setIsMenuOpen(false);
                setIsProfileOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs focus:outline-none shrink-0 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-slate-700 dark:text-slate-200 stroke-[2]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-500 text-[8.5px] font-black text-white border border-white dark:border-slate-900 shadow-2xs">
                4
              </span>
            </button>
          </div>

          {/* User Profile Circle Control */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsMenuOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-300/80 dark:border-slate-700 bg-[#FFEDD5] text-[#F97316] hover:bg-orange-200 active:scale-95 transition-all shadow-2xs focus:outline-none shrink-0 overflow-hidden cursor-pointer"
              aria-label="User Profile"
              title={userRole === "party_worker" ? "Dhyan M S Profile" : "Jayasurya Profile"}
            >
              <img
                src={
                  userRole === "party_worker"
                    ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    : "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                }
                alt={userRole === "party_worker" ? "Dhyan M S" : "Jayasurya"}
                className="h-full w-full object-cover rounded-full"
              />
            </button>

            {/* Profile Popover */}
            {isProfileOpen && (
              <div className="absolute right-0 top-14 z-50 w-[240px] rounded-2xl border border-amber-200/80 bg-white dark:bg-slate-900 p-3.5 shadow-2xl space-y-3 animate-in fade-in-50 zoom-in-95 text-foreground">
                <div className="flex items-center gap-2.5 border-b border-amber-100 dark:border-slate-800 pb-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEDD5] text-[#F97316] font-bold shadow-2xs overflow-hidden shrink-0">
                    <img
                      src={
                        userRole === "party_worker"
                          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                          : "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                      }
                      alt={userRole === "party_worker" ? "Dhyan M S" : "Jayasurya"}
                      className="h-full w-full object-cover rounded-xl"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-foreground">
                      {userRole === "party_worker" ? "Dhyan M S" : "Jayasurya"}
                    </h3>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />{" "}
                      {userRole === "party_worker"
                        ? lang === "ml"
                          ? "പാർട്ടി ലീഡർ"
                          : "Party Leader"
                        : lang === "ml"
                        ? "സംസ്ഥാന ഭരണം"
                        : "State Administration"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  {/* Role Switcher Option */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchRole) {
                        onSwitchRole(userRole === "state_admin" ? "party_worker" : "state_admin");
                      }
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-foreground hover:bg-orange-50 dark:hover:bg-slate-800 font-medium transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-[#F97316]" />
                      <span>{lang === "ml" ? "റോൾ മാറ്റുക" : "Switch View"}</span>
                    </span>
                    <span className="text-[9.5px] font-bold uppercase bg-orange-100 dark:bg-orange-950/60 text-[#F97316] px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800">
                      {userRole === "state_admin" ? (lang === "ml" ? "പാർട്ടി പ്രവർത്തകൻ" : "Party Worker") : (lang === "ml" ? "അഡ്മിൻ" : "ADMIN")}
                    </span>
                  </button>
                  <button
                    onClick={() => setLang(lang === "ml" ? "en" : "ml")}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-foreground hover:bg-amber-50 dark:hover:bg-slate-800 font-medium transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" /> {lang === "ml" ? "ഭാഷ" : "Language"}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-[#FFEDD5] text-[#F97316] px-2 py-0.5 rounded-md">
                      {lang === "ml" ? "മലയാളം" : "English"}
                    </span>
                  </button>
                  <Link
                    to="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-foreground hover:bg-amber-50 dark:hover:bg-slate-800 font-medium transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" /> {lang === "ml" ? "ക്രമീകരണങ്ങൾ" : "Settings"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Mobile Navigation Drawer (Exact Match to User Reference Screenshot) */}
      {isMenuOpen && (
        <div className="absolute top-0 left-0 w-full h-[680px] z-50 flex bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-[85%] max-w-[320px] h-full bg-[#FDFBF7] dark:bg-slate-900 p-4 flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-slate-800 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-4">
              {/* Profile Card Header */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-orange-300 p-0.5 bg-orange-100 shrink-0 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                      alt="Jayasurya"
                      className="h-full w-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Jayasurya</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">State Administration</p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                      <ShieldCheck className="h-2.5 w-2.5" /> State Admin
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close Menu"
                >
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* GROUP 1: WORKSPACE */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase px-1">WORKSPACE</p>
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-1 shadow-2xs space-y-0.5">
                  {/* Dashboard (Active Highlight) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab("overview");
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold bg-orange-50/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <Home className="h-4.5 w-4.5 text-orange-500" />
                      Dashboard
                    </span>
                    <ChevronRight className="h-4 w-4 text-orange-500" />
                  </button>

                  {/* Applications */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab("applications");
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <FileText className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
                      Applications
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  {/* Citizens */}
                  <Link
                    to="/admin/beneficiaries"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <span className="flex items-center gap-3">
                      <Users className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
                      Citizens
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  {/* Schemes */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab("schemes");
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <Layers className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
                      Schemes
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* GROUP 2: MANAGEMENT */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase px-1">MANAGEMENT</p>
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-1 shadow-2xs space-y-0.5">
                  {/* Tasks & Escalations */}
                  <Link
                    to="/admin/issues"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <span className="flex items-center gap-3">
                      <ListTodo className="h-4.5 w-4.5 text-orange-500" />
                      Tasks & Escalations
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  {/* Analytics & Reports */}
                  <Link
                    to="/admin/public-pulse"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <span className="flex items-center gap-3">
                      <BarChart2 className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
                      Analytics & Reports
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  {/* Team Management */}
                  <Link
                    to="/admin/volunteers"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <span className="flex items-center gap-3">
                      <Users2 className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
                      Team Management
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  {/* Announcements */}
                  <Link
                    to="/admin/notifications"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <span className="flex items-center gap-3">
                      <Megaphone className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
                      Announcements
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* GROUP 3: ACCOUNT */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase px-1">ACCOUNT</p>
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-1 shadow-2xs space-y-0.5">
                  {/* My Profile */}
                  <div className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                    <span className="flex items-center gap-3">
                      <User className="h-4.5 w-4.5 text-orange-500" />
                      My Profile
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>

                  {/* Settings */}
                  <Link
                    to="/admin/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <span className="flex items-center gap-3">
                      <Settings className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
                      Settings
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  {/* Help & Support */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab("helpdesk");
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="h-4.5 w-4.5 text-orange-500" />
                      Help & Support
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>

                {/* Logout Button */}
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-1 shadow-2xs mt-2">
                  <Link
                    to="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <LogOut className="h-4.5 w-4.5 text-red-500" />
                      Logout
                    </span>
                    <ChevronRight className="h-4 w-4 text-red-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Backdrop Dismiss */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="flex-1 cursor-pointer"
            aria-label="Dismiss menu backdrop"
          />
        </div>
      )}
    </header>
  );
}