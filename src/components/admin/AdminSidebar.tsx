import { LayoutDashboard, Package, LogOut, UtensilsCrossed, ClipboardList, BarChart3, Boxes } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Estoque", url: "/admin/estoque", icon: Package },
];

const lanchoneteItems = [
  { title: "Dashboard", url: "/admin/lanchonete", icon: BarChart3 },
  { title: "Pedidos", url: "/admin/lanchonete/pedidos", icon: ClipboardList },
  { title: "Estoque", url: "/admin/lanchonete/estoque", icon: Boxes },
];

export function AdminSidebar() {
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <span className="text-xl">🎾</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground">QuadraPro</h2>
            <p className="text-xs text-muted-foreground">Painel Administrativo</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2 mb-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                      activeClassName="bg-primary/10 text-primary font-medium border border-primary/20"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2 mb-2 flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Lanchonete
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {lanchoneteItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin/lanchonete"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                      activeClassName="bg-primary/10 text-primary font-medium border border-primary/20"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200">
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
