import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUSPEND_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Use service role to look up profile
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Look up username in profiles
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id, username, full_name, phone_number, address, role, suspended_until, failed_login_attempts")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check suspension
    if (profile.suspended_until) {
      const suspendedUntil = new Date(profile.suspended_until);
      if (suspendedUntil > new Date()) {
        const minutesLeft = Math.ceil((suspendedUntil.getTime() - Date.now()) / 60000);
        return new Response(
          JSON.stringify({ error: `Account suspended. Try again in ${minutesLeft} minutes.` }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Suspension expired, reset
      await adminClient
        .from("profiles")
        .update({ suspended_until: null, failed_login_attempts: 0 })
        .eq("id", profile.id);
    }

    // Get email from auth.users
    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(profile.id);

    if (authError || !authUser?.user?.email) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sign in with email + password using anon client
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: authUser.user.email,
      password,
    });

    if (signInError) {
      // Increment failed attempts
      const newAttempts = (profile.failed_login_attempts || 0) + 1;
      const updateData: Record<string, unknown> = { failed_login_attempts: newAttempts };

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.suspended_until = new Date(Date.now() + SUSPEND_DURATION_MS).toISOString();
      }

      await adminClient.from("profiles").update(updateData).eq("id", profile.id);

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        return new Response(
          JSON.stringify({ error: "Too many failed attempts. Account suspended for 15 minutes." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success - reset failed attempts
    await adminClient
      .from("profiles")
      .update({ failed_login_attempts: 0, suspended_until: null })
      .eq("id", profile.id);

    return new Response(
      JSON.stringify({
        session: signInData.session,
        user: signInData.user,
        profile: {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          address: profile.address,
          role: profile.role,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
