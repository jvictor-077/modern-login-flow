import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Clock, CheckCircle, XCircle } from "lucide-react";

interface Order {
  id: string;
  client: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: string;
}

const initialOrders: Order[] = [
  {
    id: "001",
    client: "João Silva",
    items: [
      { name: "Água Mineral", quantity: 2, price: 4.00 },
      { name: "Coxinha", quantity: 1, price: 8.00 },
    ],
    total: 16.00,
    status: "pending",
    createdAt: "14:32",
  },
  {
    id: "002",
    client: "Maria Santos",
    items: [
      { name: "Refrigerante Lata", quantity: 1, price: 6.00 },
      { name: "Açaí 500ml", quantity: 2, price: 18.00 },
    ],
    total: 42.00,
    status: "preparing",
    createdAt: "14:25",
  },
  {
    id: "003",
    client: "Pedro Costa",
    items: [
      { name: "Energético", quantity: 3, price: 15.00 },
    ],
    total: 45.00,
    status: "ready",
    createdAt: "14:15",
  },
  {
    id: "004",
    client: "Ana Oliveira",
    items: [
      { name: "Suco Natural", quantity: 1, price: 10.00 },
      { name: "Sanduíche Natural", quantity: 1, price: 15.00 },
    ],
    total: 25.00,
    status: "delivered",
    createdAt: "13:50",
  },
];

const statusConfig = {
  pending: { label: "Pendente", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  preparing: { label: "Preparando", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock },
  ready: { label: "Pronto", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle },
  delivered: { label: "Entregue", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

export default function LanchonetePedidos() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getNextStatus = (currentStatus: Order["status"]): Order["status"] | null => {
    const flow: Record<Order["status"], Order["status"] | null> = {
      pending: "preparing",
      preparing: "ready",
      ready: "delivered",
      delivered: null,
      cancelled: null,
    };
    return flow[currentStatus];
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                Pedidos
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os pedidos da lanchonete
              </p>
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <PlusCircle className="h-5 w-5" />
              Novo Pedido
            </Button>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const nextStatus = getNextStatus(order.status);

              return (
                <Card key={order.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">#{order.id}</span>
                        <span className="text-xs text-muted-foreground">{order.createdAt}</span>
                      </div>
                      <Badge variant="outline" className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold">{order.client}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-foreground">
                            R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <span className="font-bold text-lg text-foreground">
                        R$ {order.total.toFixed(2).replace(".", ",")}
                      </span>

                      {nextStatus && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {nextStatus === "preparing" && "Preparar"}
                          {nextStatus === "ready" && "Pronto"}
                          {nextStatus === "delivered" && "Entregar"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
