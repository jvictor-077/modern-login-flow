import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, UserPlus, Phone, User, CreditCard, MapPin, Heart, Calendar, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { TIPOS_SANGUINEOS } from "@/types/aluno";
import { precosModalidades, getPlanosModalidade, formatarPreco, matricula } from "@/data/precosData";
import { supabase } from "@/integrations/supabase/client";

interface Modalidade {
  nome: string;
  plano: string;
  valor?: number;
}

interface Aluno {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  celular: string;
  endereco: string;
  contatoEmergencia: string;
  tipoSanguineo: string;
  doencas: string;
  alergias: string;
  modalidades: Modalidade[];
  observacoes: string;
  autorizaImagem: boolean;
  situacao: "em_dia" | "pendente" | "atrasado";
}

// Lista de modalidades disponíveis (extraída de precosData)
const modalidadesDisponiveis = precosModalidades.map((m) => m.modalidade);

const tiposSanguineos = [...TIPOS_SANGUINEOS];

const emptyNovoAluno = {
  nome: "",
  email: "",
  cpf: "",
  dataNascimento: "",
  celular: "",
  endereco: "",
  contatoEmergencia: "",
  tipoSanguineo: "",
  doencas: "",
  alergias: "",
  modalidades: {} as Record<string, string>,
  observacoes: "",
  autorizaImagem: true,
};

