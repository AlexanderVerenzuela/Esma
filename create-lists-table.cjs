const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-west-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mfkyksoprcqztanszhdt',
  password: 'd1ZOcrDoa9DAxoNa',
});

async function createListsTable() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres...');

    // 1. Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_lists (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        client_name TEXT NOT NULL,
        team_name TEXT NOT NULL,
        design_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        players_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('Created team_lists table.');

    // 2. Grant permissions
    await client.query('GRANT ALL ON team_lists TO anon;');
    console.log('Granted anon permissions.');

    // 3. Disable RLS so anon can insert
    await client.query('ALTER TABLE team_lists DISABLE ROW LEVEL SECURITY;');
    console.log('Disabled RLS on team_lists.');

    console.log('Setup complete!');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await client.end();
  }
}

createListsTable();
