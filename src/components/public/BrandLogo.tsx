import { useLang } from "@/i18n/LanguageProvider";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoEn from "@/assets/logo-vikasita-en-official.png";
import logoMl from "@/assets/logo-vikasita-ml-official.png";

export function BrandLogo({ className }: { className?: string }) {
  const { t, lang } = useLang();
  const src = lang === "ml" ? logoMl : logoEn;
  return (
    <Link to="/" className="group inline-flex min-w-0 max-w-full items-center">
      <img
        src={src}
        alt={t.brand}
        loading="eager"
        decoding="async"
        className={cn("h-14 w-auto max-w-full object-contain md:h-16", className)}
      />
    </Link>
  );
}
