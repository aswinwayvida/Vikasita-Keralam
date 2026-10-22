import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { SaffronTopBar } from "@/components/public/SaffronTopBar";

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SaffronTopBar />
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-4px)] w-full">
          <AdminSidebar />
          <SidebarInset>
            <AdminTopBar />
            <main className="p-4 sm:p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}