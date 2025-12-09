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

    const products: ScannedProduct[] = [];
    
    // Split by <tr> to get each product row
    const rows = html.split(/<tr>/i);
    console.log('Found rows:', rows.length);
    
    for (const row of rows) {
      // Skip rows that don't have product info or are header rows
      // Product rows have txtTit without noWrap class
      if (!row.includes('class="txtTit"') || !row.includes('class="Rqtd"')) {
        continue;
      }
      
      // Skip the "Vl. Total" column which also has txtTit but with noWrap
      // We want the first txtTit which is the product name
      
      // Extract product name - first txtTit span (not the noWrap one)
      const nomeMatch = row.match(/<span class="txtTit">([^<]+)<\/span>/);
      if (!nomeMatch) {
        console.log('No name match in row');
        continue;
      }
      
      const nome = nomeMatch[1].trim();
      console.log('Found product:', nome);
      
      // Extract quantity - pattern: <span class="Rqtd"><strong>Qtde.: </strong>VALUE</span>
      const qtdMatch = row.match(/<span class="Rqtd"><strong>Qtde\.: <\/strong>([^<]+)<\/span>/);
      if (!qtdMatch) {
        console.log('No qty match for:', nome);
        continue;
      }
      
      // Extract unit - pattern: <span class="RUN"><strong>UN: </strong>VALUE</span>
      const unMatch = row.match(/<span class="RUN"><strong>UN: <\/strong>([^<]+)<\/span>/);
      
      // Extract price - pattern: <span class="RvlUnit"><strong>Vl. Unit.: </strong>VALUE</span>
      const precoMatch = row.match(/<span class="RvlUnit"><strong>Vl\. Unit\.: <\/strong>([^<]+)<\/span>/);
      if (!precoMatch) {
        console.log('No price match for:', nome);
        continue;
      }
      
      // Parse values - Brazilian format uses comma as decimal separator
      const qtdStr = qtdMatch[1].trim().replace(',', '.');
      const precoStr = precoMatch[1].trim().replace(',', '.');
      
      const quantidade = parseFloat(qtdStr) || 1;
      const preco = parseFloat(precoStr) || 0;
      const unidade = unMatch ? unMatch[1].trim() : 'UN';
      
      console.log(`Parsed: ${nome} | Qty: ${quantidade} | Price: ${preco} | Unit: ${unidade}`);
      
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
