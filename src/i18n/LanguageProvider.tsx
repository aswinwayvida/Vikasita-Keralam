import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ml, type Dict } from "./ml";
import { en } from "./en";
import type { Lang } from "./types";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
};

const LanguageContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "vk_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ml");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "ml" || stored === "en") setLangState(stored);
    } catch {/* noop */}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {/* noop */}
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
    }
  };

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang,
    t: lang === "ml" ? ml : en,
  }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}