import { useState } from "react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin,
  Check,
  CalendarPlus,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

// Horários disponíveis por dia da semana (mockado)
// Chave: dia da semana (0 = domingo, 1 = segunda, etc.)
const horariosDisponiveisPorDia: Record<number, { id: number; hora: string; quadra: string; disponivel: boolean }[]> = {
  0: [ // Domingo
    { id: 1, hora: "09:00", quadra: "Quadra 1", disponivel: true },
    { id: 2, hora: "10:00", quadra: "Quadra 1", disponivel: true },
    { id: 3, hora: "11:00", quadra: "Quadra 2", disponivel: true },
    { id: 4, hora: "14:00", quadra: "Quadra 1", disponivel: false },
    { id: 5, hora: "15:00", quadra: "Quadra 2", disponivel: true },
    { id: 6, hora: "16:00", quadra: "Quadra 1", disponivel: true },
  ],
  1: [ // Segunda
    { id: 7, hora: "07:00", quadra: "Quadra 1", disponivel: true },
    { id: 8, hora: "08:00", quadra: "Quadra 1", disponivel: true },
    { id: 9, hora: "18:00", quadra: "Quadra 2", disponivel: true },
    { id: 10, hora: "19:00", quadra: "Quadra 1", disponivel: true },
  ],
  2: [ // Terça
    { id: 11, hora: "07:00", quadra: "Quadra 1", disponivel: true },
    { id: 12, hora: "08:00", quadra: "Quadra 2", disponivel: true },
    { id: 13, hora: "17:00", quadra: "Quadra 1", disponivel: true },
    { id: 14, hora: "18:00", quadra: "Quadra 2", disponivel: false },
  ],
  3: [ // Quarta
    { id: 15, hora: "09:00", quadra: "Quadra 1", disponivel: true },
    { id: 16, hora: "10:00", quadra: "Quadra 2", disponivel: true },
    { id: 17, hora: "14:00", quadra: "Quadra 1", disponivel: true },
  ],
  4: [ // Quinta
    { id: 18, hora: "07:00", quadra: "Quadra 1", disponivel: true },
    { id: 19, hora: "08:00", quadra: "Quadra 2", disponivel: true },
    { id: 20, hora: "19:00", quadra: "Quadra 1", disponivel: true },
  ],
  5: [ // Sexta
    { id: 21, hora: "07:00", quadra: "Quadra 1", disponivel: true },
    { id: 22, hora: "17:00", quadra: "Quadra 2", disponivel: true },
    { id: 23, hora: "18:00", quadra: "Quadra 1", disponivel: true },
    { id: 24, hora: "19:00", quadra: "Quadra 2", disponivel: true },
  ],
  6: [ // Sábado
    { id: 25, hora: "08:00", quadra: "Quadra 1", disponivel: true },
    { id: 26, hora: "09:00", quadra: "Quadra 2", disponivel: true },
    { id: 27, hora: "10:00", quadra: "Quadra 1", disponivel: true },
    { id: 28, hora: "11:00", quadra: "Quadra 2", disponivel: false },
    { id: 29, hora: "14:00", quadra: "Quadra 1", disponivel: true },
    { id: 30, hora: "15:00", quadra: "Quadra 2", disponivel: true },
  ],
};

// Preços
const PRECO_1H = 60;
const PRECO_2H = 120;

