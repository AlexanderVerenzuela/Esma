const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-west-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mfkyksoprcqztanszhdt',
  password: 'd1ZOcrDoa9DAxoNa',
});

async function fixPermissions() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres...');

    // 1. Grant base privileges to the anon role
    await client.query('GRANT ALL ON categories TO anon;');
    await client.query('GRANT ALL ON products TO anon;');
    await client.query('GRANT ALL ON teams TO anon;');
    
    // 2. Grant privileges on sequences (needed for auto-incrementing IDs)
    await client.query('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;');

    // 3. Disable Row-Level Security so anon can read/write freely
    await client.query('ALTER TABLE categories DISABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE products DISABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE teams DISABLE ROW LEVEL SECURITY;');

    console.log('Row-Level Security disabled and permissions granted successfully!');
  } catch (err) {
    console.error('Error fixing permissions:', err);
  } finally {
    await client.end();
  }
}

fixPermissions();
