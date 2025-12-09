-- Adicionar constraint único no email para garantir que não haja duplicatas
ALTER TABLE public.alunos ADD CONSTRAINT alunos_email_unique UNIQUE (email);