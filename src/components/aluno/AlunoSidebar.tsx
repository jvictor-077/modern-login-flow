import { Calendar, Home, CalendarPlus, LogOut, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const menuItems = [
  {
    title: "Início",
    url: "/aluno",
    icon: Home,
  },
  {
    title: "Reservar Horário",
    url: "/aluno/reservar",
    icon: CalendarPlus,
  },
  {
    title: "Minhas Reservas",
    url: "/aluno/reservas",
    icon: Calendar,
  },
  {
    title: "Meu Perfil",
    url: "/aluno/perfil",
    icon: User,
  },
];

export function AlunoSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <span className="text-xl">🏐</span>
          </div>
          <span className="font-display font-bold text-lg text-sidebar-foreground">
            Sunset
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/aluno"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
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

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Link to="/">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sair
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
