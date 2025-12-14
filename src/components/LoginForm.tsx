import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Key } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres");
const pinSchema = z.string().length(4, "PIN deve ter 4 dígitos").regex(/^\d+$/, "PIN deve conter apenas números");

const LoginForm = () => {
  // Admin login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Aluno login state
  const [alunoEmail, setAlunoEmail] = useState("");
  const [alunoPin, setAlunoPin] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const validateAdmin = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAluno = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(alunoEmail);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.alunoEmail = e.errors[0].message;
      }
    }
    
    try {
      pinSchema.parse(alunoPin);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.alunoPin = e.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const redirectByRole = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        navigate('/admin');
        break;
      case 'lanchonete':
        navigate('/lanchonete');
        break;
      case 'aluno':
      default:
        navigate('/aluno');
        break;
    }
  };

  // Login para Admin/Lanchonete (usa Supabase Auth)
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAdmin()) return;
    
    setIsLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      setIsLoading(false);
      toast({
        title: "Erro ao entrar",
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
      
      // Buscar role diretamente do banco para garantir redirecionamento correto
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', sessionData.session.user.id)
          .maybeSingle();
        
        setIsLoading(false);
        
        if (roleData?.role) {
          redirectByRole(roleData.role);
        } else {
          navigate('/aluno');
        }
      } else {
        setIsLoading(false);
        navigate('/aluno');
      }
    }
  };

  // Login para Aluno (usa PIN da tabela alunos)
  const handleAlunoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAluno()) return;
    
    setIsLoading(true);

    try {
      // Buscar aluno pelo email e verificar PIN
      const { data: aluno, error } = await supabase
        .from("alunos")
        .select("id, nome, email, pin, situacao")
        .eq("email", alunoEmail.trim().toLowerCase())
        .maybeSingle();

      if (error) {
        throw new Error("Erro ao verificar credenciais");
      }

      if (!aluno) {
        toast({
          title: "Erro ao entrar",
          description: "Email não encontrado. Verifique ou faça seu cadastro.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (aluno.pin !== alunoPin) {
        toast({
          title: "Erro ao entrar",
          description: "PIN incorreto.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (aluno.situacao === "pendente") {
        toast({
          title: "Cadastro pendente",
          description: "Seu cadastro ainda está aguardando aprovação do administrador.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Salvar dados do aluno no localStorage para a sessão
      localStorage.setItem("aluno_session", JSON.stringify({
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
      }));

      toast({
        title: `Bem-vindo, ${aluno.nome.split(' ')[0]}!`,
        description: "Login realizado com sucesso.",
      });

      setIsLoading(false);
      navigate('/aluno');
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro ao entrar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="aluno" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="aluno">Aluno</TabsTrigger>
        <TabsTrigger value="admin">Admin / Staff</TabsTrigger>
      </TabsList>

      {/* Login Aluno - com PIN */}
      <TabsContent value="aluno">
        <form onSubmit={handleAlunoSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="alunoEmail" className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="alunoEmail"
                type="email"
                placeholder="seu@email.com"
                value={alunoEmail}
                onChange={(e) => setAlunoEmail(e.target.value)}
                className="pl-12"
                required
                disabled={isLoading}
              />
            </div>
            {errors.alunoEmail && (
              <p className="text-sm text-destructive">{errors.alunoEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="alunoPin" className="text-sm font-medium text-muted-foreground">
              PIN de Acesso (4 dígitos)
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="alunoPin"
                type="password"
                placeholder="••••"
                value={alunoPin}
                onChange={(e) => setAlunoPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="pl-12 tracking-widest text-center"
                maxLength={4}
                required
                disabled={isLoading}
              />
            </div>
            {errors.alunoPin && (
              <p className="text-sm text-destructive">{errors.alunoPin}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="w-full group"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Entrar na Quadra
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </TabsContent>

      {/* Login Admin/Staff - com senha Supabase */}
      <TabsContent value="admin">
        <form onSubmit={handleAdminSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12"
                required
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="w-full group"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Entrar como Admin
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};

export default LoginForm;
