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

    console.log('Fetching URL:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `HTTP ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    console.log('HTML length:', html.length);
    
    // Log a sample of the HTML to debug
    console.log('HTML sample (first 500 chars):', html.substring(0, 500));

    const products: ScannedProduct[] = [];
    
    // Use regex to find all product entries
    // Pattern: txtTit class followed by product name, then Rqtd, RUN, RvlUnit
    const productPattern = /<span\s+class="txtTit">([^<]+)<\/span>[\s\S]*?<span\s+class="Rqtd"><strong>Qtde\.\:\s*<\/strong>([^<]+)<\/span>[\s\S]*?<span\s+class="RUN"><strong>UN\:\s*<\/strong>([^<]+)<\/span>[\s\S]*?<span\s+class="RvlUnit"><strong>Vl\.\s*Unit\.\:\s*<\/strong>([^<]+)<\/span>/gi;
    
    let match;
    while ((match = productPattern.exec(html)) !== null) {
      const nome = match[1].trim();
      const qtdStr = match[2].trim().replace(',', '.');
      const unidade = match[3].trim();
      const precoStr = match[4].trim().replace(',', '.');
      
      const quantidade = parseFloat(qtdStr) || 1;
      const preco = parseFloat(precoStr) || 0;
      
      console.log(`Found: ${nome} | Qty: ${quantidade} | Unit: ${unidade} | Price: ${preco}`);
      
      products.push({ nome, quantidade, preco, unidade });
    }

    console.log('Total products found:', products.length);

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
