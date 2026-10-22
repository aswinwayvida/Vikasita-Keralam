import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
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
  HeartHandshake,
  LayoutDashboard,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export function AdminSidebar() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const groups = [
    {
      label: "Dashboard Menu",
      items: [
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
        { to: "/admin/schemes", icon: Sparkles, label: "Schemes" },
        { to: "/admin/applications", icon: FileText, label: "Applications" },
        { to: "/admin/beneficiaries", icon: HeartHandshake, label: "Beneficiaries" },
        { to: "/admin/public-pulse", icon: Users, label: "Citizens" },
        { to: "/admin/volunteers", icon: Building2, label: "Members" },
      ],
    },
    {
      label: "Operations",
      items: [
        { to: "/admin/whatsapp", icon: MessageCircle, label: "Citizen messages" },
      ],
    },
    {
      label: "Settings",
      items: [
        { to: "/admin/settings", icon: Settings, label: "General settings" },
        { to: "/admin/settings", icon: ShieldCheck, label: "Roles and Control" },
      ],
    },
  ] as const;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-2 py-3">
        <Link to="/admin" onClick={handleLinkClick} className="flex min-h-10 items-center gap-3 rounded-lg px-1.5">
          <img src={officialLotus} alt="BJP official lotus" className="h-9 w-9 shrink-0 object-contain object-left" />
          {(!collapsed || isMobile) && (
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
                    <SidebarMenuItem key={`${item.to}-${item.label}`}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label} className="h-10 rounded-lg">
                        <Link to={item.to} onClick={handleLinkClick} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          {(!collapsed || isMobile) && <span className="truncate text-sm">{item.label}</span>}
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
    </Sidebar>
  );
}
