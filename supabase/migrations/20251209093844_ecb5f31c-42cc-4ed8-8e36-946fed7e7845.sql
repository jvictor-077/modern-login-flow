-- Permitir cadastro público de alunos (sem autenticação, com user_id NULL)
DROP POLICY IF EXISTS "Authenticated users can register themselves" ON public.alunos;

CREATE POLICY "Public registration allowed"
ON public.alunos
FOR INSERT
WITH CHECK (user_id IS NULL);

-- Manter a política para usuários autenticados se cadastrarem
CREATE POLICY "Authenticated users can register themselves"
ON public.alunos
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());