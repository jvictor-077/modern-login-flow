import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export interface DashboardStats {
  reservasHoje: number;
  usuariosAtivos: number;
  horasReservadas: number;
  taxaOcupacao: number;
  tendenciaReservas: string;
  tendenciaUsuarios: string;
  tendenciaHoras: string;
  tendenciaOcupacao: string;
}

export interface ReservaCompleta {
  id: string;
  aluno_id: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  status: string;
  created_at: string;
  aluno?: {
    id: string;
    nome: string;
    email: string;
    celular?: string;
  };
}

// Buscar estatísticas do dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const hoje = new Date();
      const inicioMes = startOfMonth(hoje);
      const fimMes = endOfMonth(hoje);
      const hojeStr = format(hoje, "yyyy-MM-dd");
      const inicioMesStr = format(inicioMes, "yyyy-MM-dd");
      const fimMesStr = format(fimMes, "yyyy-MM-dd");

      // Reservas hoje
      const { count: reservasHoje, error: erroReservasHoje } = await supabase
        .from("reservas")
        .select("*", { count: "exact", head: true })
        .eq("data", hojeStr)
        .neq("status", "cancelada");

      if (erroReservasHoje) {
        console.error("Erro ao buscar reservas hoje:", erroReservasHoje);
      }

      // Usuários ativos (alunos em_dia)
      const { count: usuariosAtivos, error: erroUsuarios } = await supabase
        .from("alunos")
        .select("*", { count: "exact", head: true })
        .eq("situacao", "em_dia");

      if (erroUsuarios) {
        console.error("Erro ao buscar usuários ativos:", erroUsuarios);
      }

      // Horas reservadas no mês (soma de todas as reservas)
      const { data: reservasMes, error: erroReservasMes } = await supabase
        .from("reservas")
        .select("horario_inicio, horario_fim")
        .gte("data", inicioMesStr)
        .lte("data", fimMesStr)
        .neq("status", "cancelada");

      if (erroReservasMes) {
        console.error("Erro ao buscar reservas do mês:", erroReservasMes);
      }

      let horasReservadas = 0;
      if (reservasMes) {
        horasReservadas = reservasMes.reduce((acc, reserva) => {
          const inicio = parseInt(reserva.horario_inicio.split(":")[0]);
          const fim = parseInt(reserva.horario_fim.split(":")[0]);
          return acc + (fim - inicio);
        }, 0);
      }

      // Taxa de ocupação (baseada nos slots disponíveis vs reservados hoje)
      // Considerando horário de funcionamento: 7h às 22h = 15 slots por dia
      const slotsDisponiveis = 15;
      const taxaOcupacao = reservasHoje 
        ? Math.min(Math.round((reservasHoje / slotsDisponiveis) * 100), 100)
        : 0;

      // Calcular tendências (comparando com ontem/mês anterior - simplificado)
      const tendenciaReservas = reservasHoje && reservasHoje > 0 ? `+${reservasHoje}` : "0";
      const tendenciaUsuarios = usuariosAtivos && usuariosAtivos > 0 ? `+${Math.min(usuariosAtivos, 10)}` : "0";
      const tendenciaHoras = horasReservadas > 0 ? `+${horasReservadas}h` : "0h";
      const tendenciaOcupacao = taxaOcupacao > 0 ? `${taxaOcupacao}%` : "0%";

      return {
        reservasHoje: reservasHoje || 0,
        usuariosAtivos: usuariosAtivos || 0,
        horasReservadas,
        taxaOcupacao,
        tendenciaReservas,
        tendenciaUsuarios,
        tendenciaHoras,
        tendenciaOcupacao,
      };
    },
    refetchInterval: 60000, // Atualizar a cada 1 minuto
  });
}

// Buscar reservas de um dia específico
export function useReservasDoDia(data: Date) {
  const dataStr = format(data, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["reservas-do-dia", dataStr],
    queryFn: async (): Promise<ReservaCompleta[]> => {
      const { data: reservas, error } = await supabase
        .from("reservas")
        .select(`
          id,
          aluno_id,
          data,
          horario_inicio,
          horario_fim,
          status,
          created_at,
          alunos (
            id,
            nome,
            email,
            celular
          )
        `)
        .eq("data", dataStr)
        .order("horario_inicio");

      if (error) {
        console.error("Erro ao buscar reservas do dia:", error);
        throw error;
      }

      return (reservas || []).map((r: any) => ({
        id: r.id,
        aluno_id: r.aluno_id,
        data: r.data,
        horario_inicio: r.horario_inicio,
        horario_fim: r.horario_fim,
        status: r.status,
        created_at: r.created_at,
        aluno: r.alunos ? {
          id: r.alunos.id,
          nome: r.alunos.nome,
          email: r.alunos.email,
          celular: r.alunos.celular,
        } : undefined,
      }));
    },
  });
}

// Buscar todas as reservas (para o admin)
export function useTodasReservas(filtros?: { 
  dataInicio?: string; 
  dataFim?: string; 
  status?: "pendente" | "confirmada" | "cancelada" | "concluida";
}) {
  return useQuery({
    queryKey: ["todas-reservas", filtros],
    queryFn: async (): Promise<ReservaCompleta[]> => {
      let query = supabase
        .from("reservas")
        .select(`
          id,
          aluno_id,
          data,
          horario_inicio,
          horario_fim,
          status,
          created_at,
          alunos (
            id,
            nome,
            email,
            celular
          )
        `)
        .order("data", { ascending: false })
        .order("horario_inicio");

      if (filtros?.dataInicio) {
        query = query.gte("data", filtros.dataInicio);
      }
      if (filtros?.dataFim) {
        query = query.lte("data", filtros.dataFim);
      }
      if (filtros?.status) {
        query = query.eq("status", filtros.status);
      }

      const { data: reservas, error } = await query;

      if (error) {
        console.error("Erro ao buscar todas as reservas:", error);
        throw error;
      }

      return (reservas || []).map((r: any) => ({
        id: r.id,
        aluno_id: r.aluno_id,
        data: r.data,
        horario_inicio: r.horario_inicio,
        horario_fim: r.horario_fim,
        status: r.status,
        created_at: r.created_at,
        aluno: r.alunos ? {
          id: r.alunos.id,
          nome: r.alunos.nome,
          email: r.alunos.email,
          celular: r.alunos.celular,
        } : undefined,
      }));
    },
  });
}

// Buscar aulas recorrentes
export function useAulasRecorrentes() {
  return useQuery({
    queryKey: ["aulas-recorrentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aulas_recorrentes")
        .select("*")
        .order("dia_semana")
        .order("horario_inicio");

      if (error) {
        console.error("Erro ao buscar aulas recorrentes:", error);
        throw error;
      }

      return data || [];
    },
  });
}
