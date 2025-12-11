import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  collection, 
  query, 
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

export interface AulaRecorrenteFirestore {
  id: string;
  modalidade: string;
  professor: string;
  dia_semana: number;
  horario_inicio: string;
  horario_fim: string;
  max_alunos?: number;
  created_at: string;
}

export function useFirestoreAulasRecorrentes() {
  const queryClient = useQueryClient();

  const { data: aulas = [], isLoading, error } = useQuery({
    queryKey: ["aulas-recorrentes-firestore"],
    queryFn: async () => {
      const q = query(
        collection(db, "aulas_recorrentes"),
        orderBy("dia_semana"),
        orderBy("horario_inicio")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AulaRecorrenteFirestore[];
    },
  });

  const addAula = useMutation({
    mutationFn: async (aula: Omit<AulaRecorrenteFirestore, "id" | "created_at">) => {
      const docRef = await addDoc(collection(db, "aulas_recorrentes"), {
        ...aula,
        created_at: serverTimestamp()
      });
      return { id: docRef.id, ...aula };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aulas-recorrentes-firestore"] });
      toast({ title: "Aula adicionada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao adicionar aula", description: error.message, variant: "destructive" });
    },
  });

  const updateAula = useMutation({
    mutationFn: async ({ id, ...data }: Partial<AulaRecorrenteFirestore> & { id: string }) => {
      const docRef = doc(db, "aulas_recorrentes", id);
      await updateDoc(docRef, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aulas-recorrentes-firestore"] });
      toast({ title: "Aula atualizada!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar aula", description: error.message, variant: "destructive" });
    },
  });

  const deleteAula = useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, "aulas_recorrentes", id);
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aulas-recorrentes-firestore"] });
      toast({ title: "Aula removida!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover aula", description: error.message, variant: "destructive" });
    },
  });

  return {
    aulas,
    isLoading,
    error,
    addAula,
    updateAula,
    deleteAula,
  };
}
