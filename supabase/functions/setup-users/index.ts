import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserSetup {
  email: string
  password: string
  name: string
  role: 'admin' | 'reception' | 'cso'
}

const defaultUsers: UserSetup[] = [
  {
    email: 'admin@company.com',
    password: 'Admin123',
    name: 'Administrator',
    role: 'admin'
  },
  {
    email: 'reception@company.com',
    password: 'reception123',
    name: 'Reception',
    role: 'reception'
  },
  {
    email: 'cso@company.com',
    password: 'cso123',
    name: 'Chief Security Officer',
    role: 'cso'
  }
]

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const results = []

    for (const user of defaultUsers) {
      console.log(`Setting up user: ${user.email}`)
      
      // Try to create the user
      const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name
        }
      })

      if (signUpError) {
        // Check if user already exists
        if (signUpError.message.includes('already registered')) {
          console.log(`User ${user.email} already exists, fetching...`)
          
          const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
          if (listError) {
            results.push({ email: user.email, success: false, error: listError.message })
            continue
          }
          
          const existingUser = users.find(u => u.email === user.email)
          if (!existingUser) {
            results.push({ email: user.email, success: false, error: 'User exists but could not be found' })
            continue
          }

          // Ensure user record exists
          const { error: upsertError } = await supabaseAdmin
            .from('users')
            .upsert({
              id: existingUser.id,
              email: user.email,
              name: user.name,
              active: true
            }, { onConflict: 'id' })

          if (upsertError) {
            console.error(`Error upserting user record:`, upsertError)
          }

          // Ensure role exists
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .upsert({
              user_id: existingUser.id,
              role: user.role
            }, { onConflict: 'user_id,role' })

          if (roleError) {
            results.push({ email: user.email, success: false, error: roleError.message })
          } else {
            results.push({ email: user.email, success: true, message: 'User already exists, role ensured' })
          }
          continue
        }
        
        results.push({ email: user.email, success: false, error: signUpError.message })
        continue
      }

      if (!authData.user) {
        results.push({ email: user.email, success: false, error: 'No user data returned' })
        continue
      }

      console.log(`User created: ${authData.user.id}`)

      // The trigger should create the users table entry, but let's ensure it
      const { error: upsertError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: authData.user.id,
          email: user.email,
          name: user.name,
          active: true
        }, { onConflict: 'id' })

      if (upsertError) {
        console.error(`Error upserting user record:`, upsertError)
      }

      // Insert role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: user.role
        })

      if (roleError) {
        // If role already exists, update it
        if (roleError.code === '23505') {
          await supabaseAdmin
            .from('user_roles')
            .update({ role: user.role })
            .eq('user_id', authData.user.id)
          
          results.push({ email: user.email, success: true, message: 'Created with existing role updated' })
        } else {
          results.push({ email: user.email, success: false, error: roleError.message })
        }
      } else {
        results.push({ email: user.email, success: true, message: 'Created successfully' })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: 'User setup completed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in setup-users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})