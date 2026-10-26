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
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { Link } from "@tanstack/react-router";
import { AdminMobileTab } from "./AdminMobileAppBottomNav";

interface AdminMobileAppHeaderProps {
  onNavigateTab?: (tab: AdminMobileTab) => void;
  onOpenNotifications?: () => void;
  userRole?: "state_admin" | "party_worker";
  onSwitchRole?: (role: "state_admin" | "party_worker") => void;
  onLogout?: () => void;
  isGuest?: boolean;
  onLoginClick?: () => void;
}

export function AdminMobileAppHeader({
  onNavigateTab,
  onOpenNotifications,
  userRole = "state_admin",
  onSwitchRole,
  onLogout,
  isGuest = false,
  onLoginClick,
}: AdminMobileAppHeaderProps = {}) {
  const { lang, setLang } = useLang();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="relative z-40 w-full bg-[#FFFDF9] dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
      {/* Standard Header Bar Height (60px / h-15) */}
      <div className="flex h-15 items-center justify-between px-2.5">
        {/* Left Side: 3-line Menu Button (Hidden in Guest Mode) & Logo */}
        <div className="flex items-center gap-0.5 min-w-0 flex-1 mr-1">
          {!isGuest && (
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
          )}

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

      {/* Full Mobile Navigation Drawer */}
      {!isGuest && isMenuOpen && (
        <div className="absolute top-0 left-0 w-full h-[680px] z-50 flex bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-[85%] max-w-[320px] h-full bg-[#FDFBF7] dark:bg-slate-900 p-4 flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-slate-800 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-4">
              {/* Profile Card Header */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-orange-300 p-0.5 bg-orange-100 shrink-0 overflow-hidden">
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
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {userRole === "party_worker" ? "Dhyan M S" : "Jayasurya"}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {userRole === "party_worker" ? "Party Worker / Leader" : "State Administration"}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                      <ShieldCheck className="h-2.5 w-2.5" /> {userRole === "party_worker" ? "Party Leader" : "State Admin"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="space-y-1 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
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
                    setIsMenuOpen(false);
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
                    setIsMenuOpen(false);
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
                    setIsMenuOpen(false);
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
                    setIsMenuOpen(false);
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

            {/* Bottom Actions */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
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
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold transition-all cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 text-red-500" /> {lang === "ml" ? "ലോഗ് ഔട്ട്" : "Log out"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
