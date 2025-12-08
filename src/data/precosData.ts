// =============================================
// DADOS CENTRALIZADOS - PREÇOS E PLANOS
// =============================================

export interface PlanoPreco {
  nome: string;
  valor: number;
  descricao?: string;
}

export interface ModalidadePrecos {
  modalidade: string;
  planos: PlanoPreco[];
}

export interface AulaAvulsa {
  modalidade: string;
  valor: number;
}

// Preços por modalidade e plano
export const precosModalidades: ModalidadePrecos[] = [
  {
    modalidade: "Funcional",
    planos: [
      { nome: "Mensal", valor: 180.00 },
    ],
  },
  {
    modalidade: "Vôlei Adulto Noite",
    planos: [
      { nome: "Trimestral", valor: 160.00 },
      { nome: "1x por semana", valor: 110.00 },
    ],
  },
  {
    modalidade: "Vôlei Teen",
    planos: [
      { nome: "Trimestral", valor: 160.00 },
      { nome: "1x por semana", valor: 110.00 },
    ],
  },
  {
    modalidade: "Vôlei Adulto Manhã",
    planos: [
      { nome: "Mensal", valor: 140.00 },
      { nome: "1x por semana", valor: 90.00 },
    ],
  },
  {
    modalidade: "Beach Tennis",
    planos: [
      { nome: "Mensal", valor: 220.00 },
      { nome: "1x por semana", valor: 130.00 },
    ],
  },
  {
    modalidade: "Futevôlei",
    planos: [
      { nome: "1x por semana", valor: 150.00 },
      { nome: "2x por semana", valor: 220.00 },
      { nome: "3x por semana", valor: 310.00 },
    ],
  },
];

// Aulas avulsas
export const aulasAvulsas: AulaAvulsa[] = [
  { modalidade: "Beach Tennis", valor: 45.00 },
  { modalidade: "Funcional", valor: 40.00 },
  { modalidade: "Vôlei", valor: 35.00 },
];

// Matrícula
export const matricula = {
  valor: 50.00,
  descricao: "Inclui camisa de treino",
};

// Helper: Obter preço de um plano específico
export function getPrecoPlano(modalidade: string, plano: string): number | null {
  const mod = precosModalidades.find((m) => m.modalidade === modalidade);
  if (!mod) return null;
  const p = mod.planos.find((pl) => pl.nome === plano);
  return p ? p.valor : null;
}

// Helper: Obter preço de aula avulsa
export function getPrecoAulaAvulsa(modalidade: string): number | null {
  // Normaliza para encontrar vôlei
  const normalizado = modalidade.toLowerCase();
  const avulsa = aulasAvulsas.find((a) => 
    normalizado.includes(a.modalidade.toLowerCase()) || 
    a.modalidade.toLowerCase().includes(normalizado.split(" ")[0])
  );
  return avulsa ? avulsa.valor : null;
}

// Helper: Listar planos disponíveis para uma modalidade
export function getPlanosModalidade(modalidade: string): PlanoPreco[] {
  const mod = precosModalidades.find((m) => m.modalidade === modalidade);
  return mod ? mod.planos : [];
}

// Helper: Listar todas as modalidades disponíveis
export function getModalidadesDisponiveis(): string[] {
  return precosModalidades.map((m) => m.modalidade);
}

// Formatar valor em reais
export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