export default function Mensalidades() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoAluno, setNovoAluno] = useState(emptyNovoAluno);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch alunos from Supabase
  const fetchAlunos = async () => {
    setLoading(true);
    try {
      // Fetch alunos
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select('*')
        .order('created_at', { ascending: false });

      if (alunosError) {
        console.error('Error fetching alunos:', alunosError);
        toast.error('Erro ao carregar alunos');
        return;
      }

      // Fetch modalidades for each aluno
      const { data: modalidadesData, error: modalidadesError } = await supabase
        .from('aluno_modalidades')
        .select('*');

      if (modalidadesError) {
        console.error('Error fetching modalidades:', modalidadesError);
      }

      // Map the data to our Aluno interface
      const mappedAlunos: Aluno[] = (alunosData || []).map(aluno => {
        const alunoModalidades = (modalidadesData || [])
          .filter(m => m.aluno_id === aluno.id)
          .map(m => ({
            nome: m.modalidade,
            plano: m.plano,
            valor: m.valor,
          }));

        return {
          id: aluno.id,
          nome: aluno.nome,
          email: aluno.email,
          cpf: aluno.cpf || '',
          dataNascimento: aluno.data_nascimento || '',
          celular: aluno.celular || '',
          endereco: aluno.endereco || '',
          contatoEmergencia: aluno.contato_emergencia || '',
          tipoSanguineo: aluno.tipo_sanguineo || '',
          doencas: aluno.doencas || '',
          alergias: aluno.alergias || '',
          modalidades: alunoModalidades,
          observacoes: aluno.observacoes || '',
          autorizaImagem: aluno.autoriza_imagem || false,
          situacao: aluno.situacao as "em_dia" | "pendente" | "atrasado",
        };
      });

      setAlunos(mappedAlunos);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  const handleAlunoClick = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setIsDetailModalOpen(true);
  };

  const filteredAlunos = alunos.filter((aluno) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModalidadeChange = (modalidade: string, plano: string) => {
    setNovoAluno((prev) => {
      const newModalidades = { ...prev.modalidades };
      if (plano) {
        newModalidades[modalidade] = plano;
      } else {
        delete newModalidades[modalidade];
      }
      return { ...prev, modalidades: newModalidades };
    });
  };

  const handleAddAluno = async () => {
    if (
      !novoAluno.nome ||
      !novoAluno.email ||
      !novoAluno.cpf ||
      !novoAluno.dataNascimento ||
      !novoAluno.celular ||
      !novoAluno.contatoEmergencia ||
      !novoAluno.tipoSanguineo
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (Object.keys(novoAluno.modalidades).length === 0) {
      toast.error("Selecione pelo menos uma modalidade");
      return;
    }

    try {
      const modalidadesData = Object.entries(novoAluno.modalidades).map(
        ([modalidade, plano]) => {
          const planoInfo = getPlanosModalidade(modalidade).find(p => p.nome === plano);
          return {
            modalidade,
            plano,
            valor: planoInfo?.valor || 0,
          };
        }
      );

      const { data, error } = await supabase.rpc('register_aluno', {
        p_nome: novoAluno.nome,
        p_email: novoAluno.email.toLowerCase().trim(),
        p_cpf: novoAluno.cpf.replace(/\D/g, ''),
        p_celular: novoAluno.celular,
        p_data_nascimento: novoAluno.dataNascimento,
        p_endereco: novoAluno.endereco,
        p_contato_emergencia: novoAluno.contatoEmergencia,
        p_tipo_sanguineo: novoAluno.tipoSanguineo,
        p_doencas: novoAluno.doencas,
        p_alergias: novoAluno.alergias,
        p_observacoes: novoAluno.observacoes,
        p_autoriza_imagem: novoAluno.autorizaImagem,
        p_modalidades: modalidadesData,
      });

      if (error) {
        console.error('Error adding aluno:', error);
        toast.error(error.message || "Erro ao cadastrar aluno");
        return;
      }

      setNovoAluno(emptyNovoAluno);
      setIsDialogOpen(false);
      toast.success("Aluno cadastrado com sucesso!");
      fetchAlunos(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao cadastrar aluno");
    }
  };

  const getSituacaoBadge = (situacao: Aluno["situacao"]) => {
    switch (situacao) {
      case "em_dia":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Em dia</Badge>;
      case "pendente":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
      case "atrasado":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Atrasado</Badge>;
    }
  };

  const updateSituacao = async (id: string, situacao: Aluno["situacao"]) => {
    try {
      const { error } = await supabase
        .from('alunos')
        .update({ situacao })
        .eq('id', id);

      if (error) {
        console.error('Error updating situacao:', error);
        toast.error("Erro ao atualizar situação");
        return;
      }

      setAlunos(alunos.map((a) => (a.id === id ? { ...a, situacao } : a)));
      toast.success("Situação atualizada!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao atualizar situação");
    }
  };

  const confirmarMatricula = async (id: string) => {
    await updateSituacao(id, "em_dia");
  };

  if (loading) {
    return (
      <AdminLayout title="Mensalidades">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Mensalidades">
      <div className="space-y-6">
        {/* Header com busca e botão adicionar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border/50"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAlunos} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Novo Aluno
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <div className="space-y-6 pt-4">
                    {/* Dados Pessoais */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Dados Pessoais
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome Completo *</Label>
                          <Input
                            id="nome"
                            value={novoAluno.nome}
                            onChange={(e) =>
                              setNovoAluno({ ...novoAluno, nome: e.target.value })
                            }
                            placeholder="Nome completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={novoAluno.email}
                            onChange={(e) =>
                              setNovoAluno({ ...novoAluno, email: e.target.value })
                            }
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF (apenas números) *</Label>
                          <Input
                            id="cpf"
                            value={novoAluno.cpf}
                            onChange={(e) =>
                              setNovoAluno({ ...novoAluno, cpf: e.target.value.replace(/\D/g, '') })
                            }
                            placeholder="00000000000"
                            maxLength={11}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                          <Input
                            id="dataNascimento"
                            type="date"
                            value={novoAluno.dataNascimento}
                            onChange={(e) =>
                              setNovoAluno({ ...novoAluno, dataNascimento: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="celular">Celular (WhatsApp) *</Label>
                          <Input
                            id="celular"
                            value={novoAluno.celular}
                            onChange={(e) =>
                              setNovoAluno({ ...novoAluno, celular: e.target.value })
                            }
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tipoSanguineo">Tipo Sanguíneo *</Label>
                          <Select
                            value={novoAluno.tipoSanguineo}
                            onValueChange={(value) =>
                              setNovoAluno({ ...novoAluno, tipoSanguineo: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              {tiposSanguineos.map((tipo) => (
                                <SelectItem key={tipo} value={tipo}>
                                  {tipo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endereco">
                          Endereço Residencial (rua, número, complemento, bairro, cidade e CEP)
                        </Label>
                        <Textarea
                          id="endereco"
                          value={novoAluno.endereco}
                          onChange={(e) =>
                            setNovoAluno({ ...novoAluno, endereco: e.target.value })
                          }
                          placeholder="Rua, número, complemento, bairro, cidade - UF, CEP"
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Contato de Emergência */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Contato de Emergência
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="contatoEmergencia">
                          Pessoa de contato para emergência (Nome + celular com DDD) *
                        </Label>
                        <Input
                          id="contatoEmergencia"
                          value={novoAluno.contatoEmergencia}
                          onChange={(e) =>
                            setNovoAluno({ ...novoAluno, contatoEmergencia: e.target.value })
                          }
                          placeholder="Nome - (00) 00000-0000"
                        />
                      </div>
                    </div>

                    {/* Informações de Saúde */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Informações de Saúde
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="doencas">
                          Informar, se houver, doenças ou lesões pré-existentes
                        </Label>
                        <Textarea
                          id="doencas"
                          value={novoAluno.doencas}
                          onChange={(e) =>
                            setNovoAluno({ ...novoAluno, doencas: e.target.value })
                          }
                          placeholder="Descreva se houver..."
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alergias">Alergias? (preencher se tiver)</Label>
                        <Input
                          id="alergias"
                          value={novoAluno.alergias}
                          onChange={(e) =>
                            setNovoAluno({ ...novoAluno, alergias: e.target.value })
                          }
                          placeholder="Descreva se houver..."
                        />
                      </div>
                    </div>

                    {/* Modalidades */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Qual modalidade deseja treinar? *
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Obs: você pode selecionar mais de 1 modalidade.
                      </p>
                    {/* Desktop: Card layout por modalidade */}
                      <div className="hidden sm:block space-y-4">
                        {modalidadesDisponiveis.map((modalidade) => {
                          const planos = getPlanosModalidade(modalidade);
                          return (
                            <div key={modalidade} className="border border-border/50 rounded-lg p-4">
                              <p className="font-medium mb-3">{modalidade}</p>
                              <div className="flex flex-wrap gap-3">
                                {planos.map((plano) => (
                                  <label
                                    key={plano.nome}
                                    className={`flex items-center gap-2 p-2 px-3 rounded-lg border cursor-pointer transition-colors ${
                                      novoAluno.modalidades[modalidade] === plano.nome
                                        ? "border-primary bg-primary/10"
                                        : "border-border/50 hover:border-border"
                                    }`}
                                  >
                                    <Checkbox
                                      checked={novoAluno.modalidades[modalidade] === plano.nome}
                                      onCheckedChange={(checked) =>
                                        handleModalidadeChange(modalidade, checked ? plano.nome : "")
                                      }
                                    />
                                    <span className="text-sm">
                                      {plano.nome} - {formatarPreco(plano.valor)}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Mobile: Card layout */}
                      <div className="sm:hidden space-y-4">
                        {modalidadesDisponiveis.map((modalidade) => {
                          const planos = getPlanosModalidade(modalidade);
                          return (
                            <div key={modalidade} className="border border-border/50 rounded-lg p-3 space-y-2">
                              <p className="font-medium text-sm">{modalidade}</p>
                              <Select
                                value={novoAluno.modalidades[modalidade] || "none"}
                                onValueChange={(value) => handleModalidadeChange(modalidade, value === "none" ? "" : value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecione um plano" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                  <SelectItem value="none">Não selecionado</SelectItem>
                                  {planos.map((plano) => (
                                    <SelectItem key={plano.nome} value={plano.nome}>
                                      {plano.nome} - {formatarPreco(plano.valor)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Observações */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Observações
                      </h3>
                      <Textarea
                        value={novoAluno.observacoes}
                        onChange={(e) =>
                          setNovoAluno({ ...novoAluno, observacoes: e.target.value })
                        }
                        placeholder="Alguma observação adicional?"
                        rows={3}
                      />
                    </div>

                    {/* Autorização de Imagem */}
                    <div className="flex items-start gap-3 p-4 border border-border/50 rounded-lg">
                      <Checkbox
                        id="autorizaImagem"
                        checked={novoAluno.autorizaImagem}
                        onCheckedChange={(checked) =>
                          setNovoAluno({ ...novoAluno, autorizaImagem: checked as boolean })
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="autorizaImagem" className="cursor-pointer">
                          Autorização de uso de imagem
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Autorizo o uso de minha imagem para divulgação nas redes sociais da
                          arena.
                        </p>
                      </div>
                    </div>

                    <Button onClick={handleAddAluno} className="w-full gap-2">
                      <UserPlus className="h-4 w-4" />
                      Cadastrar Aluno
                    </Button>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs para filtrar por situação */}
        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="todos">Todos ({alunos.length})</TabsTrigger>
            <TabsTrigger value="pendente">
              Pendentes ({alunos.filter((a) => a.situacao === "pendente").length})
            </TabsTrigger>
            <TabsTrigger value="em_dia">
              Em dia ({alunos.filter((a) => a.situacao === "em_dia").length})
            </TabsTrigger>
            <TabsTrigger value="atrasado">
              Atrasados ({alunos.filter((a) => a.situacao === "atrasado").length})
            </TabsTrigger>
          </TabsList>

          {["todos", "pendente", "em_dia", "atrasado"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-card/50">
                      <TableHead>Aluno</TableHead>
                      <TableHead className="hidden md:table-cell">Modalidades</TableHead>
                      <TableHead className="hidden sm:table-cell">Contato</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlunos
                      .filter((a) => tab === "todos" || a.situacao === tab)
                      .map((aluno) => (
                        <TableRow 
                          key={aluno.id} 
                          className="cursor-pointer hover:bg-card/30"
                          onClick={() => handleAlunoClick(aluno)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{aluno.nome}</p>
                              <p className="text-sm text-muted-foreground">{aluno.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {aluno.modalidades.map((m, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {m.nome}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {aluno.celular}
                          </TableCell>
                          <TableCell>{getSituacaoBadge(aluno.situacao)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              {aluno.situacao === "pendente" && (
                                <Button
                                  size="sm"
                                  onClick={() => confirmarMatricula(aluno.id)}
                                  className="gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Confirmar
                                </Button>
                              )}
                              <Select
                                value={aluno.situacao}
                                onValueChange={(value) =>
                                  updateSituacao(aluno.id, value as Aluno["situacao"])
                                }
                              >
                                <SelectTrigger className="w-[120px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                  <SelectItem value="em_dia">Em dia</SelectItem>
                                  <SelectItem value="pendente">Pendente</SelectItem>
                                  <SelectItem value="atrasado">Atrasado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {filteredAlunos.filter((a) => tab === "todos" || a.situacao === tab)
                      .length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum aluno encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Modal de detalhes do aluno */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {selectedAluno?.nome}
              </DialogTitle>
            </DialogHeader>
            {selectedAluno && (
              <ScrollArea className="max-h-[70vh] pr-4">
                <div className="space-y-6 pt-4">
                  {/* Situação e Ações */}
                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card/30">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      {getSituacaoBadge(selectedAluno.situacao)}
                    </div>
                    {selectedAluno.situacao === "pendente" && (
                      <Button
                        onClick={() => {
                          confirmarMatricula(selectedAluno.id);
                          setSelectedAluno({ ...selectedAluno, situacao: "em_dia" });
                        }}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Confirmar Matrícula
                      </Button>
                    )}
                  </div>

                  {/* Dados Pessoais */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Dados Pessoais
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{selectedAluno.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CPF:</span>
                        <p className="font-medium">{selectedAluno.cpf || "-"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data de Nascimento:</span>
                        <p className="font-medium">{selectedAluno.dataNascimento || "-"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tipo Sanguíneo:</span>
                        <p className="font-medium">{selectedAluno.tipoSanguineo || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contato
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Celular:</span>
                        <p className="font-medium">{selectedAluno.celular || "-"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Emergência:</span>
                        <p className="font-medium">{selectedAluno.contatoEmergencia || "-"}</p>
                      </div>
                    </div>
                    {selectedAluno.endereco && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p>{selectedAluno.endereco}</p>
                      </div>
                    )}
                  </div>

                  {/* Modalidades */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Modalidades
                    </h3>
                    <div className="space-y-2">
                      {selectedAluno.modalidades.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{m.nome}</p>
                            <p className="text-sm text-muted-foreground">{m.plano}</p>
                          </div>
                          {m.valor && (
                            <span className="text-primary font-semibold">
                              {formatarPreco(m.valor)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Saúde */}
                  {(selectedAluno.doencas || selectedAluno.alergias) && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Informações de Saúde
                      </h3>
                      <div className="space-y-2 text-sm">
                        {selectedAluno.doencas && (
                          <div>
                            <span className="text-muted-foreground">Doenças/Condições:</span>
                            <p>{selectedAluno.doencas}</p>
                          </div>
                        )}
                        {selectedAluno.alergias && (
                          <div>
                            <span className="text-muted-foreground">Alergias:</span>
                            <p>{selectedAluno.alergias}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {selectedAluno.observacoes && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Observações
                      </h3>
                      <p className="text-sm">{selectedAluno.observacoes}</p>
                    </div>
                  )}

                  {/* Autorização de Imagem */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox checked={selectedAluno.autorizaImagem} disabled />
                    <span>
                      {selectedAluno.autorizaImagem
                        ? "Autorizou uso de imagem"
                        : "Não autorizou uso de imagem"}
                    </span>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
