import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X, Camera, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

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
      // Accept both HTTP and HTTPS (SEFAZ QR codes often use HTTP)
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        return false;
      }
      // Must be a valid Brazilian government SEFAZ/Fazenda domain
      // Examples: nfce.sefaz.pe.gov.br, www.sefaz.am.gov.br, nfce.fazenda.sp.gov.br
      const hostname = parsedUrl.hostname.toLowerCase();
      const validDomainPatterns = [
        /sefaz.*\.gov\.br$/,     // Any subdomain containing sefaz before .gov.br
        /fazenda.*\.gov\.br$/,   // Any subdomain containing fazenda before .gov.br
        /nfce.*\.gov\.br$/,      // Any NFC-e government domain
      ];
      return validDomainPatterns.some(pattern => pattern.test(hostname));
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
      description: "Buscando produtos...",
    });

    try {
      // Use edge function to fetch and parse the NFC-e page (bypasses CORS)
      const { data, error } = await supabase.functions.invoke('parse-nfce', {
        body: { url },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao processar nota');
      }

      if (data?.success && data?.products?.length > 0) {
        toast({
          title: "Produtos encontrados!",
          description: `${data.products.length} produtos identificados na nota fiscal.`,
        });
        onProductsScanned(data.products);
      } else {
        toast({
          title: "Nenhum produto encontrado",
          description: data?.error || "Não foi possível extrair produtos da nota fiscal.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao processar nota fiscal:', error);
      toast({
        title: "Erro ao processar nota",
        description: error instanceof Error ? error.message : "Não foi possível acessar a nota fiscal.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
      onClose();
    }
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
