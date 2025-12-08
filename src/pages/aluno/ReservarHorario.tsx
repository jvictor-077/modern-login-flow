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
import { AvailableSlot } from "@/types/booking";
import { 
  getAvailableSlotsForDate, 
  hasAvailableSlotsForDate,
  getPrice,
  calculateEndTime,
  addSingleBooking,
  getCourts
} from "@/services/bookingService";
import { pricingRules } from "@/data/mockData";

const ReservarHorario = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [duracao, setDuracao] = useState<1 | 2>(1);

  // Preços padrão da primeira quadra
  const defaultCourtId = getCourts()[0]?.id ?? "court-1";
  const PRECO_1H = getPrice(defaultCourtId, 1);
  const PRECO_2H = getPrice(defaultCourtId, 2);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => {
    setCurrentMonth(prev => addDays(startOfMonth(prev), -1));
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const nextMonth = () => {
    setCurrentMonth(prev => addDays(endOfMonth(prev), 1));
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return;
    if (!hasAvailableSlotsForDate(date)) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    setDuracao(1);
  };

  const getSlotsDisponiveis = (): AvailableSlot[] => {
    if (!selectedDate) return [];
    return getAvailableSlotsForDate(selectedDate).filter(s => s.is_available);
  };

  const getPreco = () => {
    const courtId = selectedSlot?.court_id ?? defaultCourtId;
    return getPrice(courtId, duracao);
  };

  const getHorarioFinal = () => {
    if (!selectedSlot) return "";
    return calculateEndTime(selectedSlot.start_time, duracao);
  };

  const handleReservar = () => {
    if (!selectedDate || !selectedSlot) return;
    
    const endTime = getHorarioFinal();
    const price = getPreco();
    
    // Adiciona a reserva usando o serviço
    addSingleBooking({
      court_id: selectedSlot.court_id,
      user_id: "user-1", // TODO: pegar do contexto de auth
      client_name: "Usuário Logado", // TODO: pegar do contexto de auth
      date: selectedDate,
      start_time: selectedSlot.start_time,
      end_time: endTime,
      duration_hours: duracao,
      price: price,
      status: "confirmed",
      payment_status: "pending",
    });
    
    toast.success("Horário reservado com sucesso!", {
      description: `${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} - ${selectedSlot.start_time} às ${endTime} - ${selectedSlot.court_name} - R$ ${price},00`,
    });
    
    setSelectedDate(null);
    setSelectedSlot(null);
    setDuracao(1);
  };

  const getDayStatus = (date: Date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return "past";
    if (!hasAvailableSlotsForDate(date)) return "unavailable";
    return "available";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold">Reservar Horário Avulso</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Selecione uma data e horário disponível</p>
      </div>

      {/* Preços */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="font-medium text-sm sm:text-base">Valores:</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="text-xs sm:text-base px-2 sm:px-4 py-1 sm:py-1.5 bg-background">
                1h = <span className="font-bold text-primary ml-1">R$ {PRECO_1H}</span>
              </Badge>
              <Badge variant="outline" className="text-xs sm:text-base px-2 sm:px-4 py-1 sm:py-1.5 bg-background">
                2h = <span className="font-bold text-primary ml-1">R$ {PRECO_2H}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Calendário */}
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 sm:h-10 sm:w-10">
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <CardTitle className="text-base sm:text-lg capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 sm:h-10 sm:w-10">
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((dia, i) => (
                <div 
                  key={`${dia}-${i}`} 
                  className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1 sm:py-2"
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
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
                      aspect-square rounded-md sm:rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm transition-all
                      ${isToday(day) ? "ring-1 sm:ring-2 ring-primary ring-offset-1 sm:ring-offset-2 ring-offset-background" : ""}
                      ${isSelected ? "bg-primary text-primary-foreground" : ""}
                      ${status === "past" ? "text-muted-foreground/30 cursor-not-allowed" : ""}
                      ${status === "unavailable" ? "text-muted-foreground/40 cursor-not-allowed" : ""}
                      ${status === "available" && !isSelected ? "hover:bg-accent/50 cursor-pointer" : ""}
                    `}
                  >
                    <span className="font-medium">{format(day, "d")}</span>
                    {status === "available" && isSameMonth(day, currentMonth) && !isSelected && (
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border text-[10px] sm:text-xs text-muted-foreground">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent" />
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-muted-foreground/30" />
                <span>Sem horários</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horários disponíveis */}
        <Card>
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              {selectedDate 
                ? <span className="truncate">{format(selectedDate, "EEE, dd MMM", { locale: ptBR })}</span>
                : "Selecione uma data"
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {selectedDate ? (
              <div className="space-y-3 sm:space-y-4">
                {/* Seleção de duração */}
                <div className="p-3 sm:p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Duração:</p>
                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      variant={duracao === 1 ? "default" : "outline"}
                      className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => setDuracao(1)}
                    >
                      <Clock className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      1h - R${PRECO_1H}
                    </Button>
                    <Button
                      variant={duracao === 2 ? "default" : "outline"}
                      className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => setDuracao(2)}
                    >
                      <Clock className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      2h - R${PRECO_2H}
                    </Button>
                  </div>
                </div>

                {/* Lista de horários */}
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Horários:</p>
                  {getSlotsDisponiveis().map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        w-full p-3 sm:p-4 rounded-xl border transition-all text-left
                        ${selectedSlot?.id === slot.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                        }
                        cursor-pointer
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`
                            w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                            ${selectedSlot?.id === slot.id ? "bg-primary text-primary-foreground" : "bg-muted"}
                          `}>
                            {selectedSlot?.id === slot.id ? (
                              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">
                              {slot.start_time} - {calculateEndTime(slot.start_time, duracao)}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              {slot.court_name}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 text-[10px] sm:text-xs">
                          Livre
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <div className="pt-3 sm:pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-primary/10">
                      <span className="font-medium text-sm sm:text-base">Total:</span>
                      <span className="text-xl sm:text-2xl font-bold text-primary">R$ {getPreco()},00</span>
                    </div>
                    <Button 
                      className="w-full text-sm sm:text-base" 
                      size="lg"
                      onClick={handleReservar}
                    >
                      <CalendarPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Confirmar Reserva
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <CalendarPlus className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/50 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  Selecione uma data no calendário
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
