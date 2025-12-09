import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScannedProduct {
  nome: string;
  quantidade: number;
  preco: number;
  unidade?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      console.error('URL não fornecida');
      return new Response(
        JSON.stringify({ success: false, error: 'URL é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Buscando nota fiscal:', url);

    // Fetch the NFC-e page from the server (no CORS issues here)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      console.error('Erro ao buscar nota:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ success: false, error: `Erro ao acessar nota fiscal: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    console.log('HTML recebido, tamanho:', html.length);

    // Parse products from the HTML
    const products: ScannedProduct[] = [];
    
    // Match pattern: <span class="txtTit">PRODUCT NAME</span>
    // followed by Qtde.: X, UN: Y, Vl. Unit.: Z
    const productRegex = /<span class="txtTit">([^<]+)<\/span>[\s\S]*?<span class="Rqtd">[^:]*:\s*<\/strong>([^<]+)<\/span>\s*<span class="RUN">[^:]*:\s*<\/strong>([^<]+)<\/span>\s*<span class="RvlUnit">[^:]*:\s*<\/strong>([^<]+)<\/span>/g;
    
    let match;
    while ((match = productRegex.exec(html)) !== null) {
      const nome = match[1].trim();
      const quantidadeStr = match[2].trim().replace(',', '.');
      const unidade = match[3].trim();
      const precoStr = match[4].trim().replace(',', '.');
      
      const quantidade = parseFloat(quantidadeStr) || 1;
      const preco = parseFloat(precoStr) || 0;
      
      if (nome) {
        products.push({ nome, quantidade, preco, unidade });
        console.log('Produto encontrado:', nome, quantidade, unidade, preco);
      }
    }

    console.log('Total de produtos encontrados:', products.length);

    if (products.length === 0) {
      // Try alternative parsing for different HTML structures
      const altRegex = /<tr[^>]*>[\s\S]*?class="txtTit"[^>]*>([^<]+)<[\s\S]*?Qtde\.?:?\s*<\/strong>\s*([0-9,\.]+)[\s\S]*?UN:?\s*<\/strong>\s*(\w+)[\s\S]*?Vl\.?\s*Unit\.?:?\s*<\/strong>\s*([0-9,\.]+)/gi;
      
      while ((match = altRegex.exec(html)) !== null) {
        const nome = match[1].trim();
        const quantidadeStr = match[2].trim().replace(',', '.');
        const unidade = match[3].trim();
        const precoStr = match[4].trim().replace(',', '.');
        
        const quantidade = parseFloat(quantidadeStr) || 1;
        const preco = parseFloat(precoStr) || 0;
        
        if (nome && !products.some(p => p.nome === nome)) {
          products.push({ nome, quantidade, preco, unidade });
          console.log('Produto (alt) encontrado:', nome, quantidade, unidade, preco);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, products }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao processar nota fiscal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar nota fiscal';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
