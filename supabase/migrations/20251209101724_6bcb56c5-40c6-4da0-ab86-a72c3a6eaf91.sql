-- =============================================
-- TABELAS PARA ESTOQUE DA QUADRA
-- =============================================

CREATE TABLE public.produtos_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantidade INTEGER NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.produtos_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage estoque"
ON public.produtos_estoque
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view estoque"
ON public.produtos_estoque
FOR SELECT
USING (true);

CREATE TRIGGER update_produtos_estoque_updated_at
BEFORE UPDATE ON public.produtos_estoque
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELAS PARA LANCHONETE
-- =============================================

-- Produtos da lanchonete
CREATE TABLE public.lanchonete_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantidade INTEGER NOT NULL DEFAULT 0,
  categoria TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lanchonete_produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lanchonete users can manage produtos"
ON public.lanchonete_produtos
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'lanchonete'));

CREATE POLICY "Anyone can view lanchonete produtos"
ON public.lanchonete_produtos
FOR SELECT
USING (true);

CREATE TRIGGER update_lanchonete_produtos_updated_at
BEFORE UPDATE ON public.lanchonete_produtos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Itens de preparo
CREATE TABLE public.lanchonete_itens_preparo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  unidade TEXT NOT NULL DEFAULT 'un',
  estoque_minimo INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lanchonete_itens_preparo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lanchonete users can manage itens preparo"
ON public.lanchonete_itens_preparo
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'lanchonete'));

CREATE POLICY "Anyone can view itens preparo"
ON public.lanchonete_itens_preparo
FOR SELECT
USING (true);

CREATE TRIGGER update_lanchonete_itens_preparo_updated_at
BEFORE UPDATE ON public.lanchonete_itens_preparo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Status do pedido
CREATE TYPE public.status_pedido AS ENUM ('pendente', 'preparando', 'pronto', 'entregue', 'cancelado');

-- Pedidos
CREATE TABLE public.lanchonete_pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nome TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status status_pedido NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lanchonete_pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lanchonete users can manage pedidos"
ON public.lanchonete_pedidos
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'lanchonete'));

CREATE POLICY "Anyone can view pedidos"
ON public.lanchonete_pedidos
FOR SELECT
USING (true);

CREATE TRIGGER update_lanchonete_pedidos_updated_at
BEFORE UPDATE ON public.lanchonete_pedidos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Itens do pedido
CREATE TABLE public.lanchonete_pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.lanchonete_pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.lanchonete_produtos(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lanchonete_pedido_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lanchonete users can manage pedido itens"
ON public.lanchonete_pedido_itens
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'lanchonete'));

CREATE POLICY "Anyone can view pedido itens"
ON public.lanchonete_pedido_itens
FOR SELECT
USING (true);

-- =============================================
-- TABELA DE PREÇOS (configuração)
-- =============================================

CREATE TABLE public.modalidade_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modalidade TEXT NOT NULL,
  plano TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  descricao TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(modalidade, plano)
);

ALTER TABLE public.modalidade_precos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage precos"
ON public.modalidade_precos
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view precos"
ON public.modalidade_precos
FOR SELECT
USING (true);

-- Aulas avulsas
CREATE TABLE public.aulas_avulsas_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modalidade TEXT NOT NULL UNIQUE,
  valor NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.aulas_avulsas_precos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage aulas avulsas precos"
ON public.aulas_avulsas_precos
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view aulas avulsas precos"
ON public.aulas_avulsas_precos
FOR SELECT
USING (true);

-- Configuração de matrícula
CREATE TABLE public.configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  valor JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage configuracoes"
ON public.configuracoes
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view configuracoes"
ON public.configuracoes
FOR SELECT
USING (true);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_produtos_estoque_categoria ON public.produtos_estoque(categoria);
CREATE INDEX idx_lanchonete_produtos_categoria ON public.lanchonete_produtos(categoria);
CREATE INDEX idx_lanchonete_pedidos_status ON public.lanchonete_pedidos(status);
CREATE INDEX idx_lanchonete_pedidos_created_at ON public.lanchonete_pedidos(created_at);
CREATE INDEX idx_modalidade_precos_modalidade ON public.modalidade_precos(modalidade);