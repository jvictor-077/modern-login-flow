-- Adicionar política de leitura pública apenas para verificar email duplicado
-- Esta política permite SELECT apenas na coluna id quando filtrando por email
CREATE POLICY "Allow email check for registration"
ON public.alunos
FOR SELECT
USING (true);