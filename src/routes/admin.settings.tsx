import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Settings2, ShieldCheck, Check, X, ArrowLeft } from "lucide-react";

import { RoleAccessSettings } from "@/components/admin/RoleAccessSettings";
import { auditLog } from "@/data/volunteers";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      search.tab === "roles"
        ? ("roles" as const)
        : search.tab === "users"
          ? ("users" as const)
          : undefined,
  }),
  head: () => ({ meta: [{ title: "Settings · Admin" }] }),
  component: SettingsPage,
});

const roles = [
  "Administrator",
  "District coordinator",
  "Constituency team member",
  "Panchayat Volunteer",
];
const perms = [
  "View requests",
  "Check requests",
  "Send to senior team",
  "Create report",
  "Send messages",
  "Manage users",
];
const matrix: Record<string, boolean[]> = {
  Administrator: [true, true, true, true, true, true],
  "District coordinator": [true, true, true, true, true, false],
  "Constituency team member": [true, true, true, false, false, false],
  "Panchayat Volunteer": [true, true, false, false, false, false],
};

function SettingsPage() {
  const search = Route.useSearch();

  // Desktop only: hide page scrollbar on Settings / Roles page
  useEffect(() => {
    const root = document.documentElement;
    const desktopQuery = window.matchMedia("(min-width: 640px)");
    const sync = () => root.classList.toggle("desktop-hide-page-scrollbar", desktopQuery.matches);
    sync();
    desktopQuery.addEventListener("change", sync);
    return () => {
      desktopQuery.removeEventListener("change", sync);
      root.classList.remove("desktop-hide-page-scrollbar");
    };
  }, []);

  return (
    <div className="space-y-5 pb-8">
      <RoleAccessSettings defaultTab={search.tab === "users" ? "users" : "roles"} />
    </div>
  );
}

function GeneralSettings({ lang }: { lang: "en" | "ml" }) {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="border-b border-border/80 px-4 py-3">
          <h2 className="text-sm font-bold text-foreground">
            {lang === "ml" ? "ആർക്കെന്ത് ചെയ്യാം" : "Who can do what"}
          </h2>
          <p className="text-[10.5px] text-muted-foreground">
            {lang === "ml"
              ? "പൊതു പ്രവർത്തന അനുമതികളുടെ അവലോകനം."
              : "Overview of baseline workspace permissions by role."}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">Role</th>
                {perms.map((perm) => (
                  <th key={perm} className="px-3 py-2.5 text-center">
                    {perm}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-2.5 text-[12px] font-semibold">
                    {role}
                  </td>
                  {matrix[role].map((value, index) => (
                    <td key={index} className="px-3 py-2.5 text-center">
                      {value ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-600" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <h3 className="section-underline text-sm font-semibold">
          {lang === "ml" ? "സമീപകാല പ്രവർത്തനങ്ങൾ" : "Recent activity"}
        </h3>
        <ul className="mt-4 space-y-2 text-sm">
          {auditLog.map((entry) => (
            <li
              key={entry.id}
              className="flex justify-between gap-4 border-b border-border pb-2 text-[12px] last:border-0"
            >
              <span>
                <span className="font-medium">{entry.who}</span> · {entry.action}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{entry.at}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
