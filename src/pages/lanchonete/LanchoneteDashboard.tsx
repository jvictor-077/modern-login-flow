import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";

const stats = [
  {
    title: "Vendas Hoje",
    value: "R$ 1.245,00",
    icon: DollarSign,
    change: "+12%",
    changeType: "positive" as const,
  },
  {
    title: "Pedidos Hoje",
    value: "47",
    icon: ShoppingBag,
    change: "+8%",
    changeType: "positive" as const,
  },
  {
    title: "Ticket Médio",
    value: "R$ 26,49",
    icon: TrendingUp,
    change: "+5%",
    changeType: "positive" as const,
  },
  {
    title: "Clientes Atendidos",
    value: "38",
    icon: Users,
    change: "+15%",
    changeType: "positive" as const,
  },
];

const recentOrders = [
  { id: "001", client: "João Silva", items: "2x Água, 1x Salgado", total: 18.50, status: "Entregue" },
  { id: "002", client: "Maria Santos", items: "1x Refrigerante, 2x Açaí", total: 42.00, status: "Preparando" },
  { id: "003", client: "Pedro Costa", items: "3x Energético", total: 45.00, status: "Entregue" },
  { id: "004", client: "Ana Oliveira", items: "1x Suco Natural, 1x Sanduíche", total: 25.00, status: "Pendente" },
];

export default function LanchoneteDashboard() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Dashboard Lanchonete
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe as vendas e pedidos do dia
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                      <span className="text-xs text-green-500">{stat.change} vs ontem</span>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Orders */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg font-semibold">Pedidos Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">#{order.id}</span>
                        <span className="font-medium text-foreground">{order.client}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{order.items}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        R$ {order.total.toFixed(2).replace(".", ",")}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "Entregue" 
                          ? "bg-green-500/10 text-green-500" 
                          : order.status === "Preparando"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}
