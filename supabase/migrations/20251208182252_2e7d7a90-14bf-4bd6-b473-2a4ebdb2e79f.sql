-- Permitir INSERT público na tabela alunos para cadastros de novos alunos (sem autenticação)
DROP POLICY IF EXISTS "Admins can insert alunos" ON public.alunos;

CREATE POLICY "Anyone can register as aluno"
ON public.alunos
FOR INSERT
TO anon, authenticated
WITH CHECK (
  user_id IS NULL OR auth.uid() = user_id
);

-- Permitir INSERT público na tabela aluno_modalidades para cadastros
DROP POLICY IF EXISTS "Admins can manage modalidades" ON public.aluno_modalidades;

CREATE POLICY "Admins can manage modalidades"
ON public.aluno_modalidades
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert modalidades for new alunos"
ON public.aluno_modalidades
FOR INSERT
TO anon, authenticated
WITH CHECK (true);