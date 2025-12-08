import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AlunoSidebar } from "./AlunoSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface AlunoLayoutProps {
  children: React.ReactNode;
}

// Dados mockados do aluno
const alunoData = {
  nome: "João Silva",
  email: "joao@email.com",
  avatar: "JS",
};

export function AlunoLayout({ children }: AlunoLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AlunoSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-50 h-14 sm:h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center justify-between px-3 sm:px-4">
              <SidebarTrigger className="text-foreground" />
              
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                    2
                  </span>
                </Button>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarFallback className="bg-primary/20 text-primary font-medium text-xs sm:text-sm">
                      {alunoData.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{alunoData.nome}</p>
                    <p className="text-xs text-muted-foreground">{alunoData.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
