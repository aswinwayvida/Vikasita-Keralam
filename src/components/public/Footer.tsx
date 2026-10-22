import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { BrandLogo } from "./BrandLogo";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { FEATURES } from "@/config/features";

export function Footer() {
  const { t, lang } = useLang();
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="saffron-top-bar w-full" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandLogo className="h-20 w-auto max-w-full object-contain drop-shadow-sm sm:h-24 sm:max-w-[360px] md:h-28 md:max-w-[420px]" />
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{t.footer.disclaimer}</p>
        </div>
        <div>
          <h4 className="section-underline mb-4 text-sm font-semibold uppercase tracking-wide">
            {t.footer.quickLinks}
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/schemes" className="hover:text-primary">
                {t.nav.schemes}
              </Link>
            </li>
            {FEATURES.janashabdam && (
              <li>
                <Link to="/janashabdam" className="hover:text-primary">
                  {t.nav.janashabdam}
                </Link>
              </li>
            )}
            <li>
              <Link to="/eligibility" className="hover:text-primary">
                {t.nav.eligibility}
              </Link>
            </li>
            <li>
              <Link to="/helpdesk" className="hover:text-primary">
                {t.nav.helpdesk}
              </Link>
            </li>
            {FEATURES.janashabdam && (
              <li>
                <Link to="/janashabdam/track" className="hover:text-primary">
                  {t.nav.track}
                </Link>
              </li>
            )}
            <li>
              <Link to="/volunteer" className="hover:text-primary">
                {t.nav.volunteer}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                {t.nav.contact}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="section-underline mb-4 text-sm font-semibold uppercase tracking-wide">
            {t.footer.follow}
          </h4>
          <div className="flex gap-3 text-foreground/70">
            <a href="#" aria-label="Facebook" className="hover:text-primary">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-primary">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-primary">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>{t.footer.rights}</span>
            <span className="font-semibold text-foreground/70">
              {lang === "ml"
                ? "നിയന്ത്രിക്കുകയും പരിപാലിക്കുകയും ചെയ്യുന്നത്: ബിജെപി കേരളം"
                : "Managed and maintained by BJP Keralam"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
