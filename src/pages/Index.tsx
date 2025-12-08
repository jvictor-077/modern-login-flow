import LoginForm from "@/components/LoginForm";
import FloatingShapes from "@/components/FloatingShapes";

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
        
        <div className="relative z-10 max-w-md animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <span className="text-2xl font-bold text-primary-foreground">L</span>
            </div>
            <span className="text-2xl font-display font-bold">Lumina</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-6">
            Bem-vindo de volta ao{" "}
            <span className="text-gradient">futuro</span>
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Acesse sua conta para continuar explorando as possibilidades infinitas da nossa plataforma.
          </p>
          
          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium"
                  style={{ zIndex: 5 - i }}
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-medium">+10.000 usuários</p>
              <p className="text-xs text-muted-foreground">já estão conectados</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <span className="text-xl font-bold text-primary-foreground">L</span>
            </div>
            <span className="text-xl font-display font-bold">Lumina</span>
          </div>
          
          <div className="glass rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">Fazer login</h2>
              <p className="text-muted-foreground">
                Entre com suas credenciais para acessar
              </p>
            </div>
            
            <LoginForm />
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem uma conta?{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
