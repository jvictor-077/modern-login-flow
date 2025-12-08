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
  CalendarPlus
} from "lucide-react";
import { toast } from "sonner";

// Horários disponíveis mockados
const horariosDisponiveis = [
  { id: 1, horario: "07:00 - 08:00", quadra: "Quadra 1", vagas: 2 },
  { id: 2, horario: "08:00 - 09:00", quadra: "Quadra 1", vagas: 4 },
  { id: 3, horario: "09:00 - 10:00", quadra: "Quadra 2", vagas: 1 },
  { id: 4, horario: "10:00 - 11:00", quadra: "Quadra 1", vagas: 3 },
  { id: 5, horario: "14:00 - 15:00", quadra: "Quadra 2", vagas: 4 },
  { id: 6, horario: "15:00 - 16:00", quadra: "Quadra 1", vagas: 2 },
  { id: 7, horario: "16:00 - 17:00", quadra: "Quadra 2", vagas: 0 },
  { id: 8, horario: "17:00 - 18:00", quadra: "Quadra 1", vagas: 3 },
  { id: 9, horario: "18:00 - 19:00", quadra: "Quadra 2", vagas: 1 },
  { id: 10, horario: "19:00 - 20:00", quadra: "Quadra 1", vagas: 2 },
];

// Dias com horários ocupados (mockado)
const diasOcupados = [3, 7, 15, 22, 28];

const ReservarHorario = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHorario, setSelectedHorario] = useState<number | null>(null);

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

  const handleDateClick = (date: Date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return;
    setSelectedDate(date);
    setSelectedHorario(null);
  };

  const handleReservar = () => {
    if (!selectedDate || !selectedHorario) return;
    
    const horario = horariosDisponiveis.find(h => h.id === selectedHorario);
    
    toast.success("Horário reservado com sucesso!", {
      description: `${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} - ${horario?.horario} - ${horario?.quadra}`,
    });
    
    setSelectedDate(null);
    setSelectedHorario(null);
  };

  const getDayStatus = (date: Date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return "past";
    if (diasOcupados.includes(date.getDate())) return "full";
    return "available";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Reservar Horário Avulso</h1>
        <p className="text-muted-foreground">Selecione uma data e horário disponível</p>
      </div>

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
                    disabled={status === "past" || status === "full"}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all
                      ${isToday(day) ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                      ${isSelected ? "bg-primary text-primary-foreground" : ""}
                      ${status === "past" ? "text-muted-foreground/30 cursor-not-allowed" : ""}
                      ${status === "full" ? "bg-destructive/20 text-destructive cursor-not-allowed" : ""}
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
                <span className="w-2 h-2 rounded-full bg-destructive/50" />
                <span>Lotado</span>
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
                ? `Horários - ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
                : "Selecione uma data"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-3">
                {horariosDisponiveis.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.vagas > 0 && setSelectedHorario(slot.id)}
                    disabled={slot.vagas === 0}
                    className={`
                      w-full p-4 rounded-xl border transition-all text-left
                      ${selectedHorario === slot.id 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                      }
                      ${slot.vagas === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
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
                          <p className="font-medium">{slot.horario}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {slot.quadra}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={slot.vagas > 0 ? "outline" : "secondary"}
                        className={slot.vagas > 2 
                          ? "bg-accent/20 text-accent border-accent/30" 
                          : slot.vagas > 0 
                            ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                            : ""
                        }
                      >
                        {slot.vagas > 0 ? `${slot.vagas} vagas` : "Lotado"}
                      </Badge>
                    </div>
                  </button>
                ))}

                {selectedHorario && (
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={handleReservar}
                  >
                    <CalendarPlus className="mr-2 h-5 w-5" />
                    Confirmar Reserva
                  </Button>
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
