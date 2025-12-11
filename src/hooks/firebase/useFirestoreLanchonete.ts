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
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import { StatusPedido } from "@/types/lanchonete";

// ==================== PRODUTOS ====================

export interface ProdutoLanchonete {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useFirestoreLanchoneteProdutos() {
  const queryClient = useQueryClient();

  const { data: produtos = [], isLoading, error } = useQuery({
    queryKey: ["lanchonete-produtos-firestore"],
    queryFn: async () => {
      const q = query(
        collection(db, "lanchonete_produtos"),
        where("is_active", "==", true),
        orderBy("nome")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProdutoLanchonete[];
    },
  });

  const addProduto = useMutation({
    mutationFn: async (produto: Omit<ProdutoLanchonete, "id" | "created_at" | "updated_at">) => {
      const docRef = await addDoc(collection(db, "lanchonete_produtos"), {
        ...produto,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, ...produto };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-produtos-firestore"] });
      toast({ title: "Produto adicionado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao adicionar produto", description: error.message, variant: "destructive" });
    },
  });

  const updateQuantidade = useMutation({
    mutationFn: async ({ id, quantidade }: { id: string; quantidade: number }) => {
      const docRef = doc(db, "lanchonete_produtos", id);
      await updateDoc(docRef, { 
        quantidade, 
        updated_at: serverTimestamp() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-produtos-firestore"] });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar quantidade", description: error.message, variant: "destructive" });
    },
  });

  return {
    produtos,
    isLoading,
    error,
    addProduto,
    updateQuantidade,
  };
}

// ==================== ITENS DE PREPARO ====================

export interface ItemPreparo {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  estoque_minimo: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useFirestoreLanchonetePreparos() {
  const queryClient = useQueryClient();

  const { data: itens = [], isLoading, error } = useQuery({
    queryKey: ["lanchonete-preparos-firestore"],
    queryFn: async () => {
      const q = query(
        collection(db, "lanchonete_itens_preparo"),
        where("is_active", "==", true),
        orderBy("nome")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ItemPreparo[];
    },
  });

  const addItem = useMutation({
    mutationFn: async (item: Omit<ItemPreparo, "id" | "created_at" | "updated_at">) => {
      const docRef = await addDoc(collection(db, "lanchonete_itens_preparo"), {
        ...item,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, ...item };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-preparos-firestore"] });
      toast({ title: "Item adicionado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao adicionar item", description: error.message, variant: "destructive" });
    },
  });

  const updateQuantidade = useMutation({
    mutationFn: async ({ id, quantidade }: { id: string; quantidade: number }) => {
      const docRef = doc(db, "lanchonete_itens_preparo", id);
      await updateDoc(docRef, { 
        quantidade, 
        updated_at: serverTimestamp() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-preparos-firestore"] });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar quantidade", description: error.message, variant: "destructive" });
    },
  });

  return {
    itens,
    isLoading,
    error,
    addItem,
    updateQuantidade,
  };
}

// ==================== PEDIDOS ====================

export interface PedidoItem {
  produto_id: string;
  nome?: string;
  quantidade: number;
  preco_unitario: number;
}

export interface Pedido {
  id: string;
  cliente_nome: string;
  itens: PedidoItem[];
  total: number;
  status: StatusPedido;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
}

export function useFirestoreLanchonetePedidos() {
  const queryClient = useQueryClient();

  const { data: pedidos = [], isLoading, error } = useQuery({
    queryKey: ["lanchonete-pedidos-firestore"],
    queryFn: async () => {
      const q = query(
        collection(db, "lanchonete_pedidos"),
        orderBy("created_at", "desc")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pedido[];
    },
  });

  const createPedido = useMutation({
    mutationFn: async (pedido: { cliente_nome: string; itens: PedidoItem[]; total: number; observacoes?: string }) => {
      const batch = writeBatch(db);
      
      // Criar pedido
      const pedidoRef = doc(collection(db, "lanchonete_pedidos"));
      batch.set(pedidoRef, {
        cliente_nome: pedido.cliente_nome,
        total: pedido.total,
        status: "pendente",
        observacoes: pedido.observacoes || null,
        itens: pedido.itens, // Armazenar itens diretamente no documento
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      await batch.commit();
      return { id: pedidoRef.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-pedidos-firestore"] });
      toast({ title: "Pedido criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar pedido", description: error.message, variant: "destructive" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusPedido }) => {
      const docRef = doc(db, "lanchonete_pedidos", id);
      await updateDoc(docRef, { 
        status, 
        updated_at: serverTimestamp() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-pedidos-firestore"] });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    },
  });

  // Estatísticas do dia
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const pedidosHoje = pedidos.filter(p => {
    const dataPedido = new Date(p.created_at);
    return dataPedido >= hoje;
  });
  
  const estatisticas = {
    totalPedidos: pedidosHoje.length,
    totalVendas: pedidosHoje
      .filter(p => p.status !== "cancelado")
      .reduce((acc, p) => acc + p.total, 0),
    pedidosPendentes: pedidosHoje.filter(p => p.status === "pendente").length,
  };

  return {
    pedidos,
    isLoading,
    error,
    createPedido,
    updateStatus,
    estatisticas,
  };
}
