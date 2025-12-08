import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { estatisticasLanchonete, pedidos } from "@/data/lanchoneteData";
import { STATUS_PEDIDO_CONFIG } from "@/types/lanchonete";

export default function LanchoneteDashboard() {
  const stats = [
    {
      title: "Vendas Hoje",
      value: `R$ ${estatisticasLanchonete.vendasHoje.toFixed(2).replace(".", ",")}`,
      icon: DollarSign,
      change: "+12%",
    },
    {
      title: "Pedidos Hoje",
      value: String(estatisticasLanchonete.pedidosHoje),
      icon: ShoppingBag,
      change: "+8%",
    },
    {
      title: "Ticket Médio",
      value: `R$ ${estatisticasLanchonete.ticketMedio.toFixed(2).replace(".", ",")}`,
      icon: TrendingUp,
      change: "+5%",
    },
    {
      title: "Clientes Atendidos",
      value: String(estatisticasLanchonete.clientesAtendidos),
      icon: Users,
      change: "+15%",
    },
  ];

  // Últimos 4 pedidos
  const recentOrders = pedidos.slice(0, 4);

  return (
    <AdminLayout
      title="Dashboard Lanchonete"
      description="Acompanhe as vendas e pedidos do dia"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  <span className="text-xs text-green-500">{stat.change} vs ontem</span>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 ml-2">
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
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
            {recentOrders.map((order) => {
              const statusConfig = STATUS_PEDIDO_CONFIG[order.status];
              const itemsText = order.itens.map(i => `${i.quantidade}x ${i.nome}`).join(", ");
              
              return (
                <div key={order.id} className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">#{order.id.replace("ped-", "")}</span>
                      <span className="font-medium text-foreground text-sm sm:text-base truncate">{order.cliente_nome}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{itemsText}</p>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base">
                      R$ {order.total.toFixed(2).replace(".", ",")}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
