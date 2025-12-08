// =============================================
// TIPOS CENTRALIZADOS - ESTOQUE (QUADRA)
// =============================================

export interface ProdutoEstoque {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  categoria?: string;
  unidade?: string;
  estoque_minimo?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Categorias de estoque da quadra
export const CATEGORIAS_ESTOQUE_QUADRA = [
  "Equipamentos",
  "Materiais",
  "Acessórios",
  "Bebidas",
  "Outros",
] as const;

export type CategoriaEstoqueQuadra = typeof CATEGORIAS_ESTOQUE_QUADRA[number];
