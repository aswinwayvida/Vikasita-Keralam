import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · വികസിത കേരളം" },
      { name: "description", content: "Vikasita Keralam operations workspace." },
    ],
  }),
  component: ProtectedAdminRoute,
});

function ProtectedAdminRoute() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      window.location.replace("/auth/login");
      return;
    }
    setAuthenticated(true);
  }, []);

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          Verifying administrator session…
        </div>
      </div>
    );
  }

  return <AdminLayout><Outlet /></AdminLayout>;
}
