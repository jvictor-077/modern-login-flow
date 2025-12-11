import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";

// ==================== MODALIDADE PREÇOS ====================

export interface ModalidadePrecoFirestore {
  id: string;
  modalidade: string;
  plano: string;
  valor: number;
  descricao?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useFirestoreModalidadePrecos() {
  const queryClient = useQueryClient();

  const { data: precos = [], isLoading, error } = useQuery({
    queryKey: ["modalidade-precos-firestore"],
    queryFn: async () => {
      const q = query(
        collection(db, "modalidade_precos"),
        where("is_active", "==", true)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ModalidadePrecoFirestore[];
    },
  });

  const addPreco = useMutation({
    mutationFn: async (preco: Omit<ModalidadePrecoFirestore, "id" | "created_at" | "updated_at">) => {
      const docRef = await addDoc(collection(db, "modalidade_precos"), {
        ...preco,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, ...preco };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modalidade-precos-firestore"] });
      toast({ title: "Preço adicionado!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao adicionar preço", description: error.message, variant: "destructive" });
    },
  });

  const updatePreco = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ModalidadePrecoFirestore> & { id: string }) => {
      const docRef = doc(db, "modalidade_precos", id);
      await updateDoc(docRef, { 
        ...data,
        updated_at: serverTimestamp() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modalidade-precos-firestore"] });
      toast({ title: "Preço atualizado!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar preço", description: error.message, variant: "destructive" });
    },
  });

  // Helpers
  const getPrecoPlano = (modalidade: string, plano: string): number | null => {
    const preco = precos.find(p => p.modalidade === modalidade && p.plano === plano);
    return preco?.valor ?? null;
  };

  const getPlanosModalidade = (modalidade: string) => {
    return precos
      .filter(p => p.modalidade === modalidade)
      .map(p => ({ nome: p.plano, valor: p.valor, descricao: p.descricao || null }));
  };

  const getModalidadesDisponiveis = (): string[] => {
    return [...new Set(precos.map(p => p.modalidade))];
  };

  return {
    precos,
    isLoading,
    error,
    addPreco,
    updatePreco,
    getPrecoPlano,
    getPlanosModalidade,
    getModalidadesDisponiveis,
  };
}

// ==================== AULAS AVULSAS PREÇOS ====================

export interface AulaAvulsaPrecoFirestore {
  id: string;
  modalidade: string;
  valor: number;
  is_active: boolean;
  created_at: string;
}

export function useFirestoreAulasAvulsasPrecos() {
  const queryClient = useQueryClient();

  const { data: precos = [], isLoading, error } = useQuery({
    queryKey: ["aulas-avulsas-precos-firestore"],
    queryFn: async () => {
      const q = query(
        collection(db, "aulas_avulsas_precos"),
        where("is_active", "==", true)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AulaAvulsaPrecoFirestore[];
    },
  });

  const getPrecoAulaAvulsa = (modalidade: string): number | null => {
    const preco = precos.find(p => p.modalidade === modalidade);
    return preco?.valor ?? null;
  };

  return {
    precos,
    isLoading,
    error,
    getPrecoAulaAvulsa,
  };
}

// ==================== CONFIGURAÇÕES ====================

export interface ConfiguracaoFirestore {
  id: string;
  chave: string;
  valor: any;
  created_at: string;
  updated_at: string;
}

export function useFirestoreConfiguracoes() {
  const queryClient = useQueryClient();

  const { data: configuracoes = [], isLoading, error } = useQuery({
    queryKey: ["configuracoes-firestore"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "configuracoes"));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConfiguracaoFirestore[];
    },
  });

  const getConfiguracao = (chave: string) => {
    return configuracoes.find(c => c.chave === chave)?.valor;
  };

  const setConfiguracao = useMutation({
    mutationFn: async ({ chave, valor }: { chave: string; valor: any }) => {
      const existing = configuracoes.find(c => c.chave === chave);
      
      if (existing) {
        const docRef = doc(db, "configuracoes", existing.id);
        await updateDoc(docRef, { 
          valor,
          updated_at: serverTimestamp() 
        });
      } else {
        await addDoc(collection(db, "configuracoes"), {
          chave,
          valor,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes-firestore"] });
    },
  });

  return {
    configuracoes,
    isLoading,
    error,
    getConfiguracao,
    setConfiguracao,
  };
}
