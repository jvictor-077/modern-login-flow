import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimeSlotGridProps {
  selectedDate: Date;
}

function generateTimeSlots(date: Date): string[] {
  const dayOfWeek = date.getDay();
  let startHour: number;
  let endHour: number;

  // Sunday = 0, Monday = 1, ..., Saturday = 6
  if (dayOfWeek === 0) {
    // Sunday: 08:00 - 20:00
    startHour = 8;
    endHour = 20;
  } else if (dayOfWeek === 6) {
    // Saturday: 08:00 - 22:00
    startHour = 8;
    endHour = 22;
  } else {
    // Monday to Friday: 07:00 - 22:00
    startHour = 7;
    endHour = 22;
  }

  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    const start = `${hour.toString().padStart(2, "0")}:00`;
    const end = `${(hour + 1).toString().padStart(2, "0")}:00`;
    slots.push(`${start} - ${end}`);
  }

  return slots;
}

export function TimeSlotGrid({ selectedDate }: TimeSlotGridProps) {
  const timeSlots = generateTimeSlots(selectedDate);
  const formattedDate = format(selectedDate, "d 'de' MMMM", { locale: ptBR });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Horários para {formattedDate}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {timeSlots.length} horários disponíveis
          </p>
        </div>
        <Badge variant="outline" className="border-accent text-accent">
          <Clock className="w-3 h-3 mr-1" />
          1 hora por slot
        </Badge>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {timeSlots.map((slot, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-4 px-4 flex flex-col items-center gap-2 border-2 border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/50 transition-all duration-200 group"
            >
              <span className="font-mono font-semibold text-foreground group-hover:text-accent transition-colors">
                {slot}
              </span>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-accent">Livre</span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
