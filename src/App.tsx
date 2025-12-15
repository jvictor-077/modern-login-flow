import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";

import CadastroAluno from "./pages/CadastroAluno";
import AdminDashboard from "./pages/AdminDashboard";
import Estoque from "./pages/Estoque";
import Mensalidades from "./pages/Mensalidades";
import LanchoneteDashboard from "./pages/lanchonete/LanchoneteDashboard";
import LanchonetePedidos from "./pages/lanchonete/LanchonetePedidos";
import LanchoneteEstoque from "./pages/lanchonete/LanchoneteEstoque";
import LanchonetePreparos from "./pages/lanchonete/LanchonetePreparos";
import NotFound from "./pages/NotFound";

// Aluno pages with layout
import { AlunoLayout } from "./components/aluno/AlunoLayout";
import AlunoHomeContent from "./pages/aluno/AlunoHomeContent";
import ReservarHorario from "./pages/aluno/ReservarHorario";
import MinhasReservas from "./pages/aluno/MinhasReservas";
import LanchoneteCardapio from "./pages/aluno/LanchoneteCardapio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            
            <Route path="/cadastro" element={<CadastroAluno />} />
            
            {/* Aluno routes - AlunoLayout handles its own session check */}
            <Route path="/aluno" element={
              <AlunoLayout><AlunoHomeContent /></AlunoLayout>
            } />
            <Route path="/aluno/reservar" element={
              <AlunoLayout><ReservarHorario /></AlunoLayout>
            } />
            <Route path="/aluno/reservas" element={
              <AlunoLayout><MinhasReservas /></AlunoLayout>
            } />
            <Route path="/aluno/lanchonete" element={
              <AlunoLayout><LanchoneteCardapio /></AlunoLayout>
            } />
            
            {/* Admin routes - protected */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/estoque" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Estoque />
              </ProtectedRoute>
            } />
            <Route path="/admin/mensalidades" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Mensalidades />
              </ProtectedRoute>
            } />
            
            {/* Lanchonete routes - protected */}
            <Route path="/admin/lanchonete" element={
              <ProtectedRoute allowedRoles={['admin', 'lanchonete']}>
                <LanchoneteDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/lanchonete/pedidos" element={
              <ProtectedRoute allowedRoles={['admin', 'lanchonete']}>
                <LanchonetePedidos />
              </ProtectedRoute>
            } />
            <Route path="/admin/lanchonete/estoque" element={
              <ProtectedRoute allowedRoles={['admin', 'lanchonete']}>
                <LanchoneteEstoque />
              </ProtectedRoute>
            } />
            <Route path="/admin/lanchonete/preparos" element={
              <ProtectedRoute allowedRoles={['admin', 'lanchonete']}>
                <LanchonetePreparos />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
