const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-west-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mfkyksoprcqztanszhdt',
  password: 'd1ZOcrDoa9DAxoNa',
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres...');

    // 1. Create tenants table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('Table "tenants" ensured.');

    // 2. Create tenant_users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenant_users (
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'admin',
        PRIMARY KEY (tenant_id, user_id)
      );
    `);
    console.log('Table "tenant_users" ensured.');

    // 3. Insert default tenant if no tenants exist
    let defaultTenantId;
    const tenantRes = await client.query('SELECT id FROM tenants WHERE slug = \'default\'');
    if (tenantRes.rows.length === 0) {
      const insertRes = await client.query(`
        INSERT INTO tenants (name, slug) 
        VALUES ('Cliente Default', 'default') 
        RETURNING id
      `);
      defaultTenantId = insertRes.rows[0].id;
      console.log('Created default tenant with ID:', defaultTenantId);
    } else {
      defaultTenantId = tenantRes.rows[0].id;
      console.log('Using existing default tenant with ID:', defaultTenantId);
    }

    // 4. Update categories table
    await client.query(`
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    `);
    await client.query(`
      UPDATE categories SET tenant_id = $1 WHERE tenant_id IS NULL;
    `, [defaultTenantId]);
    await client.query(`
      ALTER TABLE categories ALTER COLUMN tenant_id SET NOT NULL;
    `);
    await client.query(`
      ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
    `);
    await client.query(`
      ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_tenant_name_key;
    `);
    await client.query(`
      ALTER TABLE categories ADD CONSTRAINT categories_tenant_name_key UNIQUE (tenant_id, name);
    `);
    console.log('Table "categories" updated to multitenant.');

    // 5. Update products table
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    `);
    await client.query(`
      UPDATE products SET tenant_id = $1 WHERE tenant_id IS NULL;
    `, [defaultTenantId]);
    await client.query(`
      ALTER TABLE products ALTER COLUMN tenant_id SET NOT NULL;
    `);
    await client.query(`
      ALTER TABLE products DROP CONSTRAINT IF EXISTS products_code_key;
    `);
    await client.query(`
      ALTER TABLE products DROP CONSTRAINT IF EXISTS products_tenant_code_key;
    `);
    await client.query(`
      ALTER TABLE products ADD CONSTRAINT products_tenant_code_key UNIQUE (tenant_id, code);
    `);
    console.log('Table "products" updated to multitenant.');

    // 6. Update teams table
    await client.query(`
      ALTER TABLE teams ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    `);
    await client.query(`
      UPDATE teams SET tenant_id = $1 WHERE tenant_id IS NULL;
    `, [defaultTenantId]);
    await client.query(`
      ALTER TABLE teams ALTER COLUMN tenant_id SET NOT NULL;
    `);
    console.log('Table "teams" updated to multitenant.');

    // 7. Update site_settings table
    await client.query(`
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    `);
    await client.query(`
      UPDATE site_settings SET tenant_id = $1 WHERE tenant_id IS NULL;
    `, [defaultTenantId]);
    await client.query(`
      ALTER TABLE site_settings ALTER COLUMN tenant_id SET NOT NULL;
    `);
    
    // Changing primary key for site_settings to (tenant_id, id)
    // We need to drop the old primary key constraint (usually site_settings_pkey)
    await client.query(`
      ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
    `);
    await client.query(`
      ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_tenant_id_id_pk;
    `);
    await client.query(`
      ALTER TABLE site_settings ADD CONSTRAINT site_settings_tenant_id_id_pk PRIMARY KEY (tenant_id, id);
    `);
    console.log('Table "site_settings" updated to multitenant.');

    // 8. Update team_lists table
    await client.query(`
      ALTER TABLE team_lists ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    `);
    await client.query(`
      UPDATE team_lists SET tenant_id = $1 WHERE tenant_id IS NULL;
    `, [defaultTenantId]);
    await client.query(`
      ALTER TABLE team_lists ALTER COLUMN tenant_id SET NOT NULL;
    `);
    console.log('Table "team_lists" updated to multitenant.');

    // 9. Row Level Security policies
    console.log('Setting up Row Level Security (RLS) policies...');

    const tables = ['categories', 'products', 'teams', 'site_settings', 'team_lists'];
    for (const table of tables) {
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      
      // Drop existing policies to avoid conflicts
      await client.query(`DROP POLICY IF EXISTS "Public read access" ON ${table};`);
      await client.query(`DROP POLICY IF EXISTS "Admin write access" ON ${table};`);
      await client.query(`DROP POLICY IF EXISTS "Tenant write access" ON ${table};`);
      
      // Public select: allowed for everyone (queries will filter by tenant_id in code)
      await client.query(`
        CREATE POLICY "Public read access" ON ${table} FOR SELECT USING (true);
      `);

      // Tenant write access (INSERT, UPDATE, DELETE): user must be authenticated AND associated with the row's tenant_id in tenant_users
      // Note: for team_lists, anyone (anon) can insert list, but let's see:
      if (table === 'team_lists') {
        // Let's allow public insert for team_lists, but restrict edit/delete to tenant admins
        await client.query(`DROP POLICY IF EXISTS "Public insert team_lists" ON team_lists;`);
        await client.query(`
          CREATE POLICY "Public insert team_lists" ON team_lists FOR INSERT WITH CHECK (true);
        `);
        await client.query(`
          CREATE POLICY "Tenant admin write team_lists" ON team_lists FOR ALL USING (
            EXISTS (
              SELECT 1 FROM tenant_users 
              WHERE tenant_users.tenant_id = team_lists.tenant_id 
              AND tenant_users.user_id = auth.uid()
            )
          );
        `);
      } else {
        await client.query(`
          CREATE POLICY "Tenant write access" ON ${table} FOR ALL USING (
            EXISTS (
              SELECT 1 FROM tenant_users 
              WHERE tenant_users.tenant_id = ${table}.tenant_id 
              AND tenant_users.user_id = auth.uid()
            )
          );
        `);
      }
    }

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
