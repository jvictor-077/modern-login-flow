import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine, Plus, Minus, Package } from "lucide-react";
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

  const totalValue = products.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                Estoque
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os produtos do seu estoque
              </p>
            </div>

            <Button
              onClick={handleScanInvoice}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <ScanLine className="h-5 w-5" />
              Escanear Nota Fiscal
            </Button>
          </div>

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

                      <span className="w-12 text-center font-semibold text-foreground tabular-nums">
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

                      <div className="w-28 text-right">
                        <span className="font-medium text-foreground">
                          R$ {(product.price * product.quantity).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t-2 border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">
                    Valor Total do Estoque
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {totalValue.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}
