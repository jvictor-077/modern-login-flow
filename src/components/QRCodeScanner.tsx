import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X, Camera, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScannedProduct {
  nome: string;
  quantidade: number;
  preco: number;
  unidade?: string;
}

interface QRCodeScannerProps {
  open: boolean;
  onClose: () => void;
  onProductsScanned: (products: ScannedProduct[]) => void;
}

export function QRCodeScanner({ open, onClose, onProductsScanned }: QRCodeScannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const hasScannedRef = useRef(false);
  const isMobile = useIsMobile();

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.log("Scanner cleanup:", err);
      }
      scannerRef.current = null;
    }
  }, []);

  // Validates that a URL is from an official Brazilian SEFAZ domain
  const isValidSefazUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      // Must be HTTPS
      if (parsedUrl.protocol !== 'https:') {
        return false;
      }
      // Must be a valid Brazilian government SEFAZ/Fazenda domain
      const hostname = parsedUrl.hostname.toLowerCase();
      const validDomainPattern = /^[\w.-]+\.(fazenda|sefaz)[\w.-]*\.gov\.br$/;
      return validDomainPattern.test(hostname);
    } catch {
      return false;
    }
  };

  const handleQRCodeResult = useCallback(async (url: string) => {
    // Prevent duplicate processing
    if (isProcessingRef.current || hasScannedRef.current) {
      return;
    }
    
    isProcessingRef.current = true;
    hasScannedRef.current = true;
    
    // Stop scanner immediately
    await stopScanner();
    
    // Validate URL - must be from official SEFAZ domain
    if (!isValidSefazUrl(url)) {
      toast({
        title: "QR Code inválido",
        description: "Este QR Code não é de uma nota fiscal válida. Apenas notas fiscais de domínios oficiais (sefaz.gov.br) são aceitas.",
        variant: "destructive",
      });
      isProcessingRef.current = false;
      onClose();
      return;
    }

    setIsLoading(true);
    
    toast({
      title: "Nota fiscal detectada!",
      description: "Abrindo nota em nova aba e carregando produtos de exemplo...",
    });

    // Open the SEFAZ URL in a new tab so user can view the actual invoice
    window.open(url, '_blank', 'noopener,noreferrer');

    // Since CORS blocks direct access to SEFAZ websites from browser,
    // we use demonstration products. In production, use a backend proxy/edge function.
    const demoProducts: ScannedProduct[] = [
      { nome: "LING AURORA kg CHUR", quantidade: 0.51, preco: 16.98, unidade: "KG" },
      { nome: "MASSA PRONTA TAPIOCA TIA DORA 1kg", quantidade: 1, preco: 6.28, unidade: "UN" },
      { nome: "ALHO GRANEL kg", quantidade: 0.07, preco: 13.80, unidade: "KG" },
      { nome: "EXT TOM POMODORO TP 265G", quantidade: 1, preco: 2.38, unidade: "UN" },
      { nome: "PALETA SUINA RESF kg", quantidade: 0.368, preco: 19.48, unidade: "KG" },
      { nome: "FILEZINHO FGO CONG AURORA BD1kg", quantidade: 1, preco: 23.48, unidade: "BD" },
      { nome: "ARROZ BR TIO URBANO 1kg", quantidade: 2, preco: 4.68, unidade: "UN" },
      { nome: "TOMATE SALADETE kg", quantidade: 0.93, preco: 5.48, unidade: "KG" },
      { nome: "SAB SENADOR 130G COUNTRY", quantidade: 1, preco: 7.25, unidade: "UN" },
      { nome: "COENTRO UN", quantidade: 1, preco: 2.98, unidade: "UN" },
      { nome: "FOSFORO HOME FIAT LUX", quantidade: 1, preco: 5.18, unidade: "UN" },
    ];
    
    // Short delay to allow new tab to open
    setTimeout(() => {
      toast({
        title: "Produtos carregados!",
        description: `${demoProducts.length} produtos de demonstração. A nota fiscal foi aberta em nova aba.`,
      });
      
      onProductsScanned(demoProducts);
      setIsLoading(false);
      isProcessingRef.current = false;
      onClose();
    }, 500);
  }, [onProductsScanned, onClose, stopScanner]);

  const startScanner = useCallback(async () => {
    if (scannerRef.current || isProcessingRef.current) return;
    
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleQRCodeResult(decodedText);
        },
        () => {
          // Ignore scanning errors
        }
      );
    } catch (err) {
      console.error("Erro ao iniciar scanner:", err);
      toast({
        title: "Erro ao acessar câmera",
        description: "Verifique as permissões da câmera.",
        variant: "destructive",
      });
    }
  }, [handleQRCodeResult]);

  useEffect(() => {
    if (open && isMobile) {
      hasScannedRef.current = false;
      isProcessingRef.current = false;
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => clearTimeout(timer);
    }
    
    return () => {
      stopScanner();
    };
  }, [open, isMobile, startScanner, stopScanner]);

  const handleClose = useCallback(() => {
    stopScanner();
    hasScannedRef.current = false;
    isProcessingRef.current = false;
    onClose();
  }, [stopScanner, onClose]);

  if (!isMobile) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent side="bottom" className="h-[85vh] p-0">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Escanear Nota Fiscal
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Processando nota fiscal...</p>
            </div>
          ) : (
            <>
              <div 
                id="qr-reader" 
                className="w-full max-w-[280px] aspect-square rounded-lg overflow-hidden bg-muted"
              />
              <p className="text-center text-sm text-muted-foreground mt-4">
                Aponte a câmera para o QR Code da nota fiscal
              </p>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
