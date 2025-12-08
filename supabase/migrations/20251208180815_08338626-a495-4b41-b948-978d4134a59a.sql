-- =============================================
-- ENUM TYPES
-- =============================================
CREATE TYPE public.situacao_aluno AS ENUM ('em_dia', 'pendente', 'atrasado');
CREATE TYPE public.periodo_aula AS ENUM ('manha', 'tarde', 'noite');
CREATE TYPE public.status_reserva AS ENUM ('pendente', 'confirmada', 'cancelada', 'concluida');
CREATE TYPE public.app_role AS ENUM ('admin', 'aluno', 'lanchonete');

-- =============================================
-- PROFILES TABLE (linked to auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- USER ROLES TABLE (security - separate from profiles)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'aluno',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Get current user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- ALUNOS TABLE
-- =============================================
CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT,
  data_nascimento DATE,
  celular TEXT,
  endereco TEXT,
  contato_emergencia TEXT,
  tipo_sanguineo TEXT,
  doencas TEXT,
  alergias TEXT,
  observacoes TEXT,
  autoriza_imagem BOOLEAN DEFAULT false,
  situacao situacao_aluno DEFAULT 'pendente' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alunos can view their own data"
  ON public.alunos FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Alunos can update their own data"
  ON public.alunos FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert alunos"
  ON public.alunos FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Admins can delete alunos"
  ON public.alunos FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- ALUNO MODALIDADES TABLE
-- =============================================
CREATE TABLE public.aluno_modalidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  modalidade TEXT NOT NULL,
  plano TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.aluno_modalidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view modalidades"
  ON public.aluno_modalidades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE alunos.id = aluno_modalidades.aluno_id
      AND (alunos.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins can manage modalidades"
  ON public.aluno_modalidades FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- CRONOGRAMA AULAS TABLE
-- =============================================
CREATE TABLE public.cronograma_aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  modalidade TEXT NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  horario TIME NOT NULL,
  local TEXT DEFAULT 'Quadra' NOT NULL,
  professor TEXT,
  periodo periodo_aula NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.cronograma_aulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cronograma"
  ON public.cronograma_aulas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE alunos.id = cronograma_aulas.aluno_id
      AND (alunos.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins can manage cronograma"
  ON public.cronograma_aulas FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RESERVAS TABLE
-- =============================================
CREATE TABLE public.reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  status status_reserva DEFAULT 'pendente' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their reservas"
  ON public.reservas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE alunos.id = reservas.aluno_id
      AND (alunos.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can insert their reservas"
  ON public.reservas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE alunos.id = reservas.aluno_id
      AND alunos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their reservas"
  ON public.reservas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE alunos.id = reservas.aluno_id
      AND (alunos.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins can delete reservas"
  ON public.reservas FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- AULAS RECORRENTES (para admin gerenciar)
-- =============================================
CREATE TABLE public.aulas_recorrentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modalidade TEXT NOT NULL,
  professor TEXT NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  max_alunos INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.aulas_recorrentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view aulas recorrentes"
  ON public.aulas_recorrentes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage aulas recorrentes"
  ON public.aulas_recorrentes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGER FUNCTIONS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON public.alunos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at
  BEFORE UPDATE ON public.reservas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'aluno');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();