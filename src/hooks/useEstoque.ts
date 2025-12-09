import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export function useEstoque() {
  const queryClient = useQueryClient();

  const { data: produtos = [], isLoading, error } = useQuery({
    queryKey: ["produtos-estoque"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos_estoque")
        .select("*")
        .eq("is_active", true)
        .order("nome");

      if (error) throw error;
      return data as ProdutoEstoque[];
    },
  });

  const addProduto = useMutation({
    mutationFn: async (produto: Omit<ProdutoEstoque, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("produtos_estoque")
        .insert(produto)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos-estoque"] });
      toast({ title: "Produto adicionado com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao adicionar produto", description: error.message, variant: "destructive" });
    },
  });

  const updateQuantidade = useMutation({
    mutationFn: async ({ id, quantidade }: { id: string; quantidade: number }) => {
      const { error } = await supabase
        .from("produtos_estoque")
        .update({ quantidade, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos-estoque"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar quantidade", description: error.message, variant: "destructive" });
    },
  });

  const deleteProduto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("produtos_estoque")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos-estoque"] });
      toast({ title: "Produto removido com sucesso!" });
    },
    onError: (error) => {
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
