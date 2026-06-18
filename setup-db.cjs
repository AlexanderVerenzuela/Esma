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
    console.log('Connected to Supabase Postgres!');

    // Create Categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
    `);
    console.log('Categories table created.');

    // Insert defaults if empty
    const { rows } = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO categories (name) VALUES 
        ('CLUBES'), ('SELECCIONES'), ('RETRO'), ('EDICIÓN ESPECIAL');
      `);
      console.log('Default categories inserted.');
    }

    // Create Products
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        description TEXT,
        main_image TEXT NOT NULL,
        gallery JSONB DEFAULT '[]'::jsonb,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Products table created.');

    // Create Teams
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        year TEXT NOT NULL,
        name TEXT NOT NULL,
        image TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Teams table created.');

    console.log('Database setup complete!');
  } catch (err) {
    console.error('Error setting up DB:', err);
  } finally {
    await client.end();
  }
}

setup();
