// =============================================
// EXPORTAÇÃO CENTRAL - TIPOS E CONSTANTES
// =============================================

// Tipos de Reservas/Quadras
export * from "../types/booking";

// Tipos de Alunos
export * from "../types/aluno";

// Tipos de Estoque
export * from "../types/estoque";

// Tipos de Lanchonete
export * from "../types/lanchonete";

// Constantes de tipos de aula
export const CLASS_TYPES = [
  "Beach Tennis",
  "Vôlei Adulto Noite",
  "Vôlei Adulto Manhã",
  "Vôlei Teen",
  "Futevôlei",
  "Funcional",
];

// Dias da semana
export const DAYS_OF_WEEK = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sab" },
];
