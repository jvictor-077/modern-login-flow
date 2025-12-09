import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Tipos
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

export interface Pedido {
  id: string;
  cliente_nome: string;
  total: number;
  status: "pendente" | "preparando" | "pronto" | "entregue" | "cancelado";
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  itens?: PedidoItem[];
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  created_at: string;
  produto?: ProdutoLanchonete;
}

// Hook para produtos da lanchonete
export function useLanchoneteProdutos() {
  const queryClient = useQueryClient();

  const { data: produtos = [], isLoading, error } = useQuery({
    queryKey: ["lanchonete-produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lanchonete_produtos")
        .select("*")
        .eq("is_active", true)
        .order("categoria", { ascending: true })
        .order("nome");

      if (error) throw error;
      return data as ProdutoLanchonete[];
    },
  });

  const addProduto = useMutation({
    mutationFn: async (produto: Omit<ProdutoLanchonete, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("lanchonete_produtos")
        .insert(produto)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-produtos"] });
      toast({ title: "Produto adicionado com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao adicionar produto", description: error.message, variant: "destructive" });
    },
  });

  const updateQuantidade = useMutation({
    mutationFn: async ({ id, quantidade }: { id: string; quantidade: number }) => {
      const { error } = await supabase
        .from("lanchonete_produtos")
        .update({ quantidade, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-produtos"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar quantidade", description: error.message, variant: "destructive" });
    },
  });

  return { produtos, isLoading, error, addProduto, updateQuantidade };
}

// Hook para itens de preparo
export function useLanchonetePreparos() {
  const queryClient = useQueryClient();

  const { data: itens = [], isLoading, error } = useQuery({
    queryKey: ["lanchonete-itens-preparo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lanchonete_itens_preparo")
        .select("*")
        .eq("is_active", true)
        .order("nome");

      if (error) throw error;
      return data as ItemPreparo[];
    },
  });

  const addItem = useMutation({
    mutationFn: async (item: Omit<ItemPreparo, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("lanchonete_itens_preparo")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-itens-preparo"] });
      toast({ title: "Item adicionado com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao adicionar item", description: error.message, variant: "destructive" });
    },
  });

  const updateQuantidade = useMutation({
    mutationFn: async ({ id, quantidade }: { id: string; quantidade: number }) => {
      const { error } = await supabase
        .from("lanchonete_itens_preparo")
        .update({ quantidade, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-itens-preparo"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar quantidade", description: error.message, variant: "destructive" });
    },
  });

  return { itens, isLoading, error, addItem, updateQuantidade };
}

// Hook para pedidos
export function useLanchonetePedidos() {
  const queryClient = useQueryClient();

  const { data: pedidos = [], isLoading, error } = useQuery({
    queryKey: ["lanchonete-pedidos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lanchonete_pedidos")
        .select(`
          *,
          itens:lanchonete_pedido_itens(
            *,
            produto:lanchonete_produtos(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Pedido[];
    },
  });

  const createPedido = useMutation({
    mutationFn: async ({ 
      cliente_nome, 
      total, 
      observacoes, 
      itens 
    }: { 
      cliente_nome: string; 
      total: number; 
      observacoes?: string;
      itens: { produto_id: string; quantidade: number; preco_unitario: number }[];
    }) => {
      // Criar pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from("lanchonete_pedidos")
        .insert({ cliente_nome, total, observacoes })
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // Adicionar itens
      const itensComPedidoId = itens.map(item => ({
        ...item,
        pedido_id: pedido.id,
      }));

      const { error: itensError } = await supabase
        .from("lanchonete_pedido_itens")
        .insert(itensComPedidoId);

      if (itensError) throw itensError;

      return pedido;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-pedidos"] });
      toast({ title: "Pedido criado com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar pedido", description: error.message, variant: "destructive" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Pedido["status"] }) => {
      const { error } = await supabase
        .from("lanchonete_pedidos")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanchonete-pedidos"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    },
  });

  // Estatísticas
  const pedidosHoje = pedidos.filter(p => {
    const hoje = new Date().toISOString().split("T")[0];
    return p.created_at.startsWith(hoje);
  });

  const estatisticas = {
    vendasHoje: pedidosHoje.reduce((acc, p) => acc + Number(p.total), 0),
    pedidosHoje: pedidosHoje.length,
    ticketMedio: pedidosHoje.length > 0 
      ? pedidosHoje.reduce((acc, p) => acc + Number(p.total), 0) / pedidosHoje.length 
      : 0,
    clientesAtendidos: new Set(pedidosHoje.map(p => p.cliente_nome)).size,
  };

  return { pedidos, isLoading, error, createPedido, updateStatus, estatisticas };
}
