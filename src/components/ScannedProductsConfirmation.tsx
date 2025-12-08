import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Package } from "lucide-react";

interface ScannedProduct {
  nome: string;
  quantidade: number;
  preco: number;
  unidade?: string;
}

interface ScannedProductsConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (products: ScannedProduct[]) => void;
  products: ScannedProduct[];
}

export function ScannedProductsConfirmation({
  open,
  onClose,
  onConfirm,
  products,
}: ScannedProductsConfirmationProps) {
  const totalValue = products.reduce(
    (sum, p) => sum + p.quantidade * p.preco,
    0
  );

  const handleConfirm = () => {
    onConfirm(products);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Confirmar Produtos
          </DialogTitle>
          <DialogDescription>
            {products.length} produtos encontrados na nota fiscal
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-2">
          <div className="space-y-2">
            {products.map((product, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-muted/50 border border-border"
              >
                <p className="font-medium text-sm leading-tight mb-1">{product.nome}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {product.quantidade} {product.unidade || "UN"} × R$ {product.preco.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="font-semibold text-sm text-primary whitespace-nowrap">
                    R$ {(product.quantidade * product.preco).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground">Total:</span>
          <span className="font-bold text-lg">
            R$ {totalValue.toFixed(2).replace(".", ",")}
          </span>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto gap-2">
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="w-full sm:w-auto gap-2">
            <Check className="h-4 w-4" />
            Adicionar {products.length} itens
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
