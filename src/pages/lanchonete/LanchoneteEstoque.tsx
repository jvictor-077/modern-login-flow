import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Minus, Package, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

const initialProducts: Product[] = [
  { id: "1", name: "Água Mineral 500ml", price: 4.00, quantity: 48, category: "Bebidas" },
  { id: "2", name: "Refrigerante Lata", price: 6.00, quantity: 36, category: "Bebidas" },
  { id: "3", name: "Energético 250ml", price: 15.00, quantity: 24, category: "Bebidas" },
  { id: "4", name: "Suco Natural 300ml", price: 10.00, quantity: 20, category: "Bebidas" },
  { id: "5", name: "Coxinha", price: 8.00, quantity: 15, category: "Salgados" },
  { id: "6", name: "Empada", price: 7.00, quantity: 12, category: "Salgados" },
  { id: "7", name: "Pão de Queijo", price: 5.00, quantity: 30, category: "Salgados" },
  { id: "8", name: "Açaí 500ml", price: 18.00, quantity: 10, category: "Açaí" },
  { id: "9", name: "Açaí 300ml", price: 12.00, quantity: 15, category: "Açaí" },
  { id: "10", name: "Sanduíche Natural", price: 15.00, quantity: 8, category: "Lanches" },
];

export default function LanchoneteEstoque() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", quantity: "", category: "" });

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
      category: newProduct.category || "Outros",
    };

    setProducts((prev) => [...prev, product]);
    setNewProduct({ name: "", price: "", quantity: "", category: "" });
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

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                Estoque Lanchonete
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os produtos da lanchonete
              </p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Adicionar Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Produto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Refrigerante Lata"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      placeholder="Ex: Bebidas, Salgados, Lanches"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      placeholder="Ex: 8,90"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade Inicial</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Ex: 20"
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
          </div>

          {/* Products by Category */}
          <div className="space-y-6">
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <Card key={category} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Package className="h-5 w-5 text-primary" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {categoryProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            R$ {product.price.toFixed(2).replace(".", ",")} / unidade
                          </p>
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                            onClick={() => handleQuantityChange(product.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className={`w-12 text-center font-semibold tabular-nums ${
                            product.quantity <= 5 ? "text-destructive" : "text-foreground"
                          }`}>
                            {product.quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-border/50 hover:bg-accent/50 hover:text-accent-foreground hover:border-accent/50"
                            onClick={() => handleQuantityChange(product.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>

                          <div className="w-24 text-right">
                            <span className="font-medium text-foreground">
                              R$ {(product.price * product.quantity).toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total */}
          <Card className="mt-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">
                  Valor Total do Estoque
                </span>
                <span className="text-2xl font-bold text-primary">
                  R$ {totalValue.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}
