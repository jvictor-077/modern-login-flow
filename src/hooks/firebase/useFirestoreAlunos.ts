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
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import { SituacaoAluno, Modalidade } from "@/types/aluno";

export interface AlunoFirestore {
  id: string;
  user_id?: string;
  nome: string;
  email: string;
  cpf?: string;
  celular?: string;
  data_nascimento?: string;
  endereco?: string;
  contato_emergencia?: string;
  tipo_sanguineo?: string;
  doencas?: string;
  alergias?: string;
  observacoes?: string;
  autoriza_imagem: boolean;
  situacao: SituacaoAluno;
  pin?: string;
  modalidades?: Modalidade[];
  created_at: string;
  updated_at: string;
}

export function useFirestoreAlunos() {
  const queryClient = useQueryClient();

  const { data: alunos = [], isLoading, error } = useQuery({
    queryKey: ["alunos-firestore"],
    queryFn: async () => {
      const q = query(
        collection(db, "alunos"),
        orderBy("nome")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AlunoFirestore[];
    },
  });

  const getAlunoById = async (id: string) => {
    const docRef = doc(db, "alunos", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AlunoFirestore;
    }
    return null;
  };

  const addAluno = useMutation({
    mutationFn: async (aluno: Omit<AlunoFirestore, "id" | "created_at" | "updated_at">) => {
      const docRef = await addDoc(collection(db, "alunos"), {
        ...aluno,
        situacao: aluno.situacao || "pendente",
        autoriza_imagem: aluno.autoriza_imagem || false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, ...aluno };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos-firestore"] });
      toast({ title: "Aluno cadastrado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao cadastrar aluno", description: error.message, variant: "destructive" });
    },
  });

  const updateAluno = useMutation({
    mutationFn: async ({ id, ...data }: Partial<AlunoFirestore> & { id: string }) => {
      const docRef = doc(db, "alunos", id);
      await updateDoc(docRef, { 
        ...data,
        updated_at: serverTimestamp() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos-firestore"] });
      toast({ title: "Aluno atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar aluno", description: error.message, variant: "destructive" });
    },
  });

  const deleteAluno = useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, "alunos", id);
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos-firestore"] });
      toast({ title: "Aluno removido com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover aluno", description: error.message, variant: "destructive" });
    },
  });

  return {
    alunos,
    isLoading,
    error,
    getAlunoById,
    addAluno,
    updateAluno,
    deleteAluno,
  };
}

// Hook para buscar aluno por user_id (usuário logado)
export function useFirestoreAlunoByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ["aluno-by-user", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const q = query(
        collection(db, "alunos"),
        where("user_id", "==", userId)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as AlunoFirestore;
    },
    enabled: !!userId,
  });
}
