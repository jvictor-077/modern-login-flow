-- Remover política muito permissiva
DROP POLICY IF EXISTS "Allow email check for registration" ON public.alunos;