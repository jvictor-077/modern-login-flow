import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminLayout({ children, title, description, actions }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <main className="flex-1 flex flex-col overflow-auto">
          {/* Mobile Header with Sidebar Trigger */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:hidden">
            <SidebarTrigger className="-ml-1">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <span className="font-display font-semibold text-foreground truncate">{title}</span>
          </header>

          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* Desktop Header */}
            <div className="hidden lg:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              {actions && <div className="flex gap-3">{actions}</div>}
            </div>

            {/* Mobile Header Content */}
            <div className="flex lg:hidden flex-col gap-4 mb-6">
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>

            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
