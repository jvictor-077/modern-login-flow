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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Phone, Heart, Calendar, FileText, Loader2 } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import { precosModalidades, getPlanosModalidade, formatarPreco, matricula } from "@/data/precosData";
import { TIPOS_SANGUINEOS } from "@/types/aluno";
import { supabase } from "@/integrations/supabase/client";

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

  const [modalidadesSelecionadas, setModalidadesSelecionadas] = useState<ModalidadeSelecionada[]>([]);

  const handleModalidadeToggle = (modalidadeNome: string, checked: boolean) => {
    if (checked) {
      setModalidadesSelecionadas(prev => [...prev, { modalidade: modalidadeNome, plano: "" }]);
    } else {
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
    
    if (!formData.nome.trim() || !formData.email.trim() || !formData.celular.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (modalidadesSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma modalidade");
      return;
    }

    const modalidadesSemPlano = modalidadesSelecionadas.filter(m => !m.plano);
    if (modalidadesSemPlano.length > 0) {
      toast.error(`Selecione um plano para: ${modalidadesSemPlano.map(m => m.modalidade).join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    try {
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
          situacao: "pendente",
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
      <div className="fixed inset-0" style={{ background: "var(--gradient-background)" }} />
      <FloatingShapes />

      <div className="relative z-10 container max-w-3xl mx-auto py-6 px-4">
        {/* Header compacto */}
        <div className="mb-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-lg">🏐</span>
            </div>
            <span className="text-lg font-display font-bold">Sunset</span>
          </div>
        </div>

        <Card className="glass border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-primary" />
              Formulário de Matrícula
            </CardTitle>
            <CardDescription className="text-sm">
              Preencha seus dados. Após o envio, aguarde a confirmação do administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dados principais em grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nome" className="text-sm">Nome completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Seu nome"
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="celular" className="text-sm">Celular *</Label>
                  <Input
                    id="celular"
                    value={formData.celular}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                    className="h-9"
                  />
                </div>
              </div>

              {/* Accordion para dados adicionais */}
              <Accordion type="multiple" defaultValue={["modalidades"]} className="space-y-2">
                {/* Dados Pessoais */}
                <AccordionItem value="pessoais" className="border rounded-lg px-4">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4 text-primary" />
                      Dados Pessoais (opcional)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="cpf" className="text-sm">CPF</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="dataNascimento" className="text-sm">Nascimento</Label>
                        <Input
                          id="dataNascimento"
                          type="date"
                          value={formData.dataNascimento}
                          onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="tipoSanguineo" className="text-sm">Tipo Sanguíneo</Label>
                        <Select
                          value={formData.tipoSanguineo}
                          onValueChange={(value) => setFormData({ ...formData, tipoSanguineo: value })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_SANGUINEOS.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contatoEmergencia" className="text-sm">Contato Emergência</Label>
                        <Input
                          id="contatoEmergencia"
                          value={formData.contatoEmergencia}
                          onChange={(e) => setFormData({ ...formData, contatoEmergencia: e.target.value })}
                          placeholder="Nome e telefone"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                        <Label htmlFor="endereco" className="text-sm">Endereço</Label>
                        <Input
                          id="endereco"
                          value={formData.endereco}
                          onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                          placeholder="Rua, número, bairro, cidade"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Saúde */}
                <AccordionItem value="saude" className="border rounded-lg px-4">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Heart className="h-4 w-4 text-primary" />
                      Informações de Saúde (opcional)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="doencas" className="text-sm">Doenças / Condições</Label>
                        <Input
                          id="doencas"
                          value={formData.doencas}
                          onChange={(e) => setFormData({ ...formData, doencas: e.target.value })}
                          placeholder="Ex: Diabetes, Hipertensão..."
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="alergias" className="text-sm">Alergias</Label>
                        <Input
                          id="alergias"
                          value={formData.alergias}
                          onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                          placeholder="Ex: Amendoim, Látex..."
                          className="h-9"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Modalidades - aberto por padrão */}
                <AccordionItem value="modalidades" className="border rounded-lg px-4 border-primary/30">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-primary" />
                      Modalidades e Planos *
                      {modalidadesSelecionadas.length > 0 && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          {modalidadesSelecionadas.length} selecionada(s)
                        </span>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {modalidadesDisponiveis.map((modalidade) => {
                        const planos = getPlanosModalidade(modalidade.nome);
                        const isSelected = isModalidadeSelecionada(modalidade.nome);
                        const planoSelecionado = getPlanoSelecionado(modalidade.nome);
                        
                        return (
                          <div
                            key={modalidade.id}
                            className={`p-3 rounded-lg border transition-colors ${
                              isSelected ? "border-primary/50 bg-primary/5" : "border-border/50 bg-card/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Checkbox
                                id={modalidade.id}
                                checked={isSelected}
                                onCheckedChange={(checked) => 
                                  handleModalidadeToggle(modalidade.nome, checked as boolean)
                                }
                              />
                              <Label htmlFor={modalidade.id} className="cursor-pointer text-sm font-medium">
                                {modalidade.nome}
                              </Label>
                            </div>
                            
                            {isSelected && planos.length > 0 && (
                              <Select
                                value={planoSelecionado}
                                onValueChange={(value) => handlePlanoChange(modalidade.nome, value)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Selecione um plano" />
                                </SelectTrigger>
                                <SelectContent>
                                  {planos.map((p) => (
                                    <SelectItem key={p.nome} value={p.nome} className="text-xs">
                                      {p.nome} - {formatarPreco(p.valor)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-3 p-2 rounded-lg bg-primary/10 border border-primary/30 text-sm">
                      <span className="font-medium">Taxa de Matrícula: {formatarPreco(matricula.valor)}</span>
                      <span className="text-muted-foreground ml-2 text-xs">({matricula.descricao})</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Observações */}
                <AccordionItem value="obs" className="border rounded-lg px-4">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4 text-primary" />
                      Observações e Autorizações (opcional)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="observacoes" className="text-sm">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        placeholder="Informações adicionais..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-border/50 bg-card/50">
                      <Checkbox
                        id="autorizacaoImagem"
                        checked={formData.autorizacaoImagem}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, autorizacaoImagem: checked as boolean })
                        }
                      />
                      <div>
                        <Label htmlFor="autorizacaoImagem" className="cursor-pointer text-sm">
                          Autorização de uso de imagem
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Autorizo o uso da minha imagem para divulgação.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
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

              <p className="text-xs text-center text-muted-foreground">* Campos obrigatórios</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CadastroAluno;
