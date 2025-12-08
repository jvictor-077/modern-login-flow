import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Check, Repeat, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CalendarSlot } from "@/types/booking";
import { getCalendarSlotsForDate, generateTimeSlots } from "@/services/bookingService";

interface TimeSlotGridProps {
  selectedDate: Date;
  courtId?: string;
}

export function TimeSlotGrid({ selectedDate, courtId }: TimeSlotGridProps) {
  const slots = getCalendarSlotsForDate(selectedDate, courtId);
  const timeSlots = generateTimeSlots(selectedDate);
  const formattedDate = format(selectedDate, "d 'de' MMMM", { locale: ptBR });

  const freeSlots = slots.filter(slot => slot.status === "free").length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Horários para {formattedDate}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {freeSlots} de {timeSlots.length} horários disponíveis
          </p>
        </div>
        <Badge variant="outline" className="border-accent text-accent">
          <Clock className="w-3 h-3 mr-1" />
          1 hora por slot
        </Badge>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-accent bg-accent/10" />
          <span className="text-muted-foreground">Livre</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-muted-foreground">Aula Mensal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-muted-foreground">Reservado</span>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {slots.map((slot, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "h-auto py-4 px-4 flex flex-col items-center gap-2 transition-all duration-200",
                slot.status === "free" &&
                  "border-2 border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/50",
                slot.status === "recurring" &&
                  "border-2 border-blue-500 bg-blue-500 text-white hover:bg-blue-600",
                slot.status === "single" &&
                  "border-2 border-amber-500 bg-amber-500 text-white hover:bg-amber-600"
              )}
            >
              <span
                className={cn(
                  "font-mono font-semibold transition-colors",
                  slot.status === "free" && "text-foreground",
                  slot.status !== "free" && "text-white"
                )}
              >
                {slot.time}
              </span>
              <div className="flex items-center gap-1.5">
                {slot.status === "free" && (
                  <>
                    <Check className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-medium text-accent">
                      Livre
                    </span>
                  </>
                )}
                {slot.status === "recurring" && (
                  <>
                    <Repeat className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium truncate max-w-[80px]">
                      {slot.label}
                    </span>
                  </>
                )}
                {slot.status === "single" && (
                  <>
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium truncate max-w-[80px]">
                      {slot.label}
                    </span>
                  </>
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
