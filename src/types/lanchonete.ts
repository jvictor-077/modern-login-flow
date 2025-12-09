// =============================================
// TIPOS CENTRALIZADOS - LANCHONETE
// =============================================

// === PRODUTOS DA LANCHONETE ===
export interface ProdutoLanchonete {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: CategoriaLanchonete | string | null;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export const CATEGORIAS_LANCHONETE = [
  "Bebidas",
  "Salgados",
  "Açaí",
  "Lanches",
  "Doces",
  "Porções",
  "Outros",
] as const;

export type CategoriaLanchonete = typeof CATEGORIAS_LANCHONETE[number];

// === ITENS DE PREPARO ===
export interface ItemPreparo {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  estoque_minimo?: number;
  is_active?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// === PEDIDOS ===
export interface ItemPedido {
  produto_id: string;
  nome?: string;
  quantidade: number;
  preco_unitario: number;
}

export interface Pedido {
  id: string;
  cliente_nome: string;
  itens: ItemPedido[];
  total: number;
  status: StatusPedido;
  observacoes?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export type StatusPedido = "pendente" | "preparando" | "pronto" | "entregue" | "cancelado";

export const STATUS_PEDIDO_CONFIG = {
  pendente: { label: "Pendente", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  preparando: { label: "Preparando", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  pronto: { label: "Pronto", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  entregue: { label: "Entregue", color: "bg-muted text-muted-foreground border-border" },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20" },
} as const;

// Fluxo de status do pedido
export const PEDIDO_STATUS_FLOW: Record<StatusPedido, StatusPedido | null> = {
  pendente: "preparando",
  preparando: "pronto",
  pronto: "entregue",
  entregue: null,
  cancelado: null,
};
