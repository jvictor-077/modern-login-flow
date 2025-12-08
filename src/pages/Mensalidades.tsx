import { useState } from "react";
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
import { Plus, Search, UserPlus, Phone, User, CreditCard, MapPin, Heart, Calendar, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { TIPOS_SANGUINEOS } from "@/types/aluno";
import { precosModalidades, getPlanosModalidade, formatarPreco, matricula } from "@/data/precosData";

interface Modalidade {
  nome: string;
  plano: string;
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

const initialAlunos: Aluno[] = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao@email.com",
    cpf: "12345678900",
    dataNascimento: "1990-05-15",
    celular: "(11) 99999-1111",
    endereco: "Rua das Flores, 123, Centro, São Paulo - SP, 01234-567",
    contatoEmergencia: "Maria Silva - (11) 98888-1111",
    tipoSanguineo: "O+",
    doencas: "",
    alergias: "",
    modalidades: [{ nome: "Beach Tennis", plano: "Mensal" }],
    observacoes: "",
    autorizaImagem: true,
    situacao: "em_dia",
  },
  {
    id: "2",
    nome: "Maria Santos",
    email: "maria@email.com",
    cpf: "98765432100",
    dataNascimento: "1985-03-20",
    celular: "(11) 99999-2222",
    endereco: "Av. Brasil, 456, Jardins, São Paulo - SP, 04567-890",
    contatoEmergencia: "Pedro Santos - (11) 98888-2222",
    tipoSanguineo: "A+",
    doencas: "",
    alergias: "",
    modalidades: [
      { nome: "Vôlei Adulto Noite", plano: "1x por semana" },
      { nome: "Beach Tennis", plano: "Trimestral" },
    ],
    observacoes: "",
    autorizaImagem: true,
    situacao: "pendente",
  },
];

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
  const [alunos, setAlunos] = useState<Aluno[]>(initialAlunos);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoAluno, setNovoAluno] = useState(emptyNovoAluno);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const handleAddAluno = () => {
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

    const modalidadesArray: Modalidade[] = Object.entries(novoAluno.modalidades).map(
      ([nome, plano]) => ({ nome, plano })
    );

    const newAluno: Aluno = {
      id: Date.now().toString(),
      nome: novoAluno.nome,
      email: novoAluno.email,
      cpf: novoAluno.cpf,
      dataNascimento: novoAluno.dataNascimento,
      celular: novoAluno.celular,
      endereco: novoAluno.endereco,
      contatoEmergencia: novoAluno.contatoEmergencia,
      tipoSanguineo: novoAluno.tipoSanguineo,
      doencas: novoAluno.doencas,
      alergias: novoAluno.alergias,
      modalidades: modalidadesArray,
      observacoes: novoAluno.observacoes,
      autorizaImagem: novoAluno.autorizaImagem,
      situacao: "pendente",
    };

    setAlunos([...alunos, newAluno]);
    setNovoAluno(emptyNovoAluno);
    setIsDialogOpen(false);
    toast.success("Aluno cadastrado com sucesso!");
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

  const updateSituacao = (id: string, situacao: Aluno["situacao"]) => {
    setAlunos(alunos.map((a) => (a.id === id ? { ...a, situacao } : a)));
    toast.success("Situação atualizada!");
  };

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
                              <label
                                className={`flex items-center gap-2 p-2 px-3 rounded-lg border cursor-pointer transition-colors ${
                                  novoAluno.modalidades[modalidade] === "Aula Avulsa"
                                    ? "border-primary bg-primary/10"
                                    : "border-border/50 hover:border-border"
                                }`}
                              >
                                <Checkbox
                                  checked={novoAluno.modalidades[modalidade] === "Aula Avulsa"}
                                  onCheckedChange={(checked) =>
                                    handleModalidadeChange(modalidade, checked ? "Aula Avulsa" : "")
                                  }
                                />
                                <span className="text-sm">Aula Avulsa</span>
                              </label>
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
                                <SelectItem value="none">Nenhum</SelectItem>
                                {planos.map((plano) => (
                                  <SelectItem key={plano.nome} value={plano.nome}>
                                    {plano.nome} - {formatarPreco(plano.valor)}
                                  </SelectItem>
                                ))}
                                <SelectItem value="Aula Avulsa">Aula Avulsa</SelectItem>
                              </SelectContent>
                            </Select>
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

                  {/* Observações */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="observacoes">
                        Há alguma observação que deseje fazer?
                      </Label>
                      <Textarea
                        id="observacoes"
                        value={novoAluno.observacoes}
                        onChange={(e) =>
                          setNovoAluno({ ...novoAluno, observacoes: e.target.value })
                        }
                        placeholder="Observações adicionais..."
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Autorização de Imagem */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Autorização de Imagem *
                    </h3>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="autorizaImagem"
                        checked={novoAluno.autorizaImagem}
                        onCheckedChange={(checked) =>
                          setNovoAluno({ ...novoAluno, autorizaImagem: !!checked })
                        }
                      />
                      <label htmlFor="autorizaImagem" className="text-sm leading-relaxed">
                        Autorizo a utilizar minha imagem para a finalidade de postar fotos e
                        vídeos no Instagram como divulgação.
                      </label>
                    </div>
                  </div>

                  <Button onClick={handleAddAluno} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Cadastrar Aluno
                  </Button>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabela de alunos */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-muted-foreground">Nome</TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">Celular</TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">Modalidades</TableHead>
                <TableHead className="text-muted-foreground">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlunos.map((aluno) => (
                <TableRow 
                  key={aluno.id} 
                  className="border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleAlunoClick(aluno)}
                >
                  <TableCell className="font-medium">{aluno.nome}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{aluno.celular}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {aluno.modalidades.map((mod) => (
                        <Badge key={mod.nome} variant="outline" className="text-xs">
                          {mod.nome}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getSituacaoBadge(aluno.situacao)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Modal de Detalhes do Aluno */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {selectedAluno?.nome}
              </DialogTitle>
            </DialogHeader>
            {selectedAluno && (
              <Tabs defaultValue="mensalidades" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="mensalidades" className="text-xs sm:text-sm">
                    <CreditCard className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Mensalidades</span>
                    <span className="sm:hidden">Mensalid.</span>
                  </TabsTrigger>
                  <TabsTrigger value="contato" className="text-xs sm:text-sm">
                    <Phone className="h-4 w-4 mr-1 sm:mr-2" />
                    Contato
                  </TabsTrigger>
                  <TabsTrigger value="pessoal" className="text-xs sm:text-sm">
                    <User className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Info. Pessoais</span>
                    <span className="sm:hidden">Pessoal</span>
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="max-h-[60vh] mt-4">
                  {/* Aba Mensalidades */}
                  <TabsContent value="mensalidades" className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div>
                        <p className="text-sm text-muted-foreground">Situação Atual</p>
                        <div className="mt-1">{getSituacaoBadge(selectedAluno.situacao)}</div>
                      </div>
                      <Select
                        value={selectedAluno.situacao}
                        onValueChange={(value: Aluno["situacao"]) => {
                          updateSituacao(selectedAluno.id, value);
                          setSelectedAluno({ ...selectedAluno, situacao: value });
                        }}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="em_dia">Em dia</SelectItem>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="atrasado">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Modalidades Matriculadas
                      </h4>
                      {selectedAluno.modalidades.length > 0 ? (
                        <div className="space-y-2">
                          {selectedAluno.modalidades.map((mod) => (
                            <div
                              key={mod.nome}
                              className="flex justify-between items-center p-3 rounded-lg bg-muted/20 border border-border/30"
                            >
                              <span className="font-medium">{mod.nome}</span>
                              <Badge variant="outline">{mod.plano}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">Nenhuma modalidade cadastrada</p>
                      )}
                    </div>

                    {selectedAluno.situacao === "pendente" && (
                      <Button
                        onClick={() => {
                          updateSituacao(selectedAluno.id, "em_dia");
                          setSelectedAluno({ ...selectedAluno, situacao: "em_dia" });
                          toast.success("Matrícula confirmada com sucesso!");
                        }}
                        className="w-full gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Confirmar Matrícula
                      </Button>
                    )}
                  </TabsContent>

                  {/* Aba Contato */}
                  <TabsContent value="contato" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                        <Phone className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Celular (WhatsApp)</p>
                          <p className="font-medium">{selectedAluno.celular}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                        <User className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">E-mail</p>
                          <p className="font-medium">{selectedAluno.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Endereço</p>
                          <p className="font-medium">{selectedAluno.endereco || "Não informado"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                        <Phone className="h-5 w-5 text-red-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Contato de Emergência</p>
                          <p className="font-medium">{selectedAluno.contatoEmergencia}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Aba Informações Pessoais */}
                  <TabsContent value="pessoal" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                        <User className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">CPF</p>
                          <p className="font-medium">{selectedAluno.cpf}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                          <p className="font-medium">
                            {new Date(selectedAluno.dataNascimento).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                        <Heart className="h-5 w-5 text-red-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tipo Sanguíneo</p>
                          <p className="font-medium">{selectedAluno.tipoSanguineo}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                        <User className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Autoriza Imagem</p>
                          <p className="font-medium">{selectedAluno.autorizaImagem ? "Sim" : "Não"}</p>
                        </div>
                      </div>
                    </div>

                    {(selectedAluno.doencas || selectedAluno.alergias) && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                          Informações de Saúde
                        </h4>
                        {selectedAluno.doencas && (
                          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-sm text-muted-foreground">Doenças/Lesões</p>
                            <p className="font-medium">{selectedAluno.doencas}</p>
                          </div>
                        )}
                        {selectedAluno.alergias && (
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-muted-foreground">Alergias</p>
                            <p className="font-medium">{selectedAluno.alergias}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedAluno.observacoes && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                          Observações
                        </h4>
                        <p className="p-3 rounded-lg bg-muted/20 border border-border/30">
                          {selectedAluno.observacoes}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-muted-foreground">Em dia</p>
            <p className="text-2xl font-bold text-green-400">
              {alunos.filter((a) => a.situacao === "em_dia").length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-400">
              {alunos.filter((a) => a.situacao === "pendente").length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-muted-foreground">Atrasados</p>
            <p className="text-2xl font-bold text-red-400">
              {alunos.filter((a) => a.situacao === "atrasado").length}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
