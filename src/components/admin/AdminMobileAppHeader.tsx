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
  LogIn,
  Info,
  PhoneCall,
  Search,
  Mail,
  MapPin,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { Link } from "@tanstack/react-router";
import { AdminMobileTab } from "./AdminMobileAppBottomNav";

interface AdminMobileAppHeaderProps {
  onNavigateTab?: (tab: AdminMobileTab) => void;
  onOpenUsers?: () => void;
  onOpenNotifications?: () => void;
  userRole?: "state_admin" | "party_worker";
  onSwitchRole?: (role: "state_admin" | "party_worker") => void;
  onLogout?: () => void;
  isGuest?: boolean;
  onLoginClick?: () => void;
  onMenuOpenChange?: (isOpen: boolean) => void;
}

export function AdminMobileAppHeader({
  onNavigateTab,
  onOpenUsers,
  onOpenNotifications,
  userRole = "state_admin",
  onSwitchRole,
  onLogout,
  isGuest = false,
  onLoginClick,
  onMenuOpenChange,
}: AdminMobileAppHeaderProps = {}) {
  const { lang, setLang } = useLang();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const setMenuOpen = (open: boolean) => {
    setIsMenuOpen(open);
    if (onMenuOpenChange) {
      onMenuOpenChange(open);
    }
  };
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [guestSearchQuery, setGuestSearchQuery] = useState("");
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <header className="relative z-40 w-full bg-[#FFFDF9] dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
      {/* Standard Header Bar Height (60px / h-15) */}
      <div className="flex h-15 items-center justify-between px-2.5">
        {/* Left Side: 3-line Menu Button & Logo */}
        <div className="flex items-center gap-0.5 min-w-0 flex-1 mr-1">
          <button
            onClick={() => {
              setMenuOpen(true);
              setIsProfileOpen(false);
            }}
            className="flex p-0.5 items-center justify-center rounded-md text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all shrink-0 focus:outline-none cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-6 w-6 text-slate-900 dark:text-white stroke-[2.2]" />
          </button>

          {/* Brand Logo */}
          <div className="flex items-center min-w-0 shrink">
            <img
              src="/images/vikasita-logo.png"
              alt="Vikasita Keralam"
              className="h-11 sm:h-12 w-auto object-contain max-w-[210px] sm:max-w-[240px] shrink-0 drop-shadow-2xs"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Language Switcher Pill */}
          <button
            onClick={() => setLang(lang === "ml" ? "en" : "ml")}
            className="flex h-9 px-2.5 items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs shrink-0 focus:outline-none cursor-pointer"
            aria-label="Switch Language"
            title={lang === "ml" ? "Switch to English" : "മലയാളത്തിലേക്ക് മാറ്റുക"}
          >
            {lang === "ml" ? "മല" : "EN"}
          </button>

          {isGuest ? (
            /* Log in Button for Guest Mode */
            <button
              onClick={onLoginClick}
              className="flex h-9 px-3 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{lang === "ml" ? "ലോഗിൻ" : "Log in"}</span>
            </button>
          ) : (
            <>
              {/* Notification Bell Button */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    if (onOpenNotifications) {
                      onOpenNotifications();
                    }
                    setMenuOpen(false);
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
                    setMenuOpen(false);
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
                  <div className="absolute right-0 top-14 z-50 w-[250px] rounded-2xl border border-amber-200/80 bg-white dark:bg-slate-900 p-3.5 shadow-2xl space-y-3 animate-in fade-in-50 zoom-in-95 text-foreground">
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
                      <div className="min-w-0 flex-1">
                        {userRole === "party_worker" ? (
                          <div className="space-y-0.5">
                            {/* Line 1: Name + Role Badge */}
                            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                              <h3 className="text-[15px] font-semibold text-[#0a0f1d] dark:text-slate-100 leading-tight">
                                Dhyan M S
                              </h3>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/60 whitespace-nowrap">
                                {lang === "ml" ? "ഏരിയ പ്രസിഡന്റ്" : "Area President"}
                              </span>
                            </div>
                            {/* Line 2: Location */}
                            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-tight truncate">
                              {lang === "ml" ? "കഴക്കൂട്ടം, തിരുവനന്തപുരം" : "Kazhakkoottam, Trivandrum"}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <h3 className="font-bold text-xs text-foreground">
                              Jayasurya
                            </h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                              {lang === "ml" ? "സംസ്ഥാന ഭരണം" : "State Administration"}
                            </p>
                          </div>
                        )}
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
                        className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-foreground hover:bg-amber-50 dark:hover:bg-slate-800 font-medium transition-all cursor-pointer"
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

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          if (onLogout) {
                            onLogout();
                          } else {
                            try {
                              localStorage.removeItem("vk-admin-session");
                              sessionStorage.clear();
                            } catch (e) {
                              console.error(e);
                            }
                            window.location.replace("/");
                          }
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="h-4 w-4 text-red-500" /> {lang === "ml" ? "ലോഗ് ഔട്ട്" : "Log out"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Guest Mobile Navigation Sidebar Drawer (DesignLib style) */}
      {isGuest && isMenuOpen && (
        <div className="absolute top-0 left-0 w-full h-[680px] z-50 flex bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-[85%] max-w-[300px] h-full bg-white dark:bg-slate-900 p-4 flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-slate-800 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-4">
              {/* Header Logo & Close Button */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <img
                  src="/images/vikasita-logo.png"
                  alt="Vikasita Keralam"
                  className="h-12 sm:h-14 w-auto max-w-[220px] object-contain drop-shadow-2xs"
                />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="h-5.5 w-5.5 stroke-[2.2]" />
                </button>
              </div>

              {/* GENERAL Section (DesignLib style) */}
              <div className="space-y-1">
                <div className="px-1 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {lang === "ml" ? "പ്രധാന മെനു" : "GENERAL"}
                </div>

                {/* 1. Home */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onNavigateTab) onNavigateTab("overview");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800/80 font-bold text-xs transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-3">
                    <Home className="h-4.5 w-4.5 text-orange-500 stroke-[2]" />
                    <span>{lang === "ml" ? "ഹോം" : "Home"}</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2. About Us */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowAboutModal(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800/80 font-bold text-xs transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-3">
                    <Info className="h-4.5 w-4.5 text-orange-500 stroke-[2]" />
                    <span>{lang === "ml" ? "ഞങ്ങളെക്കുറിച്ച്" : "About Us"}</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 3. Contact Us */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowContactModal(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800/80 font-bold text-xs transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-3">
                    <PhoneCall className="h-4.5 w-4.5 text-orange-500 stroke-[2]" />
                    <span>{lang === "ml" ? "ബന്ധപ്പെടുക" : "Contact Us"}</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 4. Login / Sign Up */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onLoginClick) onLoginClick();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800/80 font-bold text-xs transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-3">
                    <LogIn className="h-4.5 w-4.5 text-orange-500 stroke-[2]" />
                    <span>{lang === "ml" ? "ലോഗിൻ / സൈൻ അപ്പ്" : "Login / Sign Up"}</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* SERVICES & ACCESS Section */}
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="px-1 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {lang === "ml" ? "സേവനങ്ങൾ" : "SERVICES & ACCESS"}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onNavigateTab) onNavigateTab("schemes");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800/80 font-bold text-xs transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-3">
                    <Layers className="h-4.5 w-4.5 text-orange-500 stroke-[2]" />
                    <span>{lang === "ml" ? "പദ്ധതികൾ കാണുക" : "Explore Schemes"}</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-center space-y-1">
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Vikasita Keralam Portal
              </p>
              <a
                href="https://wayvida.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200 transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Powered by</span>
                <strong className="font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600">Wayvida</strong>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Logged-in Full Mobile Navigation Drawer */}
      {!isGuest && isMenuOpen && (
        <div className="absolute top-0 left-0 w-full h-[680px] z-50 flex bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-[85%] max-w-[320px] h-full bg-white dark:bg-slate-900 p-4 flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-slate-800 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-3.5">
              {/* Logo & Close Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <img
                  src="/images/vikasita-logo.png"
                  alt="Vikasita Keralam"
                  className="h-12 sm:h-14 w-auto max-w-[220px] object-contain block drop-shadow-2xs"
                />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Profile Card Header */}
              <div className="flex items-center gap-3 pt-1">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full ring-2 ring-orange-300 p-0.5 bg-orange-100 shrink-0 overflow-hidden">
                  <img
                    src={
                      userRole === "party_worker"
                        ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                        : "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                    }
                    alt={userRole === "party_worker" ? "Dhyan M S" : "Jayasurya"}
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {userRole === "party_worker" ? (
                    <div className="space-y-0.5">
                      {/* Line 1: Name + Role Badge */}
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <h3 className="text-[15px] font-semibold text-[#0a0f1d] dark:text-slate-100 leading-tight">
                          Dhyan M S
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/60 whitespace-nowrap">
                          {lang === "ml" ? "ഏരിയ പ്രസിഡന്റ്" : "Area President"}
                        </span>
                      </div>
                      {/* Line 2: Location */}
                      <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-tight truncate">
                        {lang === "ml" ? "കഴക്കൂട്ടം, തിരുവനന്തപുരം" : "Kazhakkoottam, Trivandrum"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        Jayasurya
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        State Administration
                      </p>
                      <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                        <ShieldCheck className="h-2.5 w-2.5" /> State Admin
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Links */}
              <nav className="space-y-1 text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onNavigateTab) onNavigateTab("overview");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <Home className="h-4 w-4 text-orange-500" /> {lang === "ml" ? "ഡാഷ്‌ബോർഡ്" : "Dashboard"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onNavigateTab) onNavigateTab("users");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-orange-500" /> {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onOpenUsers) onOpenUsers();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <Users2 className="h-4 w-4 text-orange-500" /> {lang === "ml" ? "ഉപയോക്താക്കൾ" : "Users"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onNavigateTab) onNavigateTab("schemes");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <Layers className="h-4 w-4 text-orange-500" /> {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onNavigateTab) onNavigateTab("applications");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-orange-500" /> {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onNavigateTab) onNavigateTab("janashabdam");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <Megaphone className="h-4 w-4 text-orange-500" /> {lang === "ml" ? "ജനശബ്ദം" : "Janashabdam"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </nav>
            </div>

            {/* Bottom Info Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 pb-2 text-center space-y-1.5">
              <p className="text-[12.5px] font-extrabold text-slate-700 dark:text-slate-300">
                Vikasita Keralam Portal
              </p>
              <div className="text-[11.5px] text-slate-400 dark:text-slate-500 font-medium flex items-center justify-center gap-1">
                <span>Powered by</span>
                <a
                  href="https://wayvida.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Wayvida
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {showAboutModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-amber-200/80 dark:border-slate-800 space-y-3.5 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                  <Info className="h-4.5 w-4.5 stroke-[2.2]" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {lang === "ml" ? "ഞങ്ങളെക്കുറിച്ച്" : "About Vikasita Keralam"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {lang === "ml"
                  ? "വികസിത കേരളം - വികസനവും ക്ഷേമവും എല്ലാവരിലേക്കും."
                  : "Vikasita Keralam - Empowering citizens through accessible welfare."}
              </p>
              <p>
                {lang === "ml"
                  ? "കേന്ദ്ര സർക്കാരിന്റെ പ്രധാനപ്പെട്ട എല്ലാ ക്ഷേമപദ്ധതികളുടെയും വിവരങ്ങൾ, യോഗ്യതാ പരിശോധന, അപേക്ഷാ മാർഗ്ഗനിർദ്ദേശങ്ങൾ എന്നിവ ഒറ്റ പ്ലാറ്റ്‌ഫോമിൽ ലഭ്യമാക്കുന്നു."
                  : "Providing unified access to Central Government welfare schemes, eligibility verification, and application guidance for citizens across all 14 districts of Kerala."}
              </p>
              <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/50 space-y-1">
                <span className="block text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">
                  {lang === "ml" ? "ലക്ഷ്യം" : "OUR MISSION"}
                </span>
                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {lang === "ml"
                    ? "ഓരോ അർഹനായ വ്യക്തിക്കും തങ്ങളുടെ ആനുകൂല്യങ്ങൾ തടസ്സമില്ലാതെ എത്തിക്കുക."
                    : "Ensuring zero delay in connecting every eligible citizen with their entitled welfare benefits."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAboutModal(false)}
              className="w-full h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {lang === "ml" ? "മനസ്സിലായി" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-amber-200/80 dark:border-slate-800 space-y-3.5 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                  <PhoneCall className="h-4.5 w-4.5 stroke-[2.2]" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {lang === "ml" ? "ബന്ധപ്പെടുക" : "Contact Us"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <PhoneCall className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-900 dark:text-white text-xs">
                    {lang === "ml" ? "ടോൾ ഫ്രീ ഹെൽപ്പ്‌ലൈൻ" : "Toll-Free Helpline"}
                  </span>
                  <span className="font-mono font-extrabold text-orange-600 dark:text-orange-400 text-xs">
                    1800-200-400
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <Mail className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-900 dark:text-white text-xs">
                    {lang === "ml" ? "ഇമെയിൽ പിന്തുണ" : "Email Support"}
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                    support@vikasitakeralam.gov.in
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-900 dark:text-white text-xs">
                    {lang === "ml" ? "പ്രധാന ഓഫീസ്" : "Main Office"}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] leading-tight block">
                    {lang === "ml"
                      ? "കഴക്കൂട്ടം, തിരുവനന്തപുരം, കേരളം 695581"
                      : "Kazhakoottam, Thiruvananthapuram, Kerala 695581"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="w-full h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {lang === "ml" ? "അടയ്ക്കുക" : "Close"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
