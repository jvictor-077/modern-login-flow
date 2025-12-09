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
import { ScanLine, Plus, Minus, Package, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { QRCodeScanner } from "@/components/QRCodeScanner";
import { ScannedProductsConfirmation } from "@/components/ScannedProductsConfirmation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEstoque } from "@/hooks/useEstoque";

interface ScannedProduct {
  nome: string;
  quantidade: number;
  preco: number;
  unidade?: string;
}

export default function Estoque() {
  const { produtos, isLoading, addProduto, updateQuantidade } = useEstoque();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", quantity: "", category: "" });
  const isMobile = useIsMobile();

  const handleQuantityChange = (id: string, currentQty: number, delta: number) => {
    const newQuantity = Math.max(0, currentQty + delta);
    updateQuantidade.mutate({ id, quantidade: newQuantity });
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
    confirmedProducts.forEach((p) => {
      addProduto.mutate({
        nome: p.nome,
        preco: p.preco,
        quantidade: Math.round(p.quantidade),
        categoria: "Nota Fiscal",
        is_active: true,
      });
    });
    setScannedProducts([]);
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

    addProduto.mutate({
      nome: newProduct.name.trim(),
      preco: parseFloat(newProduct.price.replace(",", ".")),
      quantidade: parseInt(newProduct.quantity),
      categoria: newProduct.category || "Geral",
      is_active: true,
    });

    setNewProduct({ name: "", price: "", quantity: "", category: "" });
    setIsAddDialogOpen(false);
  };

  const totalValue = produtos.reduce((acc, product) => acc + product.preco * product.quantidade, 0);

  if (isLoading) {
    return (
      <AdminLayout title="Estoque" description="Gerencie os produtos do seu estoque">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

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
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                placeholder="Ex: Equipamentos"
                value={newProduct.category}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <Button onClick={handleAddProduct} className="w-full mt-4" disabled={addProduto.isPending}>
              {addProduto.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Adicionar Produto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button onClick={handleScanInvoice} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
        <ScanLine className="h-5 w-5" />
        <span className="hidden sm:inline">Escanear Nota Fiscal</span>
        <span className="sm:hidden">Escanear</span>
      </Button>
    </>
  );

  return (
    <AdminLayout title="Estoque" description="Gerencie os produtos do seu estoque" actions={actions}>
      {/* Products List */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5 text-primary" />
            Produtos em Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {produtos.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum produto cadastrado. Adicione seu primeiro produto!
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {produtos.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-medium text-foreground truncate text-sm sm:text-base">{product.nome}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    R$ {product.preco.toFixed(2).replace(".", ",")} / unidade
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                    onClick={() => handleQuantityChange(product.id, product.quantidade, -1)}
                    disabled={updateQuantidade.isPending}
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>

                  <span className="w-8 sm:w-12 text-center font-semibold text-foreground tabular-nums text-sm sm:text-base">
                    {product.quantidade}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 border-border/50 hover:bg-accent/50 hover:text-accent-foreground hover:border-accent/50"
                    onClick={() => handleQuantityChange(product.id, product.quantidade, 1)}
                    disabled={updateQuantidade.isPending}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>

                  <div className="w-20 sm:w-28 text-right">
                    <span className="font-medium text-foreground text-sm sm:text-base">
                      R$ {(product.preco * product.quantidade).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="border-t-2 border-primary/30 bg-primary/5 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-semibold text-foreground">Valor Total do Estoque</span>
              <span className="text-xl sm:text-2xl font-bold text-primary">
                R$ {totalValue.toFixed(2).replace(".", ",")}
              </span>
            </div>
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
