import { useState, useRef, useEffect } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { Globe, Check } from "lucide-react";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={popoverRef}>
      {/* Mobile-only Globe Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card text-foreground hover:bg-muted transition-colors sm:hidden shrink-0"
        title={lang === "ml" ? "ഭാഷ തിരഞ്ഞെടുക്കുക" : "Select language"}
        aria-label="Toggle language menu"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Mobile Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-36 rounded-xl border border-border bg-card p-1.5 shadow-lg space-y-1 sm:hidden">
          <button
            type="button"
            onClick={() => {
              setLang("ml");
              setIsOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              lang === "ml" ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-muted"
            }`}
          >
            <span>മലയാളം</span>
            {lang === "ml" && <Check className="h-3.5 w-3.5 text-primary" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setLang("en");
              setIsOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              lang === "en" ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-muted"
            }`}
          >
            <span>English</span>
            {lang === "en" && <Check className="h-3.5 w-3.5 text-primary" />}
          </button>
        </div>
      )}

      {/* Desktop Full Pill Switcher */}
      <div className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border bg-card px-1 py-1 text-xs font-medium shrink-0">
        <Globe className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
        <button
          type="button"
          onClick={() => setLang("ml")}
          className={`rounded-full px-2.5 py-1 transition ${
            lang === "ml" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          മലയാളം
        </button>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`rounded-full px-2.5 py-1 transition ${
            lang === "en" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
}