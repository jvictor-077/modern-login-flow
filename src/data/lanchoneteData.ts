// =============================================
// DADOS MOCKADOS - LANCHONETE
// =============================================

import { ProdutoLanchonete, ItemPreparo, Pedido } from "@/types/lanchonete";

// === PRODUTOS DA LANCHONETE ===
export const produtosLanchonete: ProdutoLanchonete[] = [
  { id: "lanch-1", nome: "Água Mineral 500ml", preco: 4.00, quantidade: 48, categoria: "Bebidas", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "lanch-2", nome: "Refrigerante Lata", preco: 6.00, quantidade: 36, categoria: "Bebidas", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "lanch-3", nome: "Energético 250ml", preco: 15.00, quantidade: 24, categoria: "Bebidas", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "lanch-4", nome: "Suco Natural 300ml", preco: 10.00, quantidade: 20, categoria: "Bebidas", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "lanch-5", nome: "Coxinha", preco: 8.00, quantidade: 15, categoria: "Salgados", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "lanch-6", nome: "Empada", preco: 7.00, quantidade: 12, categoria: "Salgados", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "lanch-7", nome: "Pão de Queijo", preco: 5.00, quantidade: 30, categoria: "Salgados", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "lanch-8", nome: "Açaí 500ml", preco: 18.00, quantidade: 10, categoria: "Açaí", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "lanch-9", nome: "Açaí 300ml", preco: 12.00, quantidade: 15, categoria: "Açaí", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "lanch-10", nome: "Sanduíche Natural", preco: 15.00, quantidade: 8, categoria: "Lanches", is_active: true, created_at: new Date(), updated_at: new Date() },
];

// === ITENS DE PREPARO ===
export const itensPreparo: ItemPreparo[] = [
  { id: "prep-1", nome: "Açaí Polpa 10kg", preco: 120.00, quantidade: 5, unidade: "balde", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "prep-2", nome: "Banana", preco: 8.00, quantidade: 30, unidade: "kg", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "prep-3", nome: "Morango", preco: 25.00, quantidade: 10, unidade: "kg", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "prep-4", nome: "Leite Condensado", preco: 7.50, quantidade: 24, unidade: "lata", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "prep-5", nome: "Leite em Pó", preco: 18.00, quantidade: 12, unidade: "pacote", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "prep-6", nome: "Granola", preco: 15.00, quantidade: 8, unidade: "kg", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "prep-7", nome: "Aveia", preco: 12.00, quantidade: 6, unidade: "kg", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "prep-8", nome: "Calda de Chocolate", preco: 22.00, quantidade: 10, unidade: "litro", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "prep-9", nome: "Calda de Morango", preco: 20.00, quantidade: 8, unidade: "litro", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "prep-10", nome: "Copo Descartável 300ml", preco: 35.00, quantidade: 20, unidade: "pacote", is_active: true, created_at: new Date(), updated_at: new Date() },
  { id: "prep-11", nome: "Colher Descartável", preco: 18.00, quantidade: 15, unidade: "pacote", is_active: true, created_at: new Date(), updated_at: new Date() },
];

// === PEDIDOS ===
export const pedidos: Pedido[] = [
  {
    id: "ped-001",
    cliente_nome: "João Silva",
    itens: [
      { produto_id: "lanch-1", nome: "Água Mineral", quantidade: 2, preco_unitario: 4.00 },
      { produto_id: "lanch-5", nome: "Coxinha", quantidade: 1, preco_unitario: 8.00 },
    ],
    total: 16.00,
    status: "pending",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "ped-002",
    cliente_nome: "Maria Santos",
    itens: [
      { produto_id: "lanch-2", nome: "Refrigerante Lata", quantidade: 1, preco_unitario: 6.00 },
      { produto_id: "lanch-8", nome: "Açaí 500ml", quantidade: 2, preco_unitario: 18.00 },
    ],
    total: 42.00,
    status: "preparing",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "ped-003",
    cliente_nome: "Pedro Costa",
    itens: [
      { produto_id: "lanch-3", nome: "Energético", quantidade: 3, preco_unitario: 15.00 },
    ],
    total: 45.00,
    status: "ready",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "ped-004",
    cliente_nome: "Ana Oliveira",
    itens: [
      { produto_id: "lanch-4", nome: "Suco Natural", quantidade: 1, preco_unitario: 10.00 },
      { produto_id: "lanch-10", nome: "Sanduíche Natural", quantidade: 1, preco_unitario: 15.00 },
    ],
    total: 25.00,
    status: "delivered",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Estatísticas do dashboard (mockadas)
export const estatisticasLanchonete = {
  vendasHoje: 1245.00,
  pedidosHoje: 47,
  ticketMedio: 26.49,
  clientesAtendidos: 38,
};
