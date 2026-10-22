import { useLang } from "@/i18n/LanguageProvider";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-1 py-1 text-xs font-medium">
      <Globe className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
      <button
        onClick={() => setLang("ml")}
        className={`rounded-full px-2.5 py-1 transition ${lang === "ml" ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"}`}
      >
        മലയാളം
      </button>
      <button
        onClick={() => setLang("en")}
        className={`rounded-full px-2.5 py-1 transition ${lang === "en" ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"}`}
      >
        English
      </button>
    </div>
  );
}