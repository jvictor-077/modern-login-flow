// =============================================
// DADOS MOCKADOS - ESTOQUE QUADRA (INTEGRADO)
// =============================================

// Definição da interface ProdutoEstoque (Assumida de "@/types/estoque")
// Adicionada para que este arquivo seja autônomo.
interface ProdutoEstoque {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  categoria?: string; // Adicionado "?" pois nem todos os mocks o utilizam
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  // Outras propriedades se existirem em "@/types/estoque"
}

export const produtosEstoqueQuadra: ProdutoEstoque[] = [
  {
    id: "prod-1",
    nome: "Bola de Vôlei Mikasa",
    preco: 189.9,
    quantidade: 8,
    categoria: "Equipamentos",
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: "prod-2",
    nome: "Raquete Beach Tennis Pro",
    preco: 459.9,
    quantidade: 5,
    categoria: "Equipamentos",
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: "prod-3",
    nome: "Rede de Vôlei Profissional",
    preco: 299.9,
    quantidade: 3,
    categoria: "Equipamentos",
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: "prod-4",
    nome: "Kit Marcação de Quadra",
    preco: 89.9,
    quantidade: 12,
    categoria: "Materiais",
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: "prod-5",
    nome: "Bola de Beach Tennis (Pack 3)",
    preco: 59.9,
    quantidade: 20,
    categoria: "Equipamentos",
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: "prod-6",
    nome: "Grip Overgrip (Pack 10)",
    preco: 34.9,
    quantidade: 15,
    categoria: "Acessórios",
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: "prod-7",
    nome: "Squeeze 1L",
    preco: 24.9,
    quantidade: 25,
    categoria: "Acessórios",
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: "prod-8",
    nome: "Toalha Esportiva",
    preco: 39.9,
    quantidade: 18,
    categoria: "Acessórios",
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
];

// =============================================
// COMPONENTE ESTOQUE (INTEGRADO)
// =============================================
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
// import { ProdutoEstoque } from "@/types/estoque"; // Removido, definido no início
// import { produtosEstoqueQuadra } from "@/data/estoqueData"; // Removido, definido e exportado no início
import { QRCodeScanner } from "@/components/QRCodeScanner";
import { ScannedProductsConfirmation } from "@/components/ScannedProductsConfirmation";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScannedProduct {
  nome: string;
  quantidade: number;
  preco: number;
  unidade?: string;
}

// O tipo ProdutoEstoque já foi definido acima
type EstoqueProduto = ProdutoEstoque; // Alias para clareza, se necessário

export default function Estoque() {
  // Agora 'produtosEstoqueQuadra' é importado localmente (no mesmo arquivo)
  const [products, setProducts] = useState<EstoqueProduto[]>(produtosEstoqueQuadra);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", quantity: "" });
  const isMobile = useIsMobile();

  const handleQuantityChange = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === id) {
          const newQuantity = Math.max(0, product.quantidade + delta);
          return { ...product, quantidade: newQuantity, updated_at: new Date() };
        }
        return product;
      }),
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
    const newProducts: EstoqueProduto[] = confirmedProducts.map((p, index) => ({
      id: `scanned-${Date.now()}-${index}`,
      nome: p.nome,
      preco: p.preco,
      quantidade: Math.round(p.quantidade), // Sempre arredondar para inteiro no estoque
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    setProducts((prev) => [...prev, ...newProducts]);
    setScannedProducts([]);
    toast({
      title: "Produtos adicionados!",
      description: `${newProducts.length} produtos foram adicionados ao estoque.`,
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

    const product: EstoqueProduto = {
      id: `prod-${Date.now()}`,
      nome: newProduct.name.trim(),
      preco: parseFloat(newProduct.price.replace(",", ".")),
      quantidade: parseInt(newProduct.quantity),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    setProducts((prev) => [...prev, product]);
    setNewProduct({ name: "", price: "", quantity: "" });
    setIsAddDialogOpen(false);
    toast({
      title: "Produto adicionado",
      description: `${product.nome} foi adicionado ao estoque.`,
    });
  };

  const totalValue = products.reduce((acc, product) => acc + product.preco * product.quantidade, 0);

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
          <div className="divide-y divide-border/50">
            {products.map((product) => (
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
                    onClick={() => handleQuantityChange(product.id, -1)}
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
                    onClick={() => handleQuantityChange(product.id, 1)}
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
