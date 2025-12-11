import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";

export type StatusReserva = 'pendente' | 'confirmada' | 'cancelada' | 'concluida';

export interface ReservaFirestore {
  id: string;
  aluno_id: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  status: StatusReserva;
  created_at: string;
  updated_at: string;
}

export interface ReservaComAluno extends ReservaFirestore {
  aluno?: {
    nome: string;
    email: string;
    celular?: string;
  };
}

export function useFirestoreReservas() {
  const queryClient = useQueryClient();

  const { data: reservas = [], isLoading, error } = useQuery({
    queryKey: ["reservas-firestore"],
    queryFn: async () => {
      const q = query(
        collection(db, "reservas"),
        orderBy("data", "desc")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReservaFirestore[];
    },
  });

  const addReserva = useMutation({
    mutationFn: async (reserva: Omit<ReservaFirestore, "id" | "created_at" | "updated_at">) => {
      const docRef = await addDoc(collection(db, "reservas"), {
        ...reserva,
        status: reserva.status || "pendente",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, ...reserva };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservas-firestore"] });
      toast({ title: "Reserva criada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar reserva", description: error.message, variant: "destructive" });
    },
  });

  const updateReserva = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ReservaFirestore> & { id: string }) => {
      const docRef = doc(db, "reservas", id);
      await updateDoc(docRef, { 
        ...data,
        updated_at: serverTimestamp() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservas-firestore"] });
      toast({ title: "Reserva atualizada!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar reserva", description: error.message, variant: "destructive" });
    },
  });

  const cancelReserva = useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, "reservas", id);
      await updateDoc(docRef, { 
        status: "cancelada",
        updated_at: serverTimestamp() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservas-firestore"] });
      toast({ title: "Reserva cancelada!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao cancelar reserva", description: error.message, variant: "destructive" });
    },
  });

  const deleteReserva = useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, "reservas", id);
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservas-firestore"] });
      toast({ title: "Reserva removida!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover reserva", description: error.message, variant: "destructive" });
    },
  });

  return {
    reservas,
    isLoading,
    error,
    addReserva,
    updateReserva,
    cancelReserva,
    deleteReserva,
  };
}

// Hook para reservas de uma data específica
export function useFirestoreReservasPorData(data: string) {
  return useQuery({
    queryKey: ["reservas-data-firestore", data],
    queryFn: async () => {
      const q = query(
        collection(db, "reservas"),
        where("data", "==", data),
        orderBy("horario_inicio")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReservaFirestore[];
    },
    enabled: !!data,
  });
}

// Hook para reservas de um aluno específico
export function useFirestoreReservasPorAluno(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["reservas-aluno-firestore", alunoId],
    queryFn: async () => {
      if (!alunoId) return [];
      
      const q = query(
        collection(db, "reservas"),
        where("aluno_id", "==", alunoId),
        orderBy("data", "desc")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReservaFirestore[];
    },
    enabled: !!alunoId,
  });
}
