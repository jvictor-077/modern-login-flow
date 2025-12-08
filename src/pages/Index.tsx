import { Link } from "react-router-dom";
import LoginForm from "@/components/LoginForm";
import FloatingShapes from "@/components/FloatingShapes";
import { MapPin, Calendar, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen relative flex">
      {/* Background gradient */}
      <div 
        className="fixed inset-0"
        style={{ background: "var(--gradient-background)" }}
      />
      
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12">
        <FloatingShapes />
        
        <div className="relative z-10 max-w-lg animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center glow-primary">
              <span className="text-3xl">🏐</span>
            </div>
            <div>
              <span className="text-2xl font-display font-bold">QuadraPro</span>
              <p className="text-xs text-muted-foreground">Sistema de Reservas</p>
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-6">
            Sua quadra favorita{" "}
            <span className="text-gradient">a um clique</span>
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            Reserve quadras de vôlei, beach tennis, futevôlei e muito mais. 
            Gerencie suas partidas e encontre parceiros para jogar.
          </p>
          
          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Reservas em tempo real</p>
                <p className="text-sm text-muted-foreground">Veja horários disponíveis instantaneamente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-medium">Encontre parceiros</p>
                <p className="text-sm text-muted-foreground">Conecte-se com outros jogadores</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Múltiplas quadras</p>
                <p className="text-sm text-muted-foreground">Beach Tennis, Vôlei, Futevôlei e mais</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center glow-primary">
              <span className="text-2xl">🏐</span>
            </div>
            <div>
              <span className="text-xl font-display font-bold">QuadraPro</span>
              <p className="text-xs text-muted-foreground">Sistema de Reservas</p>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">Bem-vindo de volta!</h2>
              <p className="text-muted-foreground">
                Entre para reservar sua quadra
              </p>
            </div>
            
            <LoginForm />
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Novo por aqui?{" "}
            <Link to="/cadastro" className="text-primary hover:underline font-medium">
              Criar conta grátis
            </Link>
          </p>
          
          {/* Sports icons decoration for mobile */}
          <div className="lg:hidden flex justify-center gap-4 mt-8">
            <span className="text-2xl opacity-50">🏐</span>
            <span className="text-2xl opacity-50">🎾</span>
            <span className="text-2xl opacity-50">🏸</span>
            <span className="text-2xl opacity-50">⚽</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
