import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import officialLotus from "@/assets/bjp-official-lotus.png";
import {
  Building2,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

export function AdminSidebar() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const groups = [
    {
      label: "Dashboard",
      items: [{ to: "/admin", icon: LayoutDashboard, label: "Overview", exact: true }],
    },
    {
      label: "Manage",
      items: [
        { to: "/admin/applications", icon: FileText, label: "Applications" },
        { to: "/admin/schemes", icon: Sparkles, label: "Schemes" },
        { to: "/admin/growth", icon: Building2, label: "Helpdesks" },
        { to: "/admin/volunteers", icon: Users, label: "Volunteers" },
      ],
    },
    {
      label: "Messages",
      items: [{ to: "/admin/whatsapp", icon: MessageCircle, label: "Citizen messages" }],
    },
    {
      label: "Settings",
      items: [{ to: "/admin/settings", icon: Settings, label: "Users & security" }],
    },
  ] as const;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-2 py-3">
        <Link to="/admin" className="flex min-h-10 items-center gap-3 rounded-lg px-1.5">
          <img src={officialLotus} alt="BJP official lotus" className="h-9 w-9 shrink-0 object-contain object-left" />
          {!collapsed && (
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-bold text-sidebar-foreground">Vikasita Keralam</span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Admin panel</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.14em]">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const exact = "exact" in item && item.exact;
                  const active = exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label} className="h-10 rounded-lg">
                        <Link to={item.to} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span className="truncate text-sm">{item.label}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent px-3 py-2 text-[11px] leading-5 text-sidebar-foreground/70">
            <span className="block font-semibold text-sidebar-foreground">BJP Kerala</span>
            Kerala team · Secure access
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
