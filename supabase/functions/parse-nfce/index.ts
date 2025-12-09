import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExternalApiProduct {
  nome: string;
  quantidade: number;
  valorTotal: number;
}

interface ExternalApiResponse {
  totalProdutos: number;
  valorCompraTotal: number;
  produtos: ExternalApiProduct[];
}

interface ScannedProduct {
  nome: string;
  quantidade: number;
  preco: number;
  unidade?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling external API with URL:', url);

    // Call external API
    const response = await fetch('https://306328517e43.ngrok-free.app/scan-nfce', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ success: false, error: `Erro na API externa: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: ExternalApiResponse = await response.json();
    console.log('External API response:', JSON.stringify(data));

    if (!data.produtos || data.produtos.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não foi possível extrair os produtos da nota fiscal' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map external API response to expected format
    const products: ScannedProduct[] = data.produtos.map((p) => ({
      nome: p.nome,
      quantidade: p.quantidade,
      preco: p.valorTotal,
      unidade: 'UN',
    }));

    console.log('Mapped products:', products.length);

    return new Response(
      JSON.stringify({ success: true, products }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
