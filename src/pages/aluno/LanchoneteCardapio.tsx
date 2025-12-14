import { useState } from "react";
import { ShoppingCart, Plus, Minus, Coffee, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanchoneteProdutos, useLanchonetePedidos, ProdutoLanchonete } from "@/hooks/useLanchonete";
import { useAlunoSession } from "@/hooks/useAlunoSession";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  produto: ProdutoLanchonete;
  quantidade: number;
}

export default function LanchoneteCardapio() {
  const { aluno } = useAlunoSession();
  const { produtos, isLoading } = useLanchoneteProdutos();
  const { createPedido } = useLanchonetePedidos();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Agrupar produtos por categoria
  const produtosPorCategoria = produtos.reduce((acc, produto) => {
    const categoria = produto.categoria || "Outros";
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(produto);
    return acc;
  }, {} as Record<string, ProdutoLanchonete[]>);

  const addToCart = (produto: ProdutoLanchonete) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.produto.id === produto.id);
      if (existing) {
        return prev.map((item) =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  const updateQuantity = (produtoId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.produto.id === produtoId
            ? { ...item, quantidade: Math.max(0, item.quantidade + delta) }
            : item
        )
        .filter((item) => item.quantidade > 0);
    });
  };

  const getCartQuantity = (produtoId: string) => {
    return cart.find((item) => item.produto.id === produtoId)?.quantidade || 0;
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantidade, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0
  );

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho antes de fazer o pedido.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createPedido.mutateAsync({
        cliente_nome: aluno?.nome || "Cliente",
        total: totalPrice,
        observacoes: observacoes || undefined,
        itens: cart.map((item) => ({
          produto_id: item.produto.id,
          quantidade: item.quantidade,
          preco_unitario: item.produto.preco,
        })),
      });

      setCart([]);
      setObservacoes("");
      setIsSheetOpen(false);
      toast({
        title: "Pedido enviado!",
        description: "Seu pedido foi enviado para a lanchonete.",
      });
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Lanchonete
          </h1>
          <p className="text-muted-foreground">
            Faça seu pedido e retire no balcão
          </p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="relative">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Carrinho
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-destructive">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Meu Carrinho
              </SheetTitle>
            </SheetHeader>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Seu carrinho está vazio</p>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 my-4">
                  <div className="space-y-4 pr-4">
                    {cart.map((item) => (
                      <div
                        key={item.produto.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {item.produto.nome}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            R$ {item.produto.preco.toFixed(2)} cada
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.produto.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantidade}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.produto.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-semibold w-20 text-right">
                          R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="space-y-4">
                  <Textarea
                    placeholder="Observações (opcional)"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="resize-none"
                    rows={2}
                  />

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                  </div>

                  <SheetFooter>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <Send className="h-5 w-5 mr-2" />
                      )}
                      Enviar Pedido
                    </Button>
                  </SheetFooter>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Produtos por categoria */}
      {Object.keys(produtosPorCategoria).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Coffee className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum produto disponível no momento</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(produtosPorCategoria).map(([categoria, items]) => (
          <div key={categoria} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{categoria}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((produto) => {
                const cartQty = getCartQuantity(produto.id);
                const isOutOfStock = produto.quantidade <= 0;

                return (
                  <Card
                    key={produto.id}
                    className={`transition-all ${
                      isOutOfStock ? "opacity-50" : "hover:shadow-md"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {produto.nome}
                          </h3>
                          <p className="text-lg font-bold text-primary mt-1">
                            R$ {produto.preco.toFixed(2)}
                          </p>
                          {isOutOfStock && (
                            <Badge variant="secondary" className="mt-2">
                              Esgotado
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {cartQty > 0 ? (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => updateQuantity(produto.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold">
                                {cartQty}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => addToCart(produto)}
                                disabled={isOutOfStock}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => addToCart(produto)}
                              disabled={isOutOfStock}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Adicionar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
