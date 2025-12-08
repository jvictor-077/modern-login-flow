import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Clock, CheckCircle, XCircle, Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  client: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: string;
}

const availableProducts = [
  { name: "Água Mineral 500ml", price: 4.00 },
  { name: "Refrigerante Lata", price: 6.00 },
  { name: "Energético 250ml", price: 15.00 },
  { name: "Suco Natural 300ml", price: 10.00 },
  { name: "Coxinha", price: 8.00 },
  { name: "Empada", price: 7.00 },
  { name: "Pão de Queijo", price: 5.00 },
  { name: "Açaí 500ml", price: 18.00 },
  { name: "Açaí 300ml", price: 12.00 },
  { name: "Sanduíche Natural", price: 15.00 },
];

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
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);

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

  const addItemToOrder = (product: { name: string; price: number }) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.name === product.name);
      if (existing) {
        return prev.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateItemQuantity = (name: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) =>
          item.name === name
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (name: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.name !== name));
  };

  const orderTotal = selectedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCreateOrder = () => {
    if (!clientName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do cliente.",
        variant: "destructive",
      });
      return;
    }
    if (selectedItems.length === 0) {
      toast({
        title: "Adicione itens",
        description: "Selecione pelo menos um item para o pedido.",
        variant: "destructive",
      });
      return;
    }

    const newOrder: Order = {
      id: String(orders.length + 1).padStart(3, "0"),
      client: clientName.trim(),
      items: selectedItems,
      total: orderTotal,
      status: "pending",
      createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setClientName("");
    setSelectedItems([]);
    setIsNewOrderOpen(false);
    toast({
      title: "Pedido criado",
      description: `Pedido #${newOrder.id} para ${newOrder.client} foi criado.`,
    });
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

            <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Novo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Pedido</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Nome do Cliente</Label>
                    <Input
                      id="client"
                      placeholder="Ex: João Silva"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Produtos Disponíveis</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {availableProducts.map((product) => (
                        <Button
                          key={product.name}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2 px-3"
                          onClick={() => addItemToOrder(product)}
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-xs font-medium truncate w-full">{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              R$ {product.price.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="space-y-2">
                      <Label>Itens do Pedido</Label>
                      <div className="border border-border/50 rounded-lg divide-y divide-border/50">
                        {selectedItems.map((item) => (
                          <div key={item.name} className="flex items-center justify-between p-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                R$ {item.price.toFixed(2).replace(".", ",")} x {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateItemQuantity(item.name, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateItemQuantity(item.name, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => removeItem(item.name)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-primary">
                      R$ {orderTotal.toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  <Button onClick={handleCreateOrder} className="w-full" disabled={selectedItems.length === 0}>
                    Criar Pedido
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
