import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock, 
  MapPin,
  CalendarCheck
} from "lucide-react";

// Reservas mockadas do usuário
const reservasMock = [
  {
    id: 1,
    data: new Date(2025, 11, 15),
    horaInicio: "09:00",
    horaFim: "10:00",
    quadra: "Quadra 1",
    duracao: 1,
    valor: 60,
    status: "confirmada" as const,
  },
  {
    id: 2,
    data: new Date(2025, 11, 18),
    horaInicio: "14:00",
    horaFim: "16:00",
    quadra: "Quadra 2",
    duracao: 2,
    valor: 120,
    status: "confirmada" as const,
  },
  {
    id: 3,
    data: new Date(2025, 11, 10),
    horaInicio: "10:00",
    horaFim: "11:00",
    quadra: "Quadra 1",
    duracao: 1,
    valor: 60,
    status: "concluida" as const,
  },
  {
    id: 4,
    data: new Date(2025, 11, 5),
    horaInicio: "15:00",
    horaFim: "17:00",
    quadra: "Quadra 2",
    duracao: 2,
    valor: 120,
    status: "concluida" as const,
  },
];

type Reserva = typeof reservasMock[0];

const MinhasReservas = () => {
  const [filtro, setFiltro] = useState<"todas" | "confirmada" | "concluida">("todas");

  const reservasFiltradas = reservasMock.filter(r => {
    if (filtro === "todas") return true;
    return r.status === filtro;
  });

  const getStatusBadge = (status: Reserva["status"]) => {
    if (status === "confirmada") {
      return (
        <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px] sm:text-xs">
          <CalendarCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
          Confirmada
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px] sm:text-xs">
        Concluída
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold">Minhas Reservas</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Visualize suas reservas de horário</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        <Button
          variant={filtro === "todas" ? "default" : "outline"}
          size="sm"
          onClick={() => setFiltro("todas")}
          className="text-xs sm:text-sm h-8 sm:h-9 shrink-0"
        >
          Todas
        </Button>
        <Button
          variant={filtro === "confirmada" ? "default" : "outline"}
          size="sm"
          onClick={() => setFiltro("confirmada")}
          className="text-xs sm:text-sm h-8 sm:h-9 shrink-0"
        >
          Confirmadas
        </Button>
        <Button
          variant={filtro === "concluida" ? "default" : "outline"}
          size="sm"
          onClick={() => setFiltro("concluida")}
          className="text-xs sm:text-sm h-8 sm:h-9 shrink-0"
        >
          Concluídas
        </Button>
      </div>

      {/* Lista de Reservas */}
      {reservasFiltradas.length > 0 ? (
        <div className="grid gap-3 sm:gap-4">
          {reservasFiltradas.map((reserva) => (
            <Card key={reserva.id} className={reserva.status === "concluida" ? "opacity-70" : ""}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-base sm:text-lg font-bold text-primary">
                      {format(reserva.data, "dd")}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground uppercase">
                      {format(reserva.data, "MMM", { locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-medium text-sm sm:text-base capitalize truncate">
                        {format(reserva.data, "EEEE", { locale: ptBR })}
                      </span>
                      {getStatusBadge(reserva.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        {reserva.horaInicio} - {reserva.horaFim}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        {reserva.quadra}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-muted-foreground">{reserva.duracao}h</span>
                      <span className="mx-1.5 sm:mx-2">•</span>
                      <span className="text-primary font-bold">R$ {reserva.valor},00</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 sm:py-12 text-center">
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/50 mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground">
              {filtro === "todas" 
                ? "Você ainda não possui reservas"
                : `Nenhuma reserva ${filtro === "confirmada" ? "confirmada" : "concluída"}`
              }
            </p>
            <Button variant="link" className="mt-2 text-sm" asChild>
              <a href="/aluno/reservar">Fazer uma reserva</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MinhasReservas;
