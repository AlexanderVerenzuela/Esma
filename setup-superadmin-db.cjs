const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-west-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mfkyksoprcqztanszhdt',
  password: 'd1ZOcrDoa9DAxoNa',
});

async function setup() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres...');

    // 1. Enable pgcrypto extension if not exists
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('pgcrypto extension ensured.');

    // 2. Insert demo tenant
    await client.query(`
      INSERT INTO tenants (name, slug) 
      VALUES ('Demo Sportwear', 'demo') 
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('Demo tenant registered.');

    // 3. Create create_tenant_user function
    await client.query(`
      CREATE OR REPLACE FUNCTION create_tenant_user(
        p_email TEXT,
        p_password TEXT,
        p_tenant_id UUID,
        p_role TEXT
      ) RETURNS UUID AS $$
      DECLARE
        v_user_id UUID;
      BEGIN
        -- Insert into auth.users (minimum required columns for email login)
        INSERT INTO auth.users (
          instance_id, id, email, encrypted_password, email_confirmed_at, 
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
        )
        VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          p_email,
          crypt(p_password, gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          '{}'::jsonb,
          now(),
          now(),
          'authenticated',
          'authenticated'
        )
        RETURNING id INTO v_user_id;

        -- Insert into tenant_users association
        INSERT INTO tenant_users (tenant_id, user_id, role)
        VALUES (p_tenant_id, v_user_id, p_role);

        -- Insert identity record so Supabase Auth recognizes it
        INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (
          v_user_id,
          v_user_id,
          json_build_object('sub', v_user_id, 'email', p_email)::jsonb,
          'email',
          now(),
          now(),
          now()
        );

        RETURN v_user_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('Postgres RPC function "create_tenant_user" created successfully!');

  } catch (err) {
    console.error('Setup failed:', err);
  } finally {
    await client.end();
  }
}

setup();
