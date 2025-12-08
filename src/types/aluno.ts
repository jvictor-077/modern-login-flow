// =============================================
// TIPOS CENTRALIZADOS - ALUNOS E MENSALIDADES
// =============================================

export type SituacaoAluno = "em_dia" | "pendente" | "atrasado";

export interface Modalidade {
  nome: string;
  plano: string;
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  data_nascimento: string;
  celular: string;
  endereco: string;
  contato_emergencia: string;
  tipo_sanguineo: string;
  doencas: string;
  alergias: string;
  modalidades: Modalidade[];
  observacoes: string;
  autoriza_imagem: boolean;
  situacao: SituacaoAluno;
  created_at: Date;
  updated_at: Date;
}

// Cronograma de aulas do aluno
export interface AulaCronograma {
  id: string;
  aluno_id: string;
  modalidade: string;
  dia_semana: string;
  horario: string;
  local: string;
  professor: string;
  periodo: "manhã" | "tarde" | "noite";
}

// Planos disponíveis (genéricos - planos específicos por modalidade em precosData.ts)
export const PLANOS_DISPONIVEIS = [
  "Mensal",
  "Trimestral",
  "1x por semana",
  "2x por semana",
  "3x por semana",
  "Aula Avulsa",
] as const;

export type PlanoType = typeof PLANOS_DISPONIVEIS[number];

// Modalidades disponíveis
export const MODALIDADES_DISPONIVEIS = [
  "Beach Tennis",
  "Vôlei Adulto Noite",
  "Vôlei Adulto Manhã",
  "Vôlei Teen",
  "Futevôlei",
  "Funcional",
] as const;

export type ModalidadeType = typeof MODALIDADES_DISPONIVEIS[number];

// Tipos sanguíneos
export const TIPOS_SANGUINEOS = ["A+", "A-", "AB+", "AB-", "B+", "B-", "O+", "O-"] as const;

export type TipoSanguineoType = typeof TIPOS_SANGUINEOS[number];

// Dias da semana
export const DIAS_SEMANA = [
  { value: 0, label: "Dom", full: "Domingo" },
  { value: 1, label: "Seg", full: "Segunda-feira" },
  { value: 2, label: "Ter", full: "Terça-feira" },
  { value: 3, label: "Qua", full: "Quarta-feira" },
  { value: 4, label: "Qui", full: "Quinta-feira" },
  { value: 5, label: "Sex", full: "Sexta-feira" },
  { value: 6, label: "Sab", full: "Sábado" },
] as const;
