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
    
    // Regex para extrair cada produto
    // Estrutura: <span class="txtTit">NOME</span>...<span class="Rqtd"><strong>Qtde.: </strong>QTD</span><span class="RUN"><strong>UN: </strong>UN</span><span class="RvlUnit"><strong>Vl. Unit.: </strong>PRECO</span>
    
    // Encontrar todos os nomes de produtos
    const nomeRegex = /<span class="txtTit">([^<]+)<\/span>/g;
    let nomeMatch;
    const nomes: {nome: string, index: number}[] = [];
    
    while ((nomeMatch = nomeRegex.exec(html)) !== null) {
      // Ignorar spans com classe "txtTit noWrap" (são os totais)
      const before = html.substring(Math.max(0, nomeMatch.index - 30), nomeMatch.index);
      if (!before.includes('noWrap')) {
        nomes.push({ nome: nomeMatch[1].trim(), index: nomeMatch.index });
      }
    }
    
    console.log('Nomes encontrados:', nomes.length);
    
    // Para cada nome, encontrar qtd, un e preco no contexto seguinte
    for (let i = 0; i < nomes.length; i++) {
      const { nome, index } = nomes[i];
      const endIndex = i < nomes.length - 1 ? nomes[i + 1].index : index + 600;
      const context = html.substring(index, endIndex);
      
      // Extrair quantidade: <span class="Rqtd"><strong>Qtde.: </strong>VALUE</span>
      const qtdMatch = context.match(/<span class="Rqtd"><strong>Qtde\.: <\/strong>([^<]+)<\/span>/);
      // Extrair unidade: <span class="RUN"><strong>UN: </strong>VALUE</span>
      const unMatch = context.match(/<span class="RUN"><strong>UN: <\/strong>([^<]+)<\/span>/);
      // Extrair preço: <span class="RvlUnit"><strong>Vl. Unit.: </strong>VALUE</span>
      const precoMatch = context.match(/<span class="RvlUnit"><strong>Vl\. Unit\.: <\/strong>([^<]+)<\/span>/);
      
      if (qtdMatch && precoMatch) {
        const quantidade = parseFloat(qtdMatch[1].replace(',', '.')) || 1;
        const unidade = unMatch ? unMatch[1].trim() : 'UN';
        const preco = parseFloat(precoMatch[1].replace(',', '.')) || 0;
        
        products.push({ nome, quantidade, preco, unidade });
        console.log('OK:', nome, quantidade, unidade, preco);
      } else {
        console.log('FALHA:', nome, 'qtd:', !!qtdMatch, 'preco:', !!precoMatch);
      }
    }

    console.log('Total:', products.length);

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
