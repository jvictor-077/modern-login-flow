import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Dados mockados do aluno
const alunoData = {
  nome: "João Silva",
  situacao: "em_dia" as const,
  modalidades: [
    { id: "beach_tennis", nome: "Beach Tennis" },
    { id: "volei", nome: "Vôlei" },
  ]
};

// Cronograma de aulas mockado
const cronograma = [
  {
    id: 1,
    modalidade: "Beach Tennis",
    diaSemana: "Segunda-feira",
    horario: "07:00 - 08:00",
    local: "Quadra 1",
    professor: "Carlos",
    periodo: "manhã"
  },
  {
    id: 2,
    modalidade: "Beach Tennis",
    diaSemana: "Quarta-feira",
    horario: "07:00 - 08:00",
    local: "Quadra 1",
    professor: "Carlos",
    periodo: "manhã"
  },
  {
    id: 3,
    modalidade: "Beach Tennis",
    diaSemana: "Sexta-feira",
    horario: "07:00 - 08:00",
    local: "Quadra 1",
    professor: "Carlos",
    periodo: "manhã"
  },
  {
    id: 4,
    modalidade: "Vôlei",
    diaSemana: "Terça-feira",
    horario: "18:00 - 19:00",
    local: "Quadra 2",
    professor: "Marina",
    periodo: "noite"
  },
  {
    id: 5,
    modalidade: "Vôlei",
    diaSemana: "Quinta-feira",
    horario: "18:00 - 19:00",
    local: "Quadra 2",
    professor: "Marina",
    periodo: "noite"
  },
];

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const AlunoHomeContent = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  const hoje = new Date();
  const diaSemanaHoje = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const aulasHoje = cronograma.filter(aula => 
    aula.diaSemana.toLowerCase() === diaSemanaHoje.toLowerCase()
  );

  const aulasFiltradas = selectedDay 
    ? cronograma.filter(aula => aula.diaSemana.toLowerCase().includes(selectedDay.toLowerCase()))
    : cronograma;

  const getModalidadeColor = (modalidade: string) => {
    const colors: Record<string, string> = {
      "Beach Tennis": "bg-amber-500/20 text-amber-500 border-amber-500/30",
      "Vôlei": "bg-blue-500/20 text-blue-500 border-blue-500/30",
      "Futevôlei": "bg-green-500/20 text-green-500 border-green-500/30",
      "Basquete": "bg-orange-500/20 text-orange-500 border-orange-500/30",
      "Tênis": "bg-purple-500/20 text-purple-500 border-purple-500/30",
    };
    return colors[modalidade] || "bg-primary/20 text-primary border-primary/30";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Olá, {alunoData.nome.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground capitalize">{dataFormatada}</p>
        </div>
        
        <Badge 
          variant="outline" 
          className={alunoData.situacao === "em_dia" 
            ? "bg-accent/10 text-accent border-accent/30" 
            : "bg-destructive/10 text-destructive border-destructive/30"
          }
        >
          {alunoData.situacao === "em_dia" ? "Matrícula em dia" : "Pendente"}
        </Badge>
      </div>

      {/* Aulas de Hoje */}
      {aulasHoje.length > 0 && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Aulas de Hoje
            </h2>
            {aulasHoje.map((aula) => (
              <div 
                key={aula.id}
                className="flex items-center justify-between p-4 rounded-xl bg-background/80 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${aula.periodo === 'manhã' ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}>
                    {aula.periodo === 'manhã' 
                      ? <Sun className="h-5 w-5 text-amber-500" />
                      : <Moon className="h-5 w-5 text-indigo-500" />
                    }
                  </div>
                  <div>
                    <p className="font-medium">{aula.modalidade}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {aula.horario}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {aula.local}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Minhas Modalidades */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Minhas Modalidades</h2>
        <div className="flex flex-wrap gap-2">
          {alunoData.modalidades.map((mod) => (
            <Badge 
              key={mod.id}
              variant="outline"
              className={`${getModalidadeColor(mod.nome)} px-4 py-2 text-sm`}
            >
              {mod.nome}
            </Badge>
          ))}
        </div>
      </div>

      {/* Filtro por dia */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Cronograma Semanal</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedDay === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDay(null)}
            className="shrink-0"
          >
            Todos
          </Button>
          {diasSemana.map((dia) => (
            <Button
              key={dia}
              variant={selectedDay === dia ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDay(selectedDay === dia ? null : dia)}
              className="shrink-0"
            >
              {dia}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de Aulas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {aulasFiltradas.map((aula) => (
          <Card 
            key={aula.id} 
            className="overflow-hidden hover:border-primary/50 transition-colors"
          >
            <div className={`h-1 ${getModalidadeColor(aula.modalidade).split(' ')[0]}`} />
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <Badge 
                  variant="outline" 
                  className={getModalidadeColor(aula.modalidade)}
                >
                  {aula.modalidade}
                </Badge>
                <div className={`p-2 rounded-lg ${aula.periodo === 'manhã' ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}>
                  {aula.periodo === 'manhã' 
                    ? <Sun className="h-4 w-4 text-amber-500" />
                    : <Moon className="h-4 w-4 text-indigo-500" />
                  }
                </div>
              </div>

              <div>
                <p className="font-semibold">{aula.diaSemana}</p>
                <p className="text-2xl font-bold text-primary">{aula.horario.split(' - ')[0]}</p>
                <p className="text-sm text-muted-foreground">até {aula.horario.split(' - ')[1]}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {aula.local}
                </span>
                <span>Prof. {aula.professor}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {aulasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhuma aula encontrada para este dia</p>
        </div>
      )}
    </div>
  );
};

export default AlunoHomeContent;
