import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ScanLine, Plus, Minus, Package, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const initialProducts: Product[] = [
  { id: "1", name: "Bola de Vôlei Mikasa", price: 189.90, quantity: 8 },
  { id: "2", name: "Raquete Beach Tennis Pro", price: 459.90, quantity: 5 },
  { id: "3", name: "Rede de Vôlei Profissional", price: 299.90, quantity: 3 },
  { id: "4", name: "Kit Marcação de Quadra", price: 89.90, quantity: 12 },
  { id: "5", name: "Bola de Beach Tennis (Pack 3)", price: 59.90, quantity: 20 },
  { id: "6", name: "Grip Overgrip (Pack 10)", price: 34.90, quantity: 15 },
  { id: "7", name: "Squeeze 1L", price: 24.90, quantity: 25 },
  { id: "8", name: "Toalha Esportiva", price: 39.90, quantity: 18 },
];

export default function Estoque() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", quantity: "" });

  const handleQuantityChange = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === id) {
          const newQuantity = Math.max(0, product.quantity + delta);
          return { ...product, quantity: newQuantity };
        }
        return product;
      })
    );
  };

  const handleScanInvoice = () => {
    toast({
      title: "Escanear Nota Fiscal",
      description: "Funcionalidade de escaneamento será implementada em breve.",
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.quantity) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar o produto.",
        variant: "destructive",
      });
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name.trim(),
      price: parseFloat(newProduct.price.replace(",", ".")),
      quantity: parseInt(newProduct.quantity),
    };

    setProducts((prev) => [...prev, product]);
    setNewProduct({ name: "", price: "", quantity: "" });
    setIsAddDialogOpen(false);
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao estoque.`,
    });
  };

  const totalValue = products.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

  const actions = (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
            <PlusCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Adicionar Item</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Produto</DialogTitle>
            <DialogDescription>Preencha os dados do produto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                placeholder="Ex: Bola de Vôlei"
                value={newProduct.name}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                placeholder="Ex: 89,90"
                value={newProduct.price}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade Inicial</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Ex: 10"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            <Button onClick={handleAddProduct} className="w-full mt-4">
              Adicionar Produto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        onClick={handleScanInvoice}
        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
      >
        <ScanLine className="h-5 w-5" />
        <span className="hidden sm:inline">Escanear Nota Fiscal</span>
        <span className="sm:hidden">Escanear</span>
      </Button>
    </>
  );

  return (
    <AdminLayout
      title="Estoque"
      description="Gerencie os produtos do seu estoque"
      actions={actions}
    >
      {/* Products List */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5 text-primary" />
            Produtos em Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-medium text-foreground truncate text-sm sm:text-base">
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    R$ {product.price.toFixed(2).replace(".", ",")} / unidade
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                    onClick={() => handleQuantityChange(product.id, -1)}
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>

                  <span className="w-8 sm:w-12 text-center font-semibold text-foreground tabular-nums text-sm sm:text-base">
                    {product.quantity}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 border-border/50 hover:bg-accent/50 hover:text-accent-foreground hover:border-accent/50"
                    onClick={() => handleQuantityChange(product.id, 1)}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>

                  <div className="w-20 sm:w-28 text-right">
                    <span className="font-medium text-foreground text-sm sm:text-base">
                      R$ {(product.price * product.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t-2 border-primary/30 bg-primary/5 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-semibold text-foreground">
                Valor Total do Estoque
              </span>
              <span className="text-xl sm:text-2xl font-bold text-primary">
                R$ {totalValue.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