const ReservarHorario = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHorario, setSelectedHorario] = useState<number | null>(null);
  const [duracao, setDuracao] = useState<1 | 2>(1);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => {
    setCurrentMonth(prev => addDays(startOfMonth(prev), -1));
    setSelectedDate(null);
    setSelectedHorario(null);
  };

  const nextMonth = () => {
    setCurrentMonth(prev => addDays(endOfMonth(prev), 1));
    setSelectedDate(null);
    setSelectedHorario(null);
  };

  // Verifica se um dia tem horários disponíveis
  const temHorariosDisponiveis = (date: Date) => {
    const diaSemana = date.getDay();
    const horarios = horariosDisponiveisPorDia[diaSemana] || [];
    return horarios.some(h => h.disponivel);
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return;
    if (!temHorariosDisponiveis(date)) return;
    setSelectedDate(date);
    setSelectedHorario(null);
    setDuracao(1);
  };

  const getHorariosParaData = (date: Date) => {
    const diaSemana = date.getDay();
    return horariosDisponiveisPorDia[diaSemana] || [];
  };

  const getPreco = () => {
    return duracao === 1 ? PRECO_1H : PRECO_2H;
  };

  const getHorarioFinal = (horaInicio: string) => {
    const [hora] = horaInicio.split(":");
    const horaFinal = parseInt(hora) + duracao;
    return `${horaFinal.toString().padStart(2, "0")}:00`;
  };

  const handleReservar = () => {
    if (!selectedDate || !selectedHorario) return;
    
    const horarios = getHorariosParaData(selectedDate);
    const horario = horarios.find(h => h.id === selectedHorario);
    
    if (!horario) return;

    const horaFinal = getHorarioFinal(horario.hora);
    
    toast.success("Horário reservado com sucesso!", {
      description: `${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} - ${horario.hora} às ${horaFinal} - ${horario.quadra} - R$ ${getPreco()},00`,
    });
    
    setSelectedDate(null);
    setSelectedHorario(null);
    setDuracao(1);
  };

  const getDayStatus = (date: Date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return "past";
    if (!temHorariosDisponiveis(date)) return "unavailable";
    return "available";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Reservar Horário Avulso</h1>
        <p className="text-muted-foreground">Selecione uma data e horário disponível</p>
      </div>

      {/* Preços */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-medium">Valores:</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-base px-4 py-1.5 bg-background">
                1 hora = <span className="font-bold text-primary ml-1">R$ {PRECO_1H},00</span>
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-1.5 bg-background">
                2 horas = <span className="font-bold text-primary ml-1">R$ {PRECO_2H},00</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendário */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-lg capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
                <div 
                  key={dia} 
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {/* Espaços vazios para alinhar o primeiro dia */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {days.map((day) => {
                const status = getDayStatus(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    disabled={status === "past" || status === "unavailable"}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all
                      ${isToday(day) ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                      ${isSelected ? "bg-primary text-primary-foreground" : ""}
                      ${status === "past" ? "text-muted-foreground/30 cursor-not-allowed" : ""}
                      ${status === "unavailable" ? "text-muted-foreground/40 cursor-not-allowed" : ""}
                      ${status === "available" && !isSelected ? "hover:bg-accent/50 cursor-pointer" : ""}
                    `}
                  >
                    <span className="font-medium">{format(day, "d")}</span>
                    {status === "available" && isSameMonth(day, currentMonth) && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <span>Sem horários</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horários disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {selectedDate 
                ? `Horários - ${format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}`
                : "Selecione uma data"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-4">
                {/* Seleção de duração */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm font-medium mb-3">Duração da reserva:</p>
                  <div className="flex gap-3">
                    <Button
                      variant={duracao === 1 ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setDuracao(1)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      1 hora - R$ {PRECO_1H}
                    </Button>
                    <Button
                      variant={duracao === 2 ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setDuracao(2)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      2 horas - R$ {PRECO_2H}
                    </Button>
                  </div>
                </div>

                {/* Lista de horários */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Horários de início:</p>
                  {getHorariosParaData(selectedDate)
                    .filter(slot => slot.disponivel)
                    .map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedHorario(slot.id)}
                        className={`
                          w-full p-4 rounded-xl border transition-all text-left
                          ${selectedHorario === slot.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                          }
                          cursor-pointer
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-10 h-10 rounded-lg flex items-center justify-center
                              ${selectedHorario === slot.id ? "bg-primary text-primary-foreground" : "bg-muted"}
                            `}>
                              {selectedHorario === slot.id ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <Clock className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {slot.hora} às {getHorarioFinal(slot.hora)}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {slot.quadra}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
                            Disponível
                          </Badge>
                        </div>
                      </button>
                    ))}
                </div>

                {selectedHorario && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-primary/10">
                      <span className="font-medium">Total:</span>
                      <span className="text-2xl font-bold text-primary">R$ {getPreco()},00</span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleReservar}
                    >
                      <CalendarPlus className="mr-2 h-5 w-5" />
                      Confirmar Reserva
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarPlus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Selecione uma data no calendário para ver os horários disponíveis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReservarHorario;
