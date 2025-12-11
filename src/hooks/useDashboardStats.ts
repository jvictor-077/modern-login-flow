import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, startOfMonth, endOfMonth } from "date-fns";

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
      const reservasHojeQuery = query(
        collection(db, "reservas"),
        where("data", "==", hojeStr),
        where("status", "!=", "cancelada")
      );
      const reservasHojeSnap = await getDocs(reservasHojeQuery);
      const reservasHoje = reservasHojeSnap.size;

      // Usuários ativos (alunos em_dia)
      const alunosQuery = query(
        collection(db, "alunos"),
        where("situacao", "==", "em_dia")
      );
      const alunosSnap = await getDocs(alunosQuery);
      const usuariosAtivos = alunosSnap.size;

      // Horas reservadas no mês
      const reservasMesQuery = query(
        collection(db, "reservas"),
        where("data", ">=", inicioMesStr),
        where("data", "<=", fimMesStr),
        where("status", "!=", "cancelada")
      );
      const reservasMesSnap = await getDocs(reservasMesQuery);

      let horasReservadas = 0;
      reservasMesSnap.forEach((doc) => {
        const reserva = doc.data();
        const inicio = parseInt(reserva.horario_inicio.split(":")[0]);
        const fim = parseInt(reserva.horario_fim.split(":")[0]);
        horasReservadas += (fim - inicio);
      });

      // Taxa de ocupação
      const slotsDisponiveis = 15;
      const taxaOcupacao = reservasHoje
        ? Math.min(Math.round((reservasHoje / slotsDisponiveis) * 100), 100)
        : 0;

      const tendenciaReservas = reservasHoje > 0 ? `+${reservasHoje}` : "0";
      const tendenciaUsuarios = usuariosAtivos > 0 ? `+${Math.min(usuariosAtivos, 10)}` : "0";
      const tendenciaHoras = horasReservadas > 0 ? `+${horasReservadas}h` : "0h";
      const tendenciaOcupacao = taxaOcupacao > 0 ? `${taxaOcupacao}%` : "0%";

      return {
        reservasHoje,
        usuariosAtivos,
        horasReservadas,
        taxaOcupacao,
        tendenciaReservas,
        tendenciaUsuarios,
        tendenciaHoras,
        tendenciaOcupacao,
      };
    },
    refetchInterval: 60000,
  });
}

export function useReservasDoDia(data: Date) {
  const dataStr = format(data, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["reservas-do-dia", dataStr],
    queryFn: async (): Promise<ReservaCompleta[]> => {
      const reservasQuery = query(
        collection(db, "reservas"),
        where("data", "==", dataStr),
        orderBy("horario_inicio")
      );
      const reservasSnap = await getDocs(reservasQuery);

      const reservas: ReservaCompleta[] = [];
      
      for (const doc of reservasSnap.docs) {
        const r = doc.data();
        
        // Buscar dados do aluno
        let aluno = undefined;
        if (r.aluno_id) {
          const alunoQuery = query(
            collection(db, "alunos"),
            where("__name__", "==", r.aluno_id)
          );
          const alunoSnap = await getDocs(alunoQuery);
          if (!alunoSnap.empty) {
            const alunoData = alunoSnap.docs[0].data();
            aluno = {
              id: alunoSnap.docs[0].id,
              nome: alunoData.nome,
              email: alunoData.email,
              celular: alunoData.celular,
            };
          }
        }

        reservas.push({
          id: doc.id,
          aluno_id: r.aluno_id,
          data: r.data,
          horario_inicio: r.horario_inicio,
          horario_fim: r.horario_fim,
          status: r.status,
          created_at: r.created_at?.toDate?.()?.toISOString() || r.created_at,
          aluno,
        });
      }

      return reservas;
    },
  });
}

export function useTodasReservas(filtros?: {
  dataInicio?: string;
  dataFim?: string;
  status?: "pendente" | "confirmada" | "cancelada" | "concluida";
}) {
  return useQuery({
    queryKey: ["todas-reservas", filtros],
    queryFn: async (): Promise<ReservaCompleta[]> => {
      let reservasQuery = query(collection(db, "reservas"), orderBy("data", "desc"));
      const reservasSnap = await getDocs(reservasQuery);

      const reservas: ReservaCompleta[] = [];

      for (const doc of reservasSnap.docs) {
        const r = doc.data();
        
        // Aplicar filtros manualmente
        if (filtros?.dataInicio && r.data < filtros.dataInicio) continue;
        if (filtros?.dataFim && r.data > filtros.dataFim) continue;
        if (filtros?.status && r.status !== filtros.status) continue;

        // Buscar dados do aluno
        let aluno = undefined;
        if (r.aluno_id) {
          const alunoQuery = query(
            collection(db, "alunos"),
            where("__name__", "==", r.aluno_id)
          );
          const alunoSnap = await getDocs(alunoQuery);
          if (!alunoSnap.empty) {
            const alunoData = alunoSnap.docs[0].data();
            aluno = {
              id: alunoSnap.docs[0].id,
              nome: alunoData.nome,
              email: alunoData.email,
              celular: alunoData.celular,
            };
          }
        }

        reservas.push({
          id: doc.id,
          aluno_id: r.aluno_id,
          data: r.data,
          horario_inicio: r.horario_inicio,
          horario_fim: r.horario_fim,
          status: r.status,
          created_at: r.created_at?.toDate?.()?.toISOString() || r.created_at,
          aluno,
        });
      }

      return reservas;
    },
  });
}

export interface AulaRecorrente {
  id: string;
  modalidade: string;
  professor: string;
  dia_semana: number;
  horario_inicio: string;
  horario_fim: string;
  max_alunos?: number;
  created_at?: string;
}

export function useAulasRecorrentes() {
  return useQuery({
    queryKey: ["aulas-recorrentes"],
    queryFn: async (): Promise<AulaRecorrente[]> => {
      const aulasQuery = query(
        collection(db, "aulas_recorrentes"),
        orderBy("dia_semana"),
        orderBy("horario_inicio")
      );
      const aulasSnap = await getDocs(aulasQuery);

      return aulasSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AulaRecorrente[];
    },
  });
}
