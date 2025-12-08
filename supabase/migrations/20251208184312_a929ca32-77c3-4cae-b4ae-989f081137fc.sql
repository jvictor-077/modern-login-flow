-- 1. Create a SECURITY DEFINER function to handle secure student registration
-- This validates inputs and prevents arbitrary data insertion

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
  p_autoriza_imagem BOOLEAN DEFAULT FALSE,
  p_modalidades JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_aluno_id UUID;
  v_modalidade JSONB;
  v_allowed_modalidades TEXT[] := ARRAY['Beach Tennis', 'Vôlei Adulto Noite', 'Vôlei Adulto Manhã', 'Vôlei Teen', 'Futevôlei', 'Funcional'];
  v_allowed_planos TEXT[] := ARRAY['Mensal', 'Trimestral', '1x por semana', '2x por semana', '3x por semana', 'Aula Avulsa'];
  v_allowed_tipos_sanguineos TEXT[] := ARRAY['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'];
BEGIN
  -- Validate required fields
  IF p_nome IS NULL OR LENGTH(TRIM(p_nome)) < 2 THEN
    RAISE EXCEPTION 'Nome é obrigatório e deve ter pelo menos 2 caracteres';
  END IF;
  
  IF p_email IS NULL OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;
  
  -- Validate tipo_sanguineo if provided
  IF p_tipo_sanguineo IS NOT NULL AND p_tipo_sanguineo != '' AND NOT (p_tipo_sanguineo = ANY(v_allowed_tipos_sanguineos)) THEN
    RAISE EXCEPTION 'Tipo sanguíneo inválido';
  END IF;
  
  -- Validate modalidades
  FOR v_modalidade IN SELECT * FROM jsonb_array_elements(p_modalidades)
  LOOP
    IF NOT ((v_modalidade->>'modalidade') = ANY(v_allowed_modalidades)) THEN
      RAISE EXCEPTION 'Modalidade inválida: %', v_modalidade->>'modalidade';
    END IF;
    IF NOT ((v_modalidade->>'plano') = ANY(v_allowed_planos)) THEN
      RAISE EXCEPTION 'Plano inválido: %', v_modalidade->>'plano';
    END IF;
  END LOOP;
  
  -- Insert aluno
  INSERT INTO alunos (
    nome, email, cpf, celular, data_nascimento, endereco,
    contato_emergencia, tipo_sanguineo, doencas, alergias,
    observacoes, autoriza_imagem, situacao
  ) VALUES (
    TRIM(p_nome), LOWER(TRIM(p_email)), p_cpf, p_celular, p_data_nascimento,
    p_endereco, p_contato_emergencia, 
    CASE WHEN p_tipo_sanguineo = '' THEN NULL ELSE p_tipo_sanguineo END,
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

-- 2. Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can register as aluno" ON alunos;
DROP POLICY IF EXISTS "Anyone can insert modalidades for new alunos" ON aluno_modalidades;

-- 3. Create new restrictive policies - only allow inserts via the function
-- The function runs with SECURITY DEFINER so it bypasses RLS
-- Direct inserts should only be allowed for authenticated users for their own records

CREATE POLICY "Authenticated users can register themselves"
ON alunos FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Modalidades can only be inserted by admins or function"
ON aluno_modalidades FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. Grant execute permission on the function to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.register_aluno TO anon;
GRANT EXECUTE ON FUNCTION public.register_aluno TO authenticated;