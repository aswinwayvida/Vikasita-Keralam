import type { ReactNode } from "react";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { SaffronTopBar } from "@/components/public/SaffronTopBar";

export function AdminLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.dataset.desktopAdmin = "true";
    return () => { delete document.body.dataset.desktopAdmin; };
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <SaffronTopBar />
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-4px)] w-full">
          <AdminSidebar />
          <SidebarInset>
            <AdminTopBar />
            <main className="admin-desktop-content px-2.5 py-3.5 sm:p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
