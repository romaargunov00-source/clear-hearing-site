import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "login";
    const body = await req.json();
    const { password, newPassword } = body;

    // SETUP: create initial password if none exists
    if (action === "setup") {
      const { data: existing } = await supabase.from("admin_credentials").select("id").limit(1);
      if (existing && existing.length > 0) {
        return new Response(JSON.stringify({ error: "Пароль уже установлен" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const hash = await hashPassword(password);
      const { error } = await supabase.from("admin_credentials").insert({ password_hash: hash });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LOGIN: verify password
    if (action === "login") {
      const { data: creds, error } = await supabase.from("admin_credentials").select("password_hash").limit(1);
      if (error) throw error;
      if (!creds || creds.length === 0) {
        return new Response(JSON.stringify({ error: "Пароль не установлен. Используйте setup." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const hash = await hashPassword(password);
      if (hash !== creds[0].password_hash) {
        return new Response(JSON.stringify({ error: "Неверный пароль" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CHANGE PASSWORD
    if (action === "change-password") {
      const { data: creds, error } = await supabase.from("admin_credentials").select("id, password_hash").limit(1);
      if (error) throw error;
      if (!creds || creds.length === 0) {
        return new Response(JSON.stringify({ error: "Пароль не установлен" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const currentHash = await hashPassword(password);
      if (currentHash !== creds[0].password_hash) {
        return new Response(JSON.stringify({ error: "Неверный текущий пароль" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const newHash = await hashPassword(newPassword);
      const { error: updateError } = await supabase.from("admin_credentials").update({ password_hash: newHash, updated_at: new Date().toISOString() }).eq("id", creds[0].id);
      if (updateError) throw updateError;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Неизвестное действие" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
