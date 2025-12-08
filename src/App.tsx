import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import Estoque from "./pages/Estoque";
import Mensalidades from "./pages/Mensalidades";
import LanchoneteDashboard from "./pages/lanchonete/LanchoneteDashboard";
import LanchonetePedidos from "./pages/lanchonete/LanchonetePedidos";
import LanchoneteEstoque from "./pages/lanchonete/LanchoneteEstoque";
import LanchonetePreparos from "./pages/lanchonete/LanchonetePreparos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/estoque" element={<Estoque />} />
          <Route path="/admin/mensalidades" element={<Mensalidades />} />
          <Route path="/admin/lanchonete" element={<LanchoneteDashboard />} />
          <Route path="/admin/lanchonete/pedidos" element={<LanchonetePedidos />} />
          <Route path="/admin/lanchonete/estoque" element={<LanchoneteEstoque />} />
          <Route path="/admin/lanchonete/preparos" element={<LanchonetePreparos />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
