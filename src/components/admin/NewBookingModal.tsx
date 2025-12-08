import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, CalendarDays, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface RecurringBooking {
  id: string;
  type: "recurring";
  classType: string;
  daysOfWeek: number[];
  time: string;
}

export interface SingleBooking {
  id: string;
  type: "single";
  clientName: string;
  date: Date;
  time: string;
}

export type Booking = RecurringBooking | SingleBooking;

interface NewBookingModalProps {
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
}

const CLASS_TYPES = [
  "Pilates",
  "Musculação",
  "Funcional",
  "Yoga",
  "Beach Tennis",
  "Vôlei",
  "Badminton",
];

const DAYS_OF_WEEK = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Dom" },
];

function generateTimeOptions(dayOfWeek: number): string[] {
  let startHour: number;
  let endHour: number;

  if (dayOfWeek === 0) {
    startHour = 8;
    endHour = 20;
  } else if (dayOfWeek === 6) {
    startHour = 8;
    endHour = 22;
  } else {
    startHour = 7;
    endHour = 22;
  }

  const times: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return times;
}

function getAllValidTimes(): string[] {
  const times: string[] = [];
  for (let hour = 7; hour < 22; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return times;
}

export function NewBookingModal({ bookings, onAddBooking }: NewBookingModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Recurring booking state
  const [classType, setClassType] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [recurringTime, setRecurringTime] = useState("");

  // Single booking state
  const [clientName, setClientName] = useState("");
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);
  const [singleTime, setSingleTime] = useState("");

  const resetForm = () => {
    setClassType("");
    setSelectedDays([]);
    setRecurringTime("");
    setClientName("");
    setSingleDate(undefined);
    setSingleTime("");
  };

  const isTimeValidForDays = (time: string, days: number[]): boolean => {
    const hour = parseInt(time.split(":")[0]);
    return days.every((day) => {
      const validTimes = generateTimeOptions(day);
      return validTimes.includes(time);
    });
  };

  const checkConflict = (type: "recurring" | "single", data: any): boolean => {
    if (type === "recurring") {
      const { daysOfWeek, time } = data;
      return bookings.some((booking) => {
        if (booking.type === "recurring") {
          return (
            booking.time === time &&
            booking.daysOfWeek.some((d) => daysOfWeek.includes(d))
          );
        }
        return false;
      });
    } else {
      const { date, time } = data;
      const dayOfWeek = date.getDay();
      const dateStr = format(date, "yyyy-MM-dd");

      return bookings.some((booking) => {
        if (booking.type === "recurring") {
          return (
            booking.time === time && booking.daysOfWeek.includes(dayOfWeek)
          );
        } else {
          return (
            booking.time === time &&
            format(booking.date, "yyyy-MM-dd") === dateStr
          );
        }
      });
    }
  };

  const handleSaveRecurring = () => {
    if (!classType || selectedDays.length === 0 || !recurringTime) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para salvar a aula mensal.",
      });
      return;
    }

    if (!isTimeValidForDays(recurringTime, selectedDays)) {
      toast({
        variant: "destructive",
        title: "Horário inválido",
        description: "O horário selecionado não é válido para todos os dias escolhidos.",
      });
      return;
    }

    if (checkConflict("recurring", { daysOfWeek: selectedDays, time: recurringTime })) {
      toast({
        variant: "destructive",
        title: "Conflito de horário",
        description: "Já existe uma reserva para este horário em um dos dias selecionados.",
      });
      return;
    }

    const newBooking: RecurringBooking = {
      id: crypto.randomUUID(),
      type: "recurring",
      classType,
      daysOfWeek: selectedDays,
      time: recurringTime,
    };

    onAddBooking(newBooking);
    toast({
      title: "Aula mensal criada!",
      description: `${classType} agendado com sucesso.`,
    });
    resetForm();
    setOpen(false);
  };

  const handleSaveSingle = () => {
    if (!clientName || !singleDate || !singleTime) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para salvar o agendamento.",
      });
      return;
    }

    const dayOfWeek = singleDate.getDay();
    const validTimes = generateTimeOptions(dayOfWeek);
    if (!validTimes.includes(singleTime)) {
      toast({
        variant: "destructive",
        title: "Horário inválido",
        description: "O horário selecionado não está disponível para este dia.",
      });
      return;
    }

    if (checkConflict("single", { date: singleDate, time: singleTime })) {
      toast({
        variant: "destructive",
        title: "Conflito de horário",
        description: "Já existe uma reserva para este horário.",
      });
      return;
    }

    const newBooking: SingleBooking = {
      id: crypto.randomUUID(),
      type: "single",
      clientName,
      date: singleDate,
      time: singleTime,
    };

    onAddBooking(newBooking);
    toast({
      title: "Agendamento criado!",
      description: `Reserva para ${clientName} confirmada.`,
    });
    resetForm();
    setOpen(false);
  };

  const handleDayToggle = (day: number, checked: boolean) => {
    if (checked) {
      setSelectedDays((prev) => [...prev, day]);
    } else {
      setSelectedDays((prev) => prev.filter((d) => d !== day));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Reserva
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nova Reserva</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="recurring" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recurring" className="gap-2">
              <Repeat className="w-4 h-4" />
              Aula Mensal
            </TabsTrigger>
            <TabsTrigger value="single" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Agendamento Avulso
            </TabsTrigger>
          </TabsList>

          {/* Recurring Tab */}
          <TabsContent value="recurring" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="classType">Tipo de Aula</Label>
              <Select value={classType} onValueChange={setClassType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de aula" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dias da Semana</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <label
                    key={day.value}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                      selectedDays.includes(day.value)
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={(checked) =>
                        handleDayToggle(day.value, checked as boolean)
                      }
                    />
                    <span className="text-sm font-medium">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurringTime">Horário</Label>
              <Select value={recurringTime} onValueChange={setRecurringTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {getAllValidTimes().map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveRecurring} className="w-full mt-4">
              Salvar Aula Mensal
            </Button>
          </TabsContent>

          {/* Single Booking Tab */}
          <TabsContent value="single" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                placeholder="Nome completo"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !singleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {singleDate
                      ? format(singleDate, "PPP", { locale: ptBR })
                      : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={singleDate}
                    onSelect={setSingleDate}
                    locale={ptBR}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="singleTime">Horário</Label>
              <Select 
                value={singleTime} 
                onValueChange={setSingleTime}
                disabled={!singleDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder={singleDate ? "Selecione o horário" : "Selecione uma data primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {singleDate &&
                    generateTimeOptions(singleDate.getDay()).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveSingle} className="w-full mt-4">
              Salvar Agendamento
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
