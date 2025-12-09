-- Adicionar coluna de PIN (senha de 4 dígitos) para alunos
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS pin TEXT;