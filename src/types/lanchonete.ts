// =============================================
// TIPOS CENTRALIZADOS - LANCHONETE
// =============================================

// === PRODUTOS DA LANCHONETE ===
export interface ProdutoLanchonete {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: CategoriaLanchonete;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export const CATEGORIAS_LANCHONETE = [
  "Bebidas",
  "Salgados",
  "Açaí",
  "Lanches",
  "Doces",
  "Outros",
] as const;

export type CategoriaLanchonete = typeof CATEGORIAS_LANCHONETE[number];

// === ITENS DE PREPARO ===
export interface ItemPreparo {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  unidade: string;
  estoque_minimo?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// === PEDIDOS ===
export interface ItemPedido {
  produto_id: string;
  nome: string;
  quantidade: number;
  preco_unitario: number;
}

export interface Pedido {
  id: string;
  cliente_nome: string;
  itens: ItemPedido[];
  total: number;
  status: StatusPedido;
  created_at: Date;
  updated_at: Date;
}

export type StatusPedido = "pending" | "preparing" | "ready" | "delivered" | "cancelled";

export const STATUS_PEDIDO_CONFIG = {
  pending: { label: "Pendente", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  preparing: { label: "Preparando", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  ready: { label: "Pronto", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  delivered: { label: "Entregue", color: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20" },
} as const;

// Fluxo de status do pedido
export const PEDIDO_STATUS_FLOW: Record<StatusPedido, StatusPedido | null> = {
  pending: "preparing",
  preparing: "ready",
  ready: "delivered",
  delivered: null,
  cancelled: null,
};
