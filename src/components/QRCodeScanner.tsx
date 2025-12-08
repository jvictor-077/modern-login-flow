import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X, Camera } from "lucide-react";
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
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (open && isMobile) {
      startScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [open, isMobile]);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      setIsScanning(true);
      
      await html5QrCode.start(
        { facingMode: "environment" }, // Câmera traseira
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          console.log("QR Code detectado:", decodedText);
          await handleQRCodeResult(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Ignora erros de não encontrar QR code (normal durante scan)
        }
      );
    } catch (err) {
      console.error("Erro ao iniciar scanner:", err);
      toast({
        title: "Erro ao acessar câmera",
        description: "Verifique as permissões da câmera no seu dispositivo.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        // Scanner já pode estar parado
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleQRCodeResult = async (url: string) => {
    setIsLoading(true);
    
    try {
      // Verifica se é uma URL de nota fiscal
      if (!url.includes("nfce") && !url.includes("nfe") && !url.includes("sefaz")) {
        toast({
          title: "QR Code inválido",
          description: "Este QR Code não parece ser de uma nota fiscal.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "QR Code detectado!",
        description: "Buscando produtos da nota fiscal...",
      });

      // Simula busca de produtos da nota fiscal
      // Em produção, isso seria uma chamada real para um backend que faz scraping da NFC-e
      await simulateFetchProducts(url);
      
    } catch (error) {
      console.error("Erro ao processar nota fiscal:", error);
      toast({
        title: "Erro ao processar",
        description: "Não foi possível extrair os produtos da nota fiscal.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateFetchProducts = async (url: string) => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Produtos simulados baseados em uma nota fiscal típica
    // Em produção, esses dados viriam do scraping da página da NFC-e
    const mockProducts: ScannedProduct[] = [
      { nome: "Refrigerante Coca-Cola 2L", quantidade: 6, preco: 9.99, unidade: "unidade" },
      { nome: "Água Mineral 500ml", quantidade: 12, preco: 2.50, unidade: "unidade" },
      { nome: "Salgadinho Doritos 96g", quantidade: 10, preco: 7.99, unidade: "unidade" },
      { nome: "Chocolate Bis 126g", quantidade: 8, preco: 5.49, unidade: "unidade" },
      { nome: "Suco Del Valle 1L", quantidade: 4, preco: 6.99, unidade: "unidade" },
    ];

    toast({
      title: "Produtos encontrados!",
      description: `${mockProducts.length} produtos foram identificados na nota fiscal.`,
    });

    onProductsScanned(mockProducts);
    onClose();
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isMobile) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent side="bottom" className="h-[90vh] p-0">
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
        
        <div className="flex flex-col items-center justify-center h-full p-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Processando nota fiscal...</p>
            </div>
          ) : (
            <>
              <div 
                id="qr-reader" 
                className="w-full max-w-[300px] aspect-square rounded-lg overflow-hidden bg-muted"
              />
              
              <p className="text-center text-muted-foreground mt-4 px-4">
                Aponte a câmera para o QR Code da nota fiscal
              </p>

              {!isScanning && (
                <Button onClick={startScanner} className="mt-4 gap-2">
                  <Camera className="h-4 w-4" />
                  Iniciar Câmera
                </Button>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
