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
import { CLASS_TYPES, DAYS_OF_WEEK } from "@/data";
import {
  getAllValidTimes,
  getValidTimesForDay,
  isTimeValidForDay,
  calculateEndTime,
} from "@/services/bookingService";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQueryClient } from "@tanstack/react-query";

interface NewBookingModalProps {
  onBookingAdded?: () => void;
}

export function NewBookingModal({ onBookingAdded }: NewBookingModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleSaveRecurring = async () => {
    if (!classType || selectedDays.length === 0 || !recurringTime) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para salvar a aula mensal.",
      });
      return;
    }

    // Valida horário para todos os dias selecionados
    const invalidDay = selectedDays.find(day => !isTimeValidForDay(recurringTime, day));
    if (invalidDay !== undefined) {
      toast({
        variant: "destructive",
        title: "Horário inválido",
        description: "O horário selecionado não é válido para todos os dias escolhidos.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar conflitos no Firestore
      const aulasQuery = query(
        collection(db, "aulas_recorrentes"),
        where("horario_inicio", "==", recurringTime)
      );
      const aulasSnapshot = await getDocs(aulasQuery);
      const aulasExistentes = aulasSnapshot.docs
        .map(d => d.data())
        .filter(a => selectedDays.includes(a.dia_semana));

      if (aulasExistentes.length > 0) {
        const diasConflito = aulasExistentes.map(a => 
          DAYS_OF_WEEK.find(d => d.value === a.dia_semana)?.label || `Dia ${a.dia_semana}`
        ).join(", ");
        
        toast({
          variant: "destructive",
          title: "Conflito de horário",
          description: `Já existe aula às ${recurringTime} nos dias: ${diasConflito}`,
        });
        setIsSubmitting(false);
        return;
      }

      const horarioFim = calculateEndTime(recurringTime, 1);

      // Inserir uma aula para cada dia da semana selecionado
      for (const dia of selectedDays) {
        await addDoc(collection(db, "aulas_recorrentes"), {
          modalidade: classType,
          professor: "A definir",
          dia_semana: dia,
          horario_inicio: recurringTime,
          horario_fim: horarioFim,
          max_alunos: 8,
          created_at: serverTimestamp(),
        });
      }

      // Invalidar queries para atualizar a grade
      await queryClient.invalidateQueries({ queryKey: ["aulas-recorrentes"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      toast({
        title: "Aula mensal criada!",
        description: `${classType} agendado para ${selectedDays.length} dia(s) da semana.`,
      });
      resetForm();
      setOpen(false);
      onBookingAdded?.();
    } catch (error) {
      console.error("Erro ao salvar aula recorrente:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSingle = async () => {
    if (!clientName || !singleDate || !singleTime) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para salvar o agendamento.",
      });
      return;
    }

    const dayOfWeek = singleDate.getDay();
    if (!isTimeValidForDay(singleTime, dayOfWeek)) {
      toast({
        variant: "destructive",
        title: "Horário inválido",
        description: "O horário selecionado não está disponível para este dia.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const dataFormatada = format(singleDate, "yyyy-MM-dd");

      // Verificar conflito com aulas recorrentes
      const aulasQuery = query(
        collection(db, "aulas_recorrentes"),
        where("dia_semana", "==", dayOfWeek),
        where("horario_inicio", "==", singleTime)
      );
      const aulasSnapshot = await getDocs(aulasQuery);

      if (!aulasSnapshot.empty) {
        const aula = aulasSnapshot.docs[0].data();
        toast({
          variant: "destructive",
          title: "Conflito de horário",
          description: `Já existe aula de ${aula.modalidade} neste horário.`,
        });
        setIsSubmitting(false);
        return;
      }

      // Verificar conflito com reservas existentes
      const reservasQuery = query(
        collection(db, "reservas"),
        where("data", "==", dataFormatada),
        where("horario_inicio", "==", singleTime)
      );
      const reservasSnapshot = await getDocs(reservasQuery);
      const reservasConflito = reservasSnapshot.docs
        .map(d => d.data())
        .filter(r => r.status !== "cancelada");

      if (reservasConflito.length > 0) {
        toast({
          variant: "destructive",
          title: "Conflito de horário",
          description: `Já existe reserva neste horário.`,
        });
        setIsSubmitting(false);
        return;
      }

      // Buscar ou criar aluno
      const alunosQuery = query(
        collection(db, "alunos"),
        where("nome", "==", clientName)
      );
      const alunosSnapshot = await getDocs(alunosQuery);
      
      let alunoId: string;

      if (alunosSnapshot.empty) {
        // Criar novo aluno
        const novoAlunoRef = await addDoc(collection(db, "alunos"), {
          nome: clientName,
          email: `${clientName.toLowerCase().replace(/\s+/g, '.')}@reserva.temp`,
          situacao: "pendente",
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        alunoId = novoAlunoRef.id;
      } else {
        alunoId = alunosSnapshot.docs[0].id;
      }

      // Criar a reserva
      const horarioFim = calculateEndTime(singleTime, 1);

      await addDoc(collection(db, "reservas"), {
        aluno_id: alunoId,
        data: dataFormatada,
        horario_inicio: singleTime,
        horario_fim: horarioFim,
        status: "confirmada",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Invalidar queries
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      await queryClient.invalidateQueries({ queryKey: ["reservas-do-dia"] });
      await queryClient.invalidateQueries({ queryKey: ["todas-reservas"] });

      toast({
        title: "Agendamento criado!",
        description: `Reserva para ${clientName} confirmada.`,
      });
      resetForm();
      setOpen(false);
      onBookingAdded?.();
    } catch (error) {
      console.error("Erro ao salvar reserva:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsSubmitting(false);
    }
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

            <Button 
              onClick={handleSaveRecurring} 
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar Aula Mensal"}
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
                    getValidTimesForDay(singleDate.getDay()).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSaveSingle} 
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar Agendamento"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
