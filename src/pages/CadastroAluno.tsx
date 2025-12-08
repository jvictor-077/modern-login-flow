import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Phone, Mail, MapPin, Heart, Calendar, FileText } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import { precosModalidades, getPlanosModalidade, formatarPreco, matricula } from "@/data/precosData";
import { TIPOS_SANGUINEOS } from "@/types/aluno";

// Lista de modalidades extraída de precosData
const modalidadesDisponiveis = precosModalidades.map((m) => ({
  id: m.modalidade.toLowerCase().replace(/\s+/g, "_"),
  nome: m.modalidade,
}));

const CadastroAluno = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    dataNascimento: "",
    endereco: "",
    contatoEmergencia: "",
    tipoSanguineo: "",
    doencas: "",
    alergias: "",
    autorizacaoImagem: false,
    observacoes: "",
    modalidades: [] as string[],
  });

  const handleModalidadeChange = (modalidadeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      modalidades: checked
        ? [...prev.modalidades, modalidadeId]
        : prev.modalidades.filter(m => m !== modalidadeId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.telefone) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (formData.modalidades.length === 0) {
      toast.error("Selecione pelo menos uma modalidade");
      return;
    }

    setIsSubmitting(true);

    // Simula envio para o backend
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success("Cadastro enviado com sucesso!", {
      description: "Aguarde a confirmação da sua matrícula pelo administrador."
    });

    setIsSubmitting(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen relative">
      {/* Background gradient */}
      <div 
        className="fixed inset-0"
        style={{ background: "var(--gradient-background)" }}
      />
      
      <FloatingShapes />

      <div className="relative z-10 container max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center glow-primary">
              <span className="text-2xl">🏐</span>
            </div>
            <div>
              <span className="text-xl font-display font-bold">Sunset</span>
              <p className="text-xs text-muted-foreground">Cadastro de Aluno</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Formulário de Matrícula
            </CardTitle>
            <CardDescription>
              Preencha seus dados para solicitar matrícula. Após o envio, aguarde a confirmação do administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2 text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  Dados Pessoais
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipoSanguineo">Tipo Sanguíneo</Label>
                    <Select
                      value={formData.tipoSanguineo}
                      onValueChange={(value) => setFormData({ ...formData, tipoSanguineo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_SANGUINEOS.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2 text-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  Contato
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contatoEmergencia">Contato de Emergência</Label>
                  <Input
                    id="contatoEmergencia"
                    value={formData.contatoEmergencia}
                    onChange={(e) => setFormData({ ...formData, contatoEmergencia: e.target.value })}
                    placeholder="Nome e telefone"
                  />
                </div>
              </div>

              {/* Saúde */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2 text-foreground">
                  <Heart className="h-4 w-4 text-primary" />
                  Informações de Saúde
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="doencas">Doenças / Condições</Label>
                    <Input
                      id="doencas"
                      value={formData.doencas}
                      onChange={(e) => setFormData({ ...formData, doencas: e.target.value })}
                      placeholder="Ex: Diabetes, Hipertensão..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="alergias">Alergias</Label>
                    <Input
                      id="alergias"
                      value={formData.alergias}
                      onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                      placeholder="Ex: Amendoim, Látex..."
                    />
                  </div>
                </div>
              </div>

              {/* Modalidades */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  Modalidades *
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione as modalidades que deseja praticar
                </p>
                
                <div className="grid gap-3">
                  {modalidadesDisponiveis.map((modalidade) => {
                    const planos = getPlanosModalidade(modalidade.nome);
                    return (
                      <div
                        key={modalidade.id}
                        className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={modalidade.id}
                            checked={formData.modalidades.includes(modalidade.id)}
                            onCheckedChange={(checked) => 
                              handleModalidadeChange(modalidade.id, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={modalidade.id} 
                            className="cursor-pointer font-medium"
                          >
                            {modalidade.nome}
                          </Label>
                        </div>
                        {planos.length > 0 && (
                          <div className="ml-6 text-sm text-muted-foreground">
                            {planos.map((p) => (
                              <span key={p.nome} className="mr-3">
                                {p.nome}: {formatarPreco(p.valor)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Info Matrícula */}
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-sm font-medium">
                    Taxa de Matrícula: {formatarPreco(matricula.valor)}
                  </p>
                  <p className="text-xs text-muted-foreground">{matricula.descricao}</p>
                </div>
              </div>

              {/* Observações e Autorizações */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Informações adicionais que deseja compartilhar..."
                    rows={3}
                  />
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border/50 bg-card/50">
                  <Checkbox
                    id="autorizacaoImagem"
                    checked={formData.autorizacaoImagem}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, autorizacaoImagem: checked as boolean })
                    }
                  />
                  <div>
                    <Label htmlFor="autorizacaoImagem" className="cursor-pointer">
                      Autorização de uso de imagem
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Autorizo o uso da minha imagem para divulgação em redes sociais e materiais promocionais.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Cadastro"}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                * Campos obrigatórios
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CadastroAluno;
