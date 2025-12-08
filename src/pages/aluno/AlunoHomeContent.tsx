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
import { alunoLogado, cronogramaAulas } from "@/data/alunosData";
import { DIAS_SEMANA } from "@/types/aluno";

const diasSemana = DIAS_SEMANA.map(d => d.label);
const diasSemanaFull = DIAS_SEMANA.map(d => d.full);

const AlunoHomeContent = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  const hoje = new Date();
  const diaSemanaHoje = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  // Filtra aulas do aluno logado
  const cronogramaAluno = cronogramaAulas.filter(aula => aula.aluno_id === alunoLogado.id);

  const aulasHoje = cronogramaAluno.filter(aula => 
    aula.dia_semana.toLowerCase() === diaSemanaHoje.toLowerCase()
  );

  const aulasFiltradas = selectedDay 
    ? cronogramaAluno.filter(aula => aula.dia_semana.toLowerCase().includes(selectedDay.toLowerCase()))
    : cronogramaAluno;

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
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold">
            Olá, {alunoLogado.nome.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground capitalize">{dataFormatada}</p>
        </div>
        
        <Badge 
          variant="outline" 
          className={`w-fit ${alunoLogado.situacao === "em_dia" 
            ? "bg-accent/10 text-accent border-accent/30" 
            : "bg-destructive/10 text-destructive border-destructive/30"
          }`}
        >
          {alunoLogado.situacao === "em_dia" ? "Matrícula em dia" : "Pendente"}
        </Badge>
      </div>

      {/* Aulas de Hoje */}
      {aulasHoje.length > 0 && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Aulas de Hoje
            </h2>
            {aulasHoje.map((aula) => (
              <div 
                key={aula.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-background/80 border border-border/50"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${aula.periodo === 'manhã' ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}>
                    {aula.periodo === 'manhã' 
                      ? <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                      : <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">{aula.modalidade}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {aula.horario}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {aula.local}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Minhas Modalidades */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Minhas Modalidades</h2>
        <div className="flex flex-wrap gap-2">
          {alunoLogado.modalidades.map((mod) => (
            <Badge 
              key={mod.id}
              variant="outline"
              className={`${getModalidadeColor(mod.nome)} px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm`}
            >
              {mod.nome}
            </Badge>
          ))}
        </div>
      </div>

      {/* Filtro por dia */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Cronograma Semanal</h2>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          <Button
            variant={selectedDay === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDay(null)}
            className="shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
          >
            Todos
          </Button>
          {diasSemana.map((dia, index) => (
            <Button
              key={dia}
              variant={selectedDay === diasSemanaFull[index] ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDay(selectedDay === diasSemanaFull[index] ? null : diasSemanaFull[index])}
              className="shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
            >
              {dia}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de Aulas */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {aulasFiltradas.map((aula) => (
          <Card 
            key={aula.id} 
            className="overflow-hidden hover:border-primary/50 transition-colors"
          >
            <div className={`h-1 ${getModalidadeColor(aula.modalidade).split(' ')[0]}`} />
            <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex items-start justify-between">
                <Badge 
                  variant="outline" 
                  className={`${getModalidadeColor(aula.modalidade)} text-xs`}
                >
                  {aula.modalidade}
                </Badge>
                <div className={`p-1.5 sm:p-2 rounded-lg ${aula.periodo === 'manhã' ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}>
                  {aula.periodo === 'manhã' 
                    ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                    : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" />
                  }
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm sm:text-base">{aula.dia_semana}</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">{aula.horario.split(' - ')[0]}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">até {aula.horario.split(' - ')[1]}</p>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground pt-2 border-t border-border/50">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {aula.local}
                </span>
                <span>Prof. {aula.professor}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {aulasFiltradas.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/50 mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">Nenhuma aula encontrada para este dia</p>
        </div>
      )}
    </div>
  );
};

export default AlunoHomeContent;
