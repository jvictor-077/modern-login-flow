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

    console.log('Buscando nota fiscal:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      console.error('Erro HTTP:', response.status);
      return new Response(
        JSON.stringify({ success: false, error: `Erro HTTP: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    console.log('HTML tamanho:', html.length);
    
    // Log a sample of the HTML for debugging
    const sampleStart = html.indexOf('txtTit');
    if (sampleStart > -1) {
      console.log('Sample HTML:', html.substring(sampleStart - 20, sampleStart + 200));
    }

    const products: ScannedProduct[] = [];
    
    // Split by table rows
    const rows = html.split(/<tr[^>]*>/i);
    console.log('Rows found:', rows.length);
    
    for (const row of rows) {
      // Find product name
      const nomeMatch = row.match(/class="txtTit"[^>]*>([^<]+)</i);
      if (!nomeMatch) continue;
      
      const nome = nomeMatch[1].trim();
      if (!nome) continue;
      
      // Find quantity - look for number after "Qtde.:" 
      const qtdMatch = row.match(/Qtde\.?:?\s*<\/strong>\s*([0-9]+[,.]?[0-9]*)/i);
      // Find unit - look for letters after "UN:"
      const unMatch = row.match(/UN:?\s*<\/strong>\s*([A-Z]+)/i);
      // Find price - look for number after "Vl. Unit.:"
      const precoMatch = row.match(/Vl\.?\s*Unit\.?:?\s*<\/strong>\s*([0-9]+[,.]?[0-9]*)/i);
      
      console.log(`Parsing "${nome}": qtd=${qtdMatch?.[1]}, un=${unMatch?.[1]}, preco=${precoMatch?.[1]}`);
      
      if (qtdMatch && precoMatch) {
        const quantidade = parseFloat(qtdMatch[1].replace(',', '.')) || 1;
        const unidade = unMatch ? unMatch[1].trim() : 'UN';
        const preco = parseFloat(precoMatch[1].replace(',', '.')) || 0;
        
        products.push({ nome, quantidade, preco, unidade });
        console.log('Produto adicionado:', nome);
      }
    }

    console.log('Total produtos:', products.length);

    return new Response(
      JSON.stringify({ success: true, products }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
