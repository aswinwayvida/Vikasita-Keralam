import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { LotusLoader } from "@/components/ui/LotusLoader";

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
        <LotusLoader size="lg" label="Verifying administrator session…" />
      </div>
    );
  }

  return <AdminLayout><Outlet /></AdminLayout>;
}
