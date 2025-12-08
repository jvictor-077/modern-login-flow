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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Package, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProdutoLanchonete, CATEGORIAS_LANCHONETE, CategoriaLanchonete } from "@/types/lanchonete";
import { produtosLanchonete } from "@/data/lanchoneteData";

export default function LanchoneteEstoque() {
  const [products, setProducts] = useState<ProdutoLanchonete[]>(produtosLanchonete);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", quantity: "", category: "" });

  const handleQuantityChange = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === id) {
          const newQuantity = Math.max(0, product.quantidade + delta);
          return { ...product, quantidade: newQuantity, updated_at: new Date() };
        }
        return product;
      })
    );
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

    const product: ProdutoLanchonete = {
      id: `lanch-${Date.now()}`,
      nome: newProduct.name.trim(),
      preco: parseFloat(newProduct.price.replace(",", ".")),
      quantidade: parseInt(newProduct.quantity),
      categoria: newProduct.category as CategoriaLanchonete,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    setProducts((prev) => [...prev, product]);
    setNewProduct({ name: "", price: "", quantity: "", category: "" });
    setIsAddDialogOpen(false);
    toast({
      title: "Produto adicionado",
      description: `${product.nome} foi adicionado ao estoque.`,
    });
  };

  const totalValue = products.reduce(
    (acc, product) => acc + product.preco * product.quantidade,
    0
  );

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.categoria]) {
      acc[product.categoria] = [];
    }
    acc[product.categoria].push(product);
    return acc;
  }, {} as Record<string, ProdutoLanchonete[]>);

  const actions = (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <PlusCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Adicionar Produto</span>
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
              placeholder="Ex: Refrigerante Lata"
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
                {CATEGORIAS_LANCHONETE.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
  );

  return (
    <AdminLayout
      title="Estoque Lanchonete"
      description="Gerencie os produtos da lanchonete"
      actions={actions}
    >
      {/* Products by Category */}
      <div className="space-y-4 sm:space-y-6">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <Card key={category} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {categoryProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="font-medium text-foreground truncate text-sm sm:text-base">
                        {product.nome}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        R$ {product.preco.toFixed(2).replace(".", ",")} / unidade
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

                      <span className={`w-8 sm:w-12 text-center font-semibold tabular-nums text-sm sm:text-base ${
                        product.quantidade <= 5 ? "text-destructive" : "text-foreground"
                      }`}>
                        {product.quantidade}
                      </span>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 border-border/50 hover:bg-accent/50 hover:text-accent-foreground hover:border-accent/50"
                        onClick={() => handleQuantityChange(product.id, 1)}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>

                      <div className="w-16 sm:w-24 text-right">
                        <span className="font-medium text-foreground text-sm sm:text-base">
                          R$ {(product.preco * product.quantidade).toFixed(2).replace(".", ",")}
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
      <Card className="mt-4 sm:mt-6 border-primary/30 bg-primary/5">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-semibold text-foreground">
              Valor Total
            </span>
            <span className="text-xl sm:text-2xl font-bold text-primary">
              R$ {totalValue.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
