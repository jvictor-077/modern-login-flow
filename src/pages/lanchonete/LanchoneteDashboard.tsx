import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp, Users, Loader2 } from "lucide-react";
import { useLanchonetePedidos } from "@/hooks/useLanchonete";
import { STATUS_PEDIDO_CONFIG } from "@/types/lanchonete";

export default function LanchoneteDashboard() {
  const { pedidos, isLoading, estatisticas } = useLanchonetePedidos();

  const stats = [
    {
      title: "Vendas Hoje",
      value: `R$ ${estatisticas.vendasHoje.toFixed(2).replace(".", ",")}`,
      icon: DollarSign,
      change: "+12%",
    },
    {
      title: "Pedidos Hoje",
      value: String(estatisticas.pedidosHoje),
      icon: ShoppingBag,
      change: "+8%",
    },
    {
      title: "Ticket Médio",
      value: `R$ ${estatisticas.ticketMedio.toFixed(2).replace(".", ",")}`,
      icon: TrendingUp,
      change: "+5%",
    },
    {
      title: "Clientes Atendidos",
      value: String(estatisticas.clientesAtendidos),
      icon: Users,
      change: "+15%",
    },
  ];

  // Últimos 4 pedidos
  const recentOrders = pedidos.slice(0, 4);

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard Lanchonete" description="Acompanhe as vendas e pedidos do dia">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

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
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum pedido registrado ainda.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentOrders.map((order) => {
                const statusConfig = STATUS_PEDIDO_CONFIG[order.status];
                const itens = (order as any).itens || [];
                const itemsText = itens.map((i: any) => `${i.quantidade}x ${i.produto?.nome || "Item"}`).join(", ");
                
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="font-medium text-foreground text-sm sm:text-base truncate">
                          {order.cliente_nome}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                        {itemsText || "Sem itens"}
                      </p>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <p className="font-semibold text-foreground text-sm sm:text-base">
                        R$ {Number(order.total).toFixed(2).replace(".", ",")}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
