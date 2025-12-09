import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Clock, CheckCircle, XCircle, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanchonetePedidos, useLanchoneteProdutos } from "@/hooks/useLanchonete";
import { StatusPedido, STATUS_PEDIDO_CONFIG, PEDIDO_STATUS_FLOW } from "@/types/lanchonete";

interface ItemPedidoLocal {
  produto_id: string;
  nome: string;
  quantidade: number;
  preco_unitario: number;
}

const statusIcons = {
  pendente: Clock,
  preparando: Clock,
  pronto: CheckCircle,
  entregue: CheckCircle,
  cancelado: XCircle,
};

export default function LanchonetePedidos() {
  const { pedidos, isLoading, createPedido, updateStatus } = useLanchonetePedidos();
  const { produtos: produtosDisponiveis } = useLanchoneteProdutos();
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [selectedItems, setSelectedItems] = useState<ItemPedidoLocal[]>([]);

  const addItemToOrder = (product: { id: string; nome: string; preco: number }) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.produto_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.produto_id === product.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { produto_id: product.id, nome: product.nome, quantidade: 1, preco_unitario: product.preco }];
    });
  };

  const updateItemQuantity = (produtoId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) =>
          item.produto_id === produtoId
            ? { ...item, quantidade: Math.max(0, item.quantidade + delta) }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  };

  const removeItem = (produtoId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.produto_id !== produtoId));
  };

  const orderTotal = selectedItems.reduce(
    (acc, item) => acc + item.preco_unitario * item.quantidade,
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

    createPedido.mutate({
      cliente_nome: clientName.trim(),
      total: orderTotal,
      itens: selectedItems.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
      })),
    });

    setClientName("");
    setSelectedItems([]);
    setIsNewOrderOpen(false);
  };

  const actions = (
    <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <PlusCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Novo Pedido</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
          <DialogDescription>Adicione os itens do pedido</DialogDescription>
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
              {produtosDisponiveis.map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2 px-3"
                  onClick={() => addItemToOrder({ id: product.id, nome: product.nome, preco: Number(product.preco) })}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium truncate w-full">{product.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      R$ {Number(product.preco).toFixed(2).replace(".", ",")}
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
                  <div key={item.produto_id} className="flex items-center justify-between p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        R$ {item.preco_unitario.toFixed(2).replace(".", ",")} x {item.quantidade}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateItemQuantity(item.produto_id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantidade}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateItemQuantity(item.produto_id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.produto_id)}
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

          <Button 
            onClick={handleCreateOrder} 
            className="w-full" 
            disabled={selectedItems.length === 0 || createPedido.isPending}
          >
            {createPedido.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Criar Pedido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <AdminLayout title="Pedidos" description="Gerencie os pedidos da lanchonete">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Pedidos"
      description="Gerencie os pedidos da lanchonete"
      actions={actions}
    >
      {pedidos.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum pedido registrado. Crie seu primeiro pedido!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {pedidos.map((order) => {
            const statusConfig = STATUS_PEDIDO_CONFIG[order.status];
            const StatusIcon = statusIcons[order.status];
            const nextStatus = PEDIDO_STATUS_FLOW[order.status];

            // Extrai os itens do pedido (vem do join)
            const itens = (order as any).itens || [];

            return (
              <Card key={order.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-border/50 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <Badge variant="outline" className={statusConfig.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      <span className="text-xs">{statusConfig.label}</span>
                    </Badge>
                  </div>
                  <CardTitle className="text-sm sm:text-base font-semibold">{order.cliente_nome}</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 sm:pt-4 p-3 sm:p-4">
                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    {itens.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">
                          {item.quantidade}x {item.produto?.nome || "Produto"}
                        </span>
                        <span className="text-foreground">
                          R$ {(Number(item.preco_unitario) * item.quantidade).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border/50">
                    <span className="font-bold text-base sm:text-lg text-foreground">
                      R$ {Number(order.total).toFixed(2).replace(".", ",")}
                    </span>

                    {nextStatus && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: order.id, status: nextStatus })}
                        className="bg-primary hover:bg-primary/90 text-xs sm:text-sm h-8"
                        disabled={updateStatus.isPending}
                      >
                        {nextStatus === "preparando" && "Preparar"}
                        {nextStatus === "pronto" && "Pronto"}
                        {nextStatus === "entregue" && "Entregar"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
