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

    console.log('Buscando:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `HTTP ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    console.log('HTML recebido:', html.length, 'bytes');

    const products: ScannedProduct[] = [];
    
    // Dividir por linhas da tabela <tr>
    const rows = html.split(/<tr>/i);
    console.log('Linhas encontradas:', rows.length);
    
    for (const row of rows) {
      // Pular se não tem produto (verificar se tem txtTit sem noWrap)
      if (!row.includes('class="txtTit"') || row.includes('txtTit noWrap')) {
        continue;
      }
      
      // Extrair nome - padrão: <span class="txtTit">NOME</span>
      const nomeMatch = row.match(/<span class="txtTit">([^<]+)<\/span>/);
      if (!nomeMatch) continue;
      
      const nome = nomeMatch[1].trim();
      
      // Extrair quantidade - padrão: <span class="Rqtd"><strong>Qtde.: </strong>VALOR</span>
      const qtdMatch = row.match(/<span class="Rqtd"><strong>Qtde\.: <\/strong>([^<]+)<\/span>/);
      
      // Extrair unidade - padrão: <span class="RUN"><strong>UN: </strong>VALOR</span>
      const unMatch = row.match(/<span class="RUN"><strong>UN: <\/strong>([^<]+)<\/span>/);
      
      // Extrair preço - padrão: <span class="RvlUnit"><strong>Vl. Unit.: </strong>VALOR</span>
      const precoMatch = row.match(/<span class="RvlUnit"><strong>Vl\. Unit\.: <\/strong>([^<]+)<\/span>/);
      
      if (qtdMatch && precoMatch) {
        // Converter valores brasileiros (vírgula para ponto)
        const qtdStr = qtdMatch[1].trim().replace(',', '.');
        const precoStr = precoMatch[1].trim().replace(',', '.');
        
        const quantidade = parseFloat(qtdStr) || 1;
        const preco = parseFloat(precoStr) || 0;
        const unidade = unMatch ? unMatch[1].trim() : 'UN';
        
        products.push({ nome, quantidade, preco, unidade });
        console.log('Produto:', nome, '| Qtd:', quantidade, '| Preço:', preco, '| UN:', unidade);
      }
    }

    console.log('Total produtos:', products.length);

    return new Response(
      JSON.stringify({ success: true, products }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
