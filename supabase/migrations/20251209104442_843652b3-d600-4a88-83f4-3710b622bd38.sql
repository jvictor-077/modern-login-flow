-- Adicionar política para admins poderem inserir reservas
CREATE POLICY "Admins can insert reservas"
ON public.reservas
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Adicionar política para admins poderem inserir alunos (para reservas avulsas)
DROP POLICY IF EXISTS "Public registration allowed" ON public.alunos;

CREATE POLICY "Public registration allowed"
ON public.alunos
FOR INSERT
WITH CHECK (user_id IS NULL OR has_role(auth.uid(), 'admin'::app_role));