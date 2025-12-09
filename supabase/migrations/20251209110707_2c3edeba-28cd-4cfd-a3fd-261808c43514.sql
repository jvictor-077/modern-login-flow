-- Remover políticas de INSERT restritivas existentes
DROP POLICY IF EXISTS "Authenticated users can register themselves" ON public.alunos;
DROP POLICY IF EXISTS "Public registration allowed" ON public.alunos;

-- Criar política PERMISSIVE para cadastro público (sem autenticação)
CREATE POLICY "Public registration allowed" 
ON public.alunos 
FOR INSERT 
TO anon, authenticated
WITH CHECK (user_id IS NULL);

-- Criar política PERMISSIVE para usuários autenticados se registrarem
CREATE POLICY "Authenticated users can register themselves" 
ON public.alunos 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Política para admins poderem inserir qualquer aluno
CREATE POLICY "Admins can insert any aluno"
ON public.alunos
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));