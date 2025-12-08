import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface Aluno {
  id: string;
  nome: string;
  telefone: string;
  aulas: string[];
  situacao: "em_dia" | "pendente" | "atrasado";
  valorMensalidade: number;
}

const aulasDisponiveis = [
  "Beach Tennis",
  "Tênis",
  "Vôlei",
  "Futevôlei",
  "Funcional",
];

const initialAlunos: Aluno[] = [
  {
    id: "1",
    nome: "João Silva",
    telefone: "(11) 99999-1111",
    aulas: ["Beach Tennis"],
    situacao: "em_dia",
    valorMensalidade: 150,
  },
  {
    id: "2",
    nome: "Maria Santos",
    telefone: "(11) 99999-2222",
    aulas: ["Tênis", "Funcional"],
    situacao: "pendente",
    valorMensalidade: 250,
  },
  {
    id: "3",
    nome: "Pedro Oliveira",
    telefone: "(11) 99999-3333",
    aulas: ["Vôlei"],
    situacao: "atrasado",
    valorMensalidade: 120,
  },
  {
    id: "4",
    nome: "Ana Costa",
    telefone: "(11) 99999-4444",
    aulas: ["Beach Tennis", "Tênis"],
    situacao: "em_dia",
    valorMensalidade: 280,
  },
  {
    id: "5",
    nome: "Carlos Lima",
    telefone: "(11) 99999-5555",
    aulas: ["Futevôlei"],
    situacao: "em_dia",
    valorMensalidade: 130,
  },
];

export default function Mensalidades() {
  const [alunos, setAlunos] = useState<Aluno[]>(initialAlunos);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoAluno, setNovoAluno] = useState({
    nome: "",
    telefone: "",
    aulas: [] as string[],
    valorMensalidade: "",
  });

  const filteredAlunos = alunos.filter((aluno) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAluno = () => {
    if (!novoAluno.nome || !novoAluno.telefone || novoAluno.aulas.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const newAluno: Aluno = {
      id: Date.now().toString(),
      nome: novoAluno.nome,
      telefone: novoAluno.telefone,
      aulas: novoAluno.aulas,
      situacao: "pendente",
      valorMensalidade: parseFloat(novoAluno.valorMensalidade) || 0,
    };

    setAlunos([...alunos, newAluno]);
    setNovoAluno({ nome: "", telefone: "", aulas: [], valorMensalidade: "" });
    setIsDialogOpen(false);
    toast.success("Aluno cadastrado com sucesso!");
  };

  const toggleAula = (aula: string) => {
    setNovoAluno((prev) => ({
      ...prev,
      aulas: prev.aulas.includes(aula)
        ? prev.aulas.filter((a) => a !== aula)
        : [...prev.aulas, aula],
    }));
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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={novoAluno.nome}
                    onChange={(e) =>
                      setNovoAluno({ ...novoAluno, nome: e.target.value })
                    }
                    placeholder="Nome do aluno"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={novoAluno.telefone}
                    onChange={(e) =>
                      setNovoAluno({ ...novoAluno, telefone: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Aulas Matriculadas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {aulasDisponiveis.map((aula) => (
                      <div key={aula} className="flex items-center space-x-2">
                        <Checkbox
                          id={aula}
                          checked={novoAluno.aulas.includes(aula)}
                          onCheckedChange={() => toggleAula(aula)}
                        />
                        <label
                          htmlFor={aula}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {aula}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor da Mensalidade (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    value={novoAluno.valorMensalidade}
                    onChange={(e) =>
                      setNovoAluno({ ...novoAluno, valorMensalidade: e.target.value })
                    }
                    placeholder="150.00"
                  />
                </div>

                <Button onClick={handleAddAluno} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Cadastrar Aluno
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabela de alunos */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-muted-foreground">Nome</TableHead>
                <TableHead className="text-muted-foreground">Telefone</TableHead>
                <TableHead className="text-muted-foreground">Aulas</TableHead>
                <TableHead className="text-muted-foreground">Valor</TableHead>
                <TableHead className="text-muted-foreground">Situação</TableHead>
                <TableHead className="text-muted-foreground text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlunos.map((aluno) => (
                <TableRow key={aluno.id} className="border-border/50">
                  <TableCell className="font-medium">{aluno.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{aluno.telefone}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {aluno.aulas.map((aula) => (
                        <Badge key={aula} variant="outline" className="text-xs">
                          {aula}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-primary font-medium">
                    R$ {aluno.valorMensalidade.toFixed(2)}
                  </TableCell>
                  <TableCell>{getSituacaoBadge(aluno.situacao)}</TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={aluno.situacao}
                      onValueChange={(value: Aluno["situacao"]) =>
                        updateSituacao(aluno.id, value)
                      }
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="em_dia">Em dia</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

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
