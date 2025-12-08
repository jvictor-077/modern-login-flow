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
import { Plus, Minus, Package, PlusCircle, ScanLine } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ItemPreparo } from "@/types/lanchonete";
import { itensPreparo } from "@/data/lanchoneteData";
import { QRCodeScanner } from "@/components/QRCodeScanner";
import { ScannedProductsConfirmation } from "@/components/ScannedProductsConfirmation";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScannedProduct {
  nome: string;
  quantidade: number;
  preco: number;
  unidade?: string;
}

export default function LanchonetePreparos() {
  const [products, setProducts] = useState<ItemPreparo[]>(itensPreparo);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", quantity: "", unit: "" });
  const isMobile = useIsMobile();

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

  const handleScanInvoice = () => {
    if (isMobile) {
      setIsScannerOpen(true);
    } else {
      toast({
        title: "Escanear Nota Fiscal",
        description: "Use um dispositivo móvel para escanear o QR Code da nota fiscal.",
      });
    }
  };

  const handleProductsScanned = (products: ScannedProduct[]) => {
    setScannedProducts(products);
    setIsConfirmationOpen(true);
  };

  const handleConfirmProducts = (confirmedProducts: ScannedProduct[]) => {
    const isKgUnit = (unit?: string) => unit?.toUpperCase() === "KG";
    
    const newProducts: ItemPreparo[] = confirmedProducts.map((p, index) => {
      const unidade = p.unidade || "unidade";
      // Se for KG, formata o nome com a quantidade decimal
      const nomeFormatado = isKgUnit(unidade) 
        ? `${p.nome} ${p.quantidade.toFixed(1).replace(".", ",")} KG`
        : p.nome;
      
      return {
        id: `scanned-${Date.now()}-${index}`,
        nome: nomeFormatado,
        preco: p.preco * p.quantidade, // Preço total do item
        quantidade: 1, // Cada item escaneado vira 1 unidade
        unidade: isKgUnit(unidade) ? "unidade" : unidade,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    setProducts((prev) => [...prev, ...newProducts]);
    setScannedProducts([]);
    toast({
      title: "Itens adicionados!",
      description: `${newProducts.length} itens foram adicionados ao estoque.`,
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.quantity) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar o item.",
        variant: "destructive",
      });
      return;
    }

    const product: ItemPreparo = {
      id: `prep-${Date.now()}`,
      nome: newProduct.name.trim(),
      preco: parseFloat(newProduct.price.replace(",", ".")),
      quantidade: parseInt(newProduct.quantity),
      unidade: newProduct.unit || "unidade",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    setProducts((prev) => [...prev, product]);
    setNewProduct({ name: "", price: "", quantity: "", unit: "" });
    setIsAddDialogOpen(false);
    toast({
      title: "Item adicionado",
      description: `${product.nome} foi adicionado ao estoque.`,
    });
  };

  const totalValue = products.reduce(
    (acc, product) => acc + product.preco * product.quantidade,
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
            <DialogTitle>Adicionar Novo Item</DialogTitle>
            <DialogDescription>Preencha os dados do item de preparo</DialogDescription>
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
        <span className="hidden sm:inline">Escanear Nota Fiscal</span>
        <span className="sm:hidden">Escanear</span>
      </Button>
    </>
  );

  return (
    <AdminLayout
      title="Itens de Preparo"
      description="Gerencie os insumos e itens de preparo"
      actions={actions}
    >
      {/* Products List */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 py-3 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Itens em Estoque
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
                    {product.nome}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    R$ {product.preco.toFixed(2).replace(".", ",")} / {product.unidade}
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

      {/* QR Code Scanner - Mobile only */}
      <QRCodeScanner
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductsScanned={handleProductsScanned}
      />

      {/* Confirmation Dialog */}
      <ScannedProductsConfirmation
        open={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmProducts}
        products={scannedProducts}
      />
    </AdminLayout>
  );
}
