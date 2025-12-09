-- =============================================
-- DATABASE SCHEMA - Arena Sports Management
-- PostgreSQL Database Schema Documentation
-- Generated: 2024-12-09
-- =============================================

-- ENUMS
-- =============================================

CREATE TYPE app_role AS ENUM ('admin', 'aluno', 'lanchonete');
CREATE TYPE situacao_aluno AS ENUM ('em_dia', 'pendente', 'atrasado');
CREATE TYPE status_reserva AS ENUM ('pendente', 'confirmada', 'cancelada', 'concluida');
CREATE TYPE periodo_aula AS ENUM ('manhã', 'tarde', 'noite');

-- =============================================
-- TABLE: profiles
-- Perfis de usuários autenticados
-- =============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE, -- Referência ao auth.users
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema';
COMMENT ON COLUMN public.profiles.user_id IS 'ID do usuário no sistema de autenticação';
COMMENT ON COLUMN public.profiles.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.email IS 'Email do usuário';

-- =============================================
-- TABLE: user_roles
-- Papéis/funções dos usuários no sistema
-- =============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Referência ao auth.users
    role app_role NOT NULL DEFAULT 'aluno',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

COMMENT ON TABLE public.user_roles IS 'Papéis dos usuários no sistema';
COMMENT ON COLUMN public.user_roles.role IS 'Papel: admin, aluno ou lanchonete';

-- =============================================
-- TABLE: alunos
-- Cadastro de alunos da arena
-- =============================================
CREATE TABLE public.alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- NULL para cadastros públicos pendentes
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cpf TEXT,
    celular TEXT,
    data_nascimento DATE,
    endereco TEXT,
    contato_emergencia TEXT,
    tipo_sanguineo TEXT CHECK (tipo_sanguineo IN ('A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-')),
    doencas TEXT,
    alergias TEXT,
    observacoes TEXT,
    autoriza_imagem BOOLEAN DEFAULT false,
    situacao situacao_aluno NOT NULL DEFAULT 'pendente',
    pin TEXT, -- PIN para operações na lanchonete
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.alunos IS 'Cadastro completo de alunos';
COMMENT ON COLUMN public.alunos.user_id IS 'NULL quando cadastro público aguardando aprovação';
COMMENT ON COLUMN public.alunos.situacao IS 'Status financeiro: em_dia, pendente, atrasado';
COMMENT ON COLUMN public.alunos.pin IS 'PIN de 4 dígitos para identificação na lanchonete';

-- =============================================
-- TABLE: aluno_modalidades
-- Modalidades/planos contratados por aluno
-- =============================================
CREATE TABLE public.aluno_modalidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    modalidade TEXT NOT NULL, -- Beach Tennis, Vôlei, Futevôlei, Funcional, etc.
    plano TEXT NOT NULL, -- Mensal, Trimestral, 1x semana, 2x semana, etc.
    valor NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.aluno_modalidades IS 'Modalidades e planos contratados por cada aluno';
COMMENT ON COLUMN public.aluno_modalidades.modalidade IS 'Beach Tennis, Vôlei Adulto Noite, etc.';
COMMENT ON COLUMN public.aluno_modalidades.plano IS 'Mensal, Trimestral, 1x por semana, etc.';

-- =============================================
-- TABLE: aulas_recorrentes
-- Aulas fixas da grade semanal
-- =============================================
CREATE TABLE public.aulas_recorrentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modalidade TEXT NOT NULL,
    professor TEXT NOT NULL,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    max_alunos INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.aulas_recorrentes IS 'Grade de aulas fixas semanais';
COMMENT ON COLUMN public.aulas_recorrentes.dia_semana IS '0=Domingo, 1=Segunda, ..., 6=Sábado';

-- =============================================
-- TABLE: cronograma_aulas
-- Vínculo aluno ↔ aula recorrente
-- =============================================
CREATE TABLE public.cronograma_aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    modalidade TEXT NOT NULL,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
    horario TIME NOT NULL,
    local TEXT NOT NULL DEFAULT 'Quadra',
    professor TEXT,
    periodo periodo_aula NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cronograma_aulas IS 'Cronograma pessoal de cada aluno';

-- =============================================
-- TABLE: reservas
-- Reservas avulsas de quadra
-- =============================================
CREATE TABLE public.reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    status status_reserva NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reservas IS 'Reservas avulsas de quadra pelos alunos';

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_alunos_email ON public.alunos(email);
CREATE INDEX idx_alunos_situacao ON public.alunos(situacao);
CREATE INDEX idx_alunos_user_id ON public.alunos(user_id);
CREATE INDEX idx_aluno_modalidades_aluno ON public.aluno_modalidades(aluno_id);
CREATE INDEX idx_cronograma_aluno ON public.cronograma_aulas(aluno_id);
CREATE INDEX idx_reservas_aluno ON public.reservas(aluno_id);
CREATE INDEX idx_reservas_data ON public.reservas(data);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Verifica se usuário tem determinado papel
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Retorna papel do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função para registrar aluno com validação
CREATE OR REPLACE FUNCTION public.register_aluno(
  p_nome TEXT,
  p_email TEXT,
  p_cpf TEXT DEFAULT NULL,
  p_celular TEXT DEFAULT NULL,
  p_data_nascimento DATE DEFAULT NULL,
  p_endereco TEXT DEFAULT NULL,
  p_contato_emergencia TEXT DEFAULT NULL,
  p_tipo_sanguineo TEXT DEFAULT NULL,
  p_doencas TEXT DEFAULT NULL,
  p_alergias TEXT DEFAULT NULL,
  p_observacoes TEXT DEFAULT NULL,
  p_autoriza_imagem BOOLEAN DEFAULT false,
  p_modalidades JSONB DEFAULT '[]'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_aluno_id UUID;
  v_modalidade JSONB;
BEGIN
  -- Validações
  IF p_nome IS NULL OR LENGTH(TRIM(p_nome)) < 2 THEN
    RAISE EXCEPTION 'Nome é obrigatório e deve ter pelo menos 2 caracteres';
  END IF;
  
  IF p_email IS NULL OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;
  
  -- Insert aluno
  INSERT INTO alunos (
    nome, email, cpf, celular, data_nascimento, endereco,
    contato_emergencia, tipo_sanguineo, doencas, alergias,
    observacoes, autoriza_imagem, situacao
  ) VALUES (
    TRIM(p_nome), LOWER(TRIM(p_email)), p_cpf, p_celular, p_data_nascimento,
    p_endereco, p_contato_emergencia, p_tipo_sanguineo,
    p_doencas, p_alergias, p_observacoes, p_autoriza_imagem, 'pendente'
  ) RETURNING id INTO v_aluno_id;
  
  -- Insert modalidades
  FOR v_modalidade IN SELECT * FROM jsonb_array_elements(p_modalidades)
  LOOP
    INSERT INTO aluno_modalidades (aluno_id, modalidade, plano, valor)
    VALUES (
      v_aluno_id,
      v_modalidade->>'modalidade',
      v_modalidade->>'plano',
      COALESCE((v_modalidade->>'valor')::NUMERIC, 0)
    );
  END LOOP;
  
  RETURN v_aluno_id;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON public.alunos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at
  BEFORE UPDATE ON public.reservas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
