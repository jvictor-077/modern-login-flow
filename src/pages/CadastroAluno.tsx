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
import { ArrowLeft, UserPlus, Phone, Heart, Calendar, FileText, Loader2 } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import { precosModalidades, getPlanosModalidade, formatarPreco, matricula } from "@/data/precosData";
import { TIPOS_SANGUINEOS } from "@/types/aluno";
import { supabase } from "@/integrations/supabase/client";

// Lista de modalidades extraída de precosData
const modalidadesDisponiveis = precosModalidades.map((m) => ({
  id: m.modalidade.toLowerCase().replace(/\s+/g, "_"),
  nome: m.modalidade,
}));

interface ModalidadeSelecionada {
  modalidade: string;
  plano: string;
}

const CadastroAluno = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    celular: "",
    cpf: "",
    dataNascimento: "",
    endereco: "",
    contatoEmergencia: "",
    tipoSanguineo: "",
    doencas: "",
    alergias: "",
    autorizacaoImagem: false,
    observacoes: "",
  });

  // Estado para modalidades com plano selecionado
  const [modalidadesSelecionadas, setModalidadesSelecionadas] = useState<ModalidadeSelecionada[]>([]);

  const handleModalidadeToggle = (modalidadeNome: string, checked: boolean) => {
    if (checked) {
      // Adiciona com plano vazio inicialmente
      setModalidadesSelecionadas(prev => [...prev, { modalidade: modalidadeNome, plano: "" }]);
    } else {
      // Remove a modalidade
      setModalidadesSelecionadas(prev => prev.filter(m => m.modalidade !== modalidadeNome));
    }
  };

  const handlePlanoChange = (modalidadeNome: string, plano: string) => {
    setModalidadesSelecionadas(prev =>
      prev.map(m => m.modalidade === modalidadeNome ? { ...m, plano } : m)
    );
  };

  const isModalidadeSelecionada = (modalidadeNome: string) => {
    return modalidadesSelecionadas.some(m => m.modalidade === modalidadeNome);
  };

  const getPlanoSelecionado = (modalidadeNome: string) => {
    return modalidadesSelecionadas.find(m => m.modalidade === modalidadeNome)?.plano || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome.trim() || !formData.email.trim() || !formData.celular.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (modalidadesSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma modalidade");
      return;
    }

    // Valida se todas as modalidades têm plano selecionado
    const modalidadesSemPlano = modalidadesSelecionadas.filter(m => !m.plano);
    if (modalidadesSemPlano.length > 0) {
      toast.error(`Selecione um plano para: ${modalidadesSemPlano.map(m => m.modalidade).join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Inserir aluno na tabela alunos (sem user_id pois é cadastro público)
      const { data: alunoData, error: alunoError } = await supabase
        .from("alunos")
        .insert({
          nome: formData.nome.trim(),
          email: formData.email.trim().toLowerCase(),
          cpf: formData.cpf.trim() || null,
          celular: formData.celular.trim() || null,
          data_nascimento: formData.dataNascimento || null,
          endereco: formData.endereco.trim() || null,
          contato_emergencia: formData.contatoEmergencia.trim() || null,
          tipo_sanguineo: formData.tipoSanguineo || null,
          doencas: formData.doencas.trim() || null,
          alergias: formData.alergias.trim() || null,
          autoriza_imagem: formData.autorizacaoImagem,
          observacoes: formData.observacoes.trim() || null,
          situacao: "pendente", // Aguardando confirmação do admin
        })
        .select("id")
        .single();

      if (alunoError) {
        console.error("Erro ao cadastrar aluno:", alunoError);
        
        if (alunoError.code === "23505") {
          toast.error("Este email já está cadastrado");
        } else {
          toast.error("Erro ao enviar cadastro. Tente novamente.");
        }
        return;
      }

      // 2. Inserir modalidades do aluno
      const modalidadesInsert = modalidadesSelecionadas.map(m => {
        const planoInfo = getPlanosModalidade(m.modalidade).find(p => p.nome === m.plano);
        return {
          aluno_id: alunoData.id,
          modalidade: m.modalidade,
          plano: m.plano,
          valor: planoInfo?.valor || 0,
        };
      });

      const { error: modalidadesError } = await supabase
        .from("aluno_modalidades")
        .insert(modalidadesInsert);

      if (modalidadesError) {
        console.error("Erro ao cadastrar modalidades:", modalidadesError);
        // Não bloqueia pois o aluno já foi cadastrado
      }

      toast.success("Cadastro enviado com sucesso!", {
        description: "Aguarde a confirmação da sua matrícula pelo administrador."
      });

      navigate("/");
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
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
            Voltar
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
                    <Label htmlFor="celular">Celular *</Label>
                    <Input
                      id="celular"
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
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
                  Modalidades e Planos *
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione as modalidades e escolha o plano desejado para cada uma
                </p>
                
                <div className="grid gap-3">
                  {modalidadesDisponiveis.map((modalidade) => {
                    const planos = getPlanosModalidade(modalidade.nome);
                    const isSelected = isModalidadeSelecionada(modalidade.nome);
                    const planoSelecionado = getPlanoSelecionado(modalidade.nome);
                    
                    return (
                      <div
                        key={modalidade.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          isSelected 
                            ? "border-primary/50 bg-primary/5" 
                            : "border-border/50 bg-card/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <Checkbox
                            id={modalidade.id}
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleModalidadeToggle(modalidade.nome, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={modalidade.id} 
                            className="cursor-pointer font-medium"
                          >
                            {modalidade.nome}
                          </Label>
                        </div>
                        
                        {isSelected && planos.length > 0 && (
                          <div className="ml-6 space-y-2">
                            <Label className="text-sm text-muted-foreground">Escolha o plano:</Label>
                            <Select
                              value={planoSelecionado}
                              onValueChange={(value) => handlePlanoChange(modalidade.nome, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione um plano" />
                              </SelectTrigger>
                              <SelectContent>
                                {planos.map((p) => (
                                  <SelectItem key={p.nome} value={p.nome}>
                                    {p.nome} - {formatarPreco(p.valor)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Cadastro"
                  )}
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
