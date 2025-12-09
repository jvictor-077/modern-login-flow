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
    
    // Structure: <span class="txtTit">NAME</span>...<span class="Rqtd"><strong>Qtde.: </strong>QTD</span><span class="RUN"><strong>UN: </strong>UNIT</span><span class="RvlUnit"><strong>Vl. Unit.: </strong>PRICE</span>
    
    // First, find all product rows in the table
    const rowRegex = /<tr[^>]*>[\s\S]*?<span class="txtTit">([^<]+)<\/span>[\s\S]*?<\/tr>/gi;
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const rowHtml = rowMatch[0];
      const nome = rowMatch[1].trim();
      
      // Extract quantity: <span class="Rqtd"><strong>Qtde.: </strong>VALUE</span>
      const qtdMatch = rowHtml.match(/<span class="Rqtd"><strong>Qtde\.: <\/strong>([^<]+)<\/span>/i);
      // Extract unit: <span class="RUN"><strong>UN: </strong>VALUE</span>
      const unMatch = rowHtml.match(/<span class="RUN"><strong>UN: <\/strong>([^<]+)<\/span>/i);
      // Extract price: <span class="RvlUnit"><strong>Vl. Unit.: </strong>VALUE</span>
      const precoMatch = rowHtml.match(/<span class="RvlUnit"><strong>Vl\. Unit\.: <\/strong>([^<]+)<\/span>/i);
      
      if (nome && qtdMatch && precoMatch) {
        const quantidadeStr = qtdMatch[1].trim().replace(',', '.');
        const unidade = unMatch ? unMatch[1].trim() : 'UN';
        const precoStr = precoMatch[1].trim().replace(',', '.');
        
        const quantidade = parseFloat(quantidadeStr) || 1;
        const preco = parseFloat(precoStr) || 0;
        
        products.push({ nome, quantidade, preco, unidade });
        console.log('Produto encontrado:', nome, quantidade, unidade, preco);
      }
    }

    console.log('Total de produtos encontrados:', products.length);

    // If no products found with first method, try alternative approach
    if (products.length === 0) {
      console.log('Tentando método alternativo de parsing...');
      
      // Find all txtTit spans and extract data from surrounding context
      const txtTitRegex = /<span class="txtTit">([^<]+)<\/span>/gi;
      let txtMatch;
      let lastIndex = 0;
      
      while ((txtMatch = txtTitRegex.exec(html)) !== null) {
        const nome = txtMatch[1].trim();
        const startPos = txtMatch.index;
        
        // Get the next 500 characters to find the product details
        const context = html.substring(startPos, startPos + 500);
        
        // Look for quantity, unit and price in the context
        const qtdMatch = context.match(/Qtde\.?:?\s*<\/strong>\s*([0-9,\.]+)/i);
        const unMatch = context.match(/UN:?\s*<\/strong>\s*([A-Z]+)/i);
        const precoMatch = context.match(/Vl\.?\s*Unit\.?:?\s*<\/strong>\s*([0-9,\.]+)/i);
        
        if (nome && qtdMatch && precoMatch) {
          const quantidadeStr = qtdMatch[1].trim().replace(',', '.');
          const unidade = unMatch ? unMatch[1].trim() : 'UN';
          const precoStr = precoMatch[1].trim().replace(',', '.');
          
          const quantidade = parseFloat(quantidadeStr) || 1;
          const preco = parseFloat(precoStr) || 0;
          
          // Avoid duplicates
          if (!products.some(p => p.nome === nome && p.quantidade === quantidade)) {
            products.push({ nome, quantidade, preco, unidade });
            console.log('Produto (alt) encontrado:', nome, quantidade, unidade, preco);
          }
        }
        
        lastIndex = txtMatch.index + txtMatch[0].length;
      }
      
      console.log('Total de produtos (método alt):', products.length);
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
