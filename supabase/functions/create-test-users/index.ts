import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const results: any[] = [];

    // Create Admin user using signUp
    const { data: adminAuth, error: adminAuthError } = await supabase.auth.signUp({
      email: 'admin@test.com',
      password: 'Admin123!',
      options: {
        data: { name: 'Admin' }
      }
    });

    if (adminAuthError) {
      results.push({ user: 'Admin', error: adminAuthError.message });
    } else if (adminAuth?.user) {
      // Create profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: adminAuth.user.id,
        email: 'admin@test.com',
        name: 'Admin'
      }, { onConflict: 'user_id' });

      // Set admin role
      const { error: roleError } = await supabase.from('user_roles').upsert({
        user_id: adminAuth.user.id,
        role: 'admin'
      }, { onConflict: 'user_id' });

      results.push({ 
        user: 'Admin', 
        email: 'admin@test.com',
        password: 'Admin123!',
        status: 'created', 
        id: adminAuth.user.id,
        profileError: profileError?.message,
        roleError: roleError?.message
      });
    }

    // Create regular User using signUp
    const { data: userAuth, error: userAuthError } = await supabase.auth.signUp({
      email: 'user@test.com',
      password: 'User123!',
      options: {
        data: { name: 'User' }
      }
    });

    if (userAuthError) {
      results.push({ user: 'User', error: userAuthError.message });
    } else if (userAuth?.user) {
      // Create profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: userAuth.user.id,
        email: 'user@test.com',
        name: 'User'
      }, { onConflict: 'user_id' });

      // Set user role
      const { error: roleError } = await supabase.from('user_roles').upsert({
        user_id: userAuth.user.id,
        role: 'user'
      }, { onConflict: 'user_id' });

      results.push({ 
        user: 'User', 
        email: 'user@test.com',
        password: 'User123!',
        status: 'created', 
        id: userAuth.user.id,
        profileError: profileError?.message,
        roleError: roleError?.message
      });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
