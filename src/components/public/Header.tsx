import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { BrandLogo } from "./BrandLogo";
import { LanguageToggle } from "./LanguageToggle";
import { SaffronTopBar } from "./SaffronTopBar";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FEATURES } from "@/config/features";

export function Header() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDifference = currentScrollY - lastScrollY.current;

      if (open || currentScrollY < 48) {
        setHeaderVisible(true);
      } else if (scrollDifference > 4) {
        setHeaderVisible(false);
      } else if (scrollDifference < -4) {
        setHeaderVisible(true);
      }

      if (Math.abs(scrollDifference) > 4 || currentScrollY < 48) {
        lastScrollY.current = currentScrollY;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open]);

  const navItems = [
    { to: "/", label: t.nav.home },
    { to: "/schemes", label: t.nav.schemes },
    ...(FEATURES.janashabdam ? [{ to: "/janashabdam", label: t.nav.janashabdam } as const] : []),
    { to: "/eligibility", label: t.nav.eligibility },
    { to: "/helpdesk", label: t.nav.helpdesk },
    ...(FEATURES.janashabdam ? [{ to: "/janashabdam/track", label: t.nav.track } as const] : []),
    { to: "/volunteer", label: t.nav.volunteer },
    { to: "/contact", label: t.nav.contact },
  ] as const;

  const loginLabel = lang === "ml" ? "ലോഗിൻ" : "Login";

  return (
    <header
      className={`sticky top-0 z-40 bg-background/95 backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none ${
        headerVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <SaffronTopBar />
      <div className="border-b border-border">
        <div className="vk-site-header-row mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-2 px-2.5 sm:gap-4 sm:px-6">
          <BrandLogo className="vk-site-logo w-auto max-w-[calc(100vw-88px)] shrink object-contain drop-shadow-sm sm:max-w-[300px] md:max-w-[340px] xl:max-w-[360px]" />
          <nav className="hidden items-center gap-0.5 xl:flex">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-md whitespace-nowrap px-2 py-2 text-sm font-medium text-foreground/80 hover:text-primary"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 xl:flex">
            <LanguageToggle />
            <Button asChild size="sm" variant="outline" className="border-primary/30 bg-card font-semibold hover:bg-primary/10 hover:text-primary">
              <Link to="/auth/login" className="gap-2"><LogIn className="h-4 w-4" />{loginLabel}</Link>
            </Button>
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground xl:hidden"
            aria-label="menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-border bg-card xl:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
              {navItems.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted"
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <LanguageToggle />
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-auto min-h-9 max-w-full border-primary/30 bg-card font-semibold hover:bg-primary/10 hover:text-primary sm:w-auto"
                >
                  <Link to="/auth/login" onClick={() => setOpen(false)} className="gap-2">
                    <LogIn className="h-4 w-4" />{loginLabel}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
