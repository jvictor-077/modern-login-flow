import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";

export interface ProdutoEstoque {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useFirestoreEstoque() {
  const queryClient = useQueryClient();

  const { data: produtos = [], isLoading, error } = useQuery({
    queryKey: ["produtos-estoque-firestore"],
    queryFn: async () => {
      const q = query(
        collection(db, "produtos_estoque"),
        where("is_active", "==", true),
        orderBy("nome")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProdutoEstoque[];
    },
  });

  const addProduto = useMutation({
    mutationFn: async (produto: Omit<ProdutoEstoque, "id" | "created_at" | "updated_at">) => {
      const docRef = await addDoc(collection(db, "produtos_estoque"), {
        ...produto,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, ...produto };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos-estoque-firestore"] });
      toast({ title: "Produto adicionado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao adicionar produto", description: error.message, variant: "destructive" });
    },
  });

  const updateQuantidade = useMutation({
    mutationFn: async ({ id, quantidade }: { id: string; quantidade: number }) => {
      const docRef = doc(db, "produtos_estoque", id);
      await updateDoc(docRef, { 
        quantidade, 
        updated_at: serverTimestamp() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos-estoque-firestore"] });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar quantidade", description: error.message, variant: "destructive" });
    },
  });

  const deleteProduto = useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, "produtos_estoque", id);
      await updateDoc(docRef, { 
        is_active: false,
        updated_at: serverTimestamp()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos-estoque-firestore"] });
      toast({ title: "Produto removido com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover produto", description: error.message, variant: "destructive" });
    },
  });

  return {
    produtos,
    isLoading,
    error,
    addProduto,
    updateQuantidade,
    deleteProduto,
  };
}
