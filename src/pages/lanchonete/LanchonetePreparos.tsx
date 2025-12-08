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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Package, PlusCircle, ScanLine } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const categories = ["Frutas", "Laticínios", "Granola e Cereais", "Caldas e Coberturas", "Descartáveis", "Outros"];

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
}

const initialProducts: Product[] = [
  { id: "1", name: "Açaí Polpa 10kg", price: 120.00, quantity: 5, unit: "balde", category: "Frutas" },
  { id: "2", name: "Banana", price: 8.00, quantity: 30, unit: "kg", category: "Frutas" },
  { id: "3", name: "Morango", price: 25.00, quantity: 10, unit: "kg", category: "Frutas" },
  { id: "4", name: "Leite Condensado", price: 7.50, quantity: 24, unit: "lata", category: "Laticínios" },
  { id: "5", name: "Leite em Pó", price: 18.00, quantity: 12, unit: "pacote", category: "Laticínios" },
  { id: "6", name: "Granola", price: 15.00, quantity: 8, unit: "kg", category: "Granola e Cereais" },
  { id: "7", name: "Aveia", price: 12.00, quantity: 6, unit: "kg", category: "Granola e Cereais" },
  { id: "8", name: "Calda de Chocolate", price: 22.00, quantity: 10, unit: "litro", category: "Caldas e Coberturas" },
  { id: "9", name: "Calda de Morango", price: 20.00, quantity: 8, unit: "litro", category: "Caldas e Coberturas" },
  { id: "10", name: "Copo Descartável 300ml", price: 35.00, quantity: 20, unit: "pacote", category: "Descartáveis" },
  { id: "11", name: "Colher Descartável", price: 18.00, quantity: 15, unit: "pacote", category: "Descartáveis" },
];

export default function LanchonetePreparos() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", quantity: "", unit: "", category: "" });

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
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.quantity || !newProduct.category) {
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
      unit: newProduct.unit || "unidade",
      category: newProduct.category,
    };

    setProducts((prev) => [...prev, product]);
    setNewProduct({ name: "", price: "", quantity: "", unit: "", category: "" });
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
                Itens de Preparo
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os insumos e itens de preparo
              </p>
            </div>

            <div className="flex gap-3">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
                    <PlusCircle className="h-5 w-5" />
                    Adicionar Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Item</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Açaí Polpa 10kg"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Preço (R$)</Label>
                        <Input
                          id="price"
                          placeholder="Ex: 25,00"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unidade</Label>
                        <Input
                          id="unit"
                          placeholder="Ex: kg, litro"
                          value={newProduct.unit}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, unit: e.target.value }))}
                        />
                      </div>
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
                      Adicionar Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleScanInvoice}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <ScanLine className="h-5 w-5" />
                Escanear Nota Fiscal
              </Button>
            </div>
          </div>

          {/* Products List */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5 text-primary" />
                Itens em Estoque
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        R$ {product.price.toFixed(2).replace(".", ",")} / {product.unit}
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
