import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ModalidadePreco {
  id: string;
  modalidade: string;
  plano: string;
  valor: number;
  descricao: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AulaAvulsaPreco {
  id: string;
  modalidade: string;
  valor: number;
  is_active: boolean;
  created_at: string;
}

export interface Configuracao {
  id: string;
  chave: string;
  valor: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function usePrecos() {
  const { data: modalidadePrecos = [], isLoading: isLoadingModalidades } = useQuery({
    queryKey: ["modalidade-precos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modalidade_precos")
        .select("*")
        .eq("is_active", true)
        .order("modalidade")
        .order("plano");

      if (error) throw error;
      return data as ModalidadePreco[];
    },
  });

  const { data: aulasAvulsas = [], isLoading: isLoadingAvulsas } = useQuery({
    queryKey: ["aulas-avulsas-precos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aulas_avulsas_precos")
        .select("*")
        .eq("is_active", true)
        .order("modalidade");

      if (error) throw error;
      return data as AulaAvulsaPreco[];
    },
  });

  const { data: configuracoes = [], isLoading: isLoadingConfig } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes")
        .select("*");

      if (error) throw error;
      return data as Configuracao[];
    },
  });

  // Agrupa preços por modalidade
  const precosModalidades = modalidadePrecos.reduce((acc, preco) => {
    if (!acc[preco.modalidade]) {
      acc[preco.modalidade] = [];
    }
    acc[preco.modalidade].push({ nome: preco.plano, valor: preco.valor, descricao: preco.descricao });
    return acc;
  }, {} as Record<string, { nome: string; valor: number; descricao: string | null }[]>);

  // Helpers
  function getPrecoPlano(modalidade: string, plano: string): number | null {
    const preco = modalidadePrecos.find(p => p.modalidade === modalidade && p.plano === plano);
    return preco ? preco.valor : null;
  }

  function getPrecoAulaAvulsa(modalidade: string): number | null {
    const normalizado = modalidade.toLowerCase();
    const avulsa = aulasAvulsas.find(a => 
      normalizado.includes(a.modalidade.toLowerCase()) || 
      a.modalidade.toLowerCase().includes(normalizado.split(" ")[0])
    );
    return avulsa ? avulsa.valor : null;
  }

  function getPlanosModalidade(modalidade: string) {
    return precosModalidades[modalidade] || [];
  }

  function getModalidadesDisponiveis(): string[] {
    return Object.keys(precosModalidades);
  }

  function getConfiguracao(chave: string) {
    return configuracoes.find(c => c.chave === chave)?.valor;
  }

  const matricula = getConfiguracao("matricula") as { valor: number; descricao: string } | undefined;

  return {
    modalidadePrecos,
    aulasAvulsas,
    precosModalidades,
    matricula: matricula || { valor: 50, descricao: "Inclui camisa de treino" },
    isLoading: isLoadingModalidades || isLoadingAvulsas || isLoadingConfig,
    getPrecoPlano,
    getPrecoAulaAvulsa,
    getPlanosModalidade,
    getModalidadesDisponiveis,
  };
}

// Função utilitária para formatar preço
export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
