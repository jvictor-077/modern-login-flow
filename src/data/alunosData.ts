// =============================================
// DADOS MOCKADOS - ALUNOS E MENSALIDADES
// =============================================

import { Aluno, AulaCronograma } from "@/types/aluno";

// Alunos cadastrados
export const alunos: Aluno[] = [
  {
    id: "aluno-1",
    nome: "João Silva",
    email: "joao@email.com",
    cpf: "12345678900",
    data_nascimento: "1990-05-15",
    celular: "(11) 99999-1111",
    endereco: "Rua das Flores, 123, Centro, São Paulo - SP, 01234-567",
    contato_emergencia: "Maria Silva - (11) 98888-1111",
    tipo_sanguineo: "O+",
    doencas: "",
    alergias: "",
    modalidades: [{ nome: "Beach Tennis", plano: "Mensal 3x na semana" }],
    observacoes: "",
    autoriza_imagem: true,
    situacao: "em_dia",
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-01-15"),
  },
  {
    id: "aluno-2",
    nome: "Maria Santos",
    email: "maria@email.com",
    cpf: "98765432100",
    data_nascimento: "1985-03-20",
    celular: "(11) 99999-2222",
    endereco: "Av. Brasil, 456, Jardins, São Paulo - SP, 04567-890",
    contato_emergencia: "Pedro Santos - (11) 98888-2222",
    tipo_sanguineo: "A+",
    doencas: "",
    alergias: "",
    modalidades: [
      { nome: "Vôlei Adulto Noite", plano: "Mensal 2x na semana" },
      { nome: "Beach Tennis", plano: "Trimestral" },
    ],
    observacoes: "",
    autoriza_imagem: true,
    situacao: "pendente",
    created_at: new Date("2024-02-10"),
    updated_at: new Date("2024-02-10"),
  },
];

// Cronograma de aulas (vinculado ao aluno logado)
export const cronogramaAulas: AulaCronograma[] = [
  {
    id: "aula-1",
    aluno_id: "aluno-1",
    modalidade: "Beach Tennis",
    dia_semana: "Segunda-feira",
    horario: "07:00 - 08:00",
    local: "Quadra 1",
    professor: "Carlos",
    periodo: "manhã",
  },
  {
    id: "aula-2",
    aluno_id: "aluno-1",
    modalidade: "Beach Tennis",
    dia_semana: "Quarta-feira",
    horario: "07:00 - 08:00",
    local: "Quadra 1",
    professor: "Carlos",
    periodo: "manhã",
  },
  {
    id: "aula-3",
    aluno_id: "aluno-1",
    modalidade: "Beach Tennis",
    dia_semana: "Sexta-feira",
    horario: "07:00 - 08:00",
    local: "Quadra 1",
    professor: "Carlos",
    periodo: "manhã",
  },
  {
    id: "aula-4",
    aluno_id: "aluno-1",
    modalidade: "Vôlei",
    dia_semana: "Terça-feira",
    horario: "18:00 - 19:00",
    local: "Quadra 2",
    professor: "Marina",
    periodo: "noite",
  },
  {
    id: "aula-5",
    aluno_id: "aluno-1",
    modalidade: "Vôlei",
    dia_semana: "Quinta-feira",
    horario: "18:00 - 19:00",
    local: "Quadra 2",
    professor: "Marina",
    periodo: "noite",
  },
];

// Dados do aluno logado (será substituído por contexto de auth)
export const alunoLogado = {
  id: "aluno-1",
  nome: "João Silva",
  situacao: "em_dia" as const,
  modalidades: [
    { id: "beach_tennis", nome: "Beach Tennis" },
    { id: "volei", nome: "Vôlei" },
  ],
};
