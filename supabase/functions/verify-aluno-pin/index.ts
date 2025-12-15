import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, pin } = await req.json();

    if (!email || !pin) {
      return new Response(JSON.stringify({ error: "Missing email or pin" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPin = String(pin).trim();

    const { data: aluno, error } = await supabaseAdmin
      .from("alunos")
      .select("id, nome, email, pin, situacao")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch aluno" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!aluno) {
      return new Response(JSON.stringify({ error: "NOT_FOUND" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if ((aluno.pin ?? "") !== normalizedPin) {
      return new Response(JSON.stringify({ error: "INVALID_PIN" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          email: aluno.email,
          situacao: aluno.situacao,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
