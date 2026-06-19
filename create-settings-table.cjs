const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-west-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mfkyksoprcqztanszhdt',
  password: 'd1ZOcrDoa9DAxoNa',
});

async function createSettingsTable() {

  try {
    await client.connect();

    console.log('Creating site_settings table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `);

    // Enable RLS
    await client.query(`ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;`);

    // Create Policies
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Public read access" ON site_settings FOR SELECT USING (true);
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Admin write access" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // We can't easily create a bucket via SQL because storage is an external schema in Supabase.
    // We will assume 'products' bucket is reused, or we'll create the bucket from the UI/JS SDK.

    console.log('Table site_settings created successfully!');

    // Insert some defaults so the site doesn't crash before being edited
    const defaults = [
      { id: 'hero_title', content: 'UNIFORMES QUE <br/><span class="text-primary italic">VISTEN</span> TU PASIÓN.' },
      { id: 'hero_subtitle', content: 'Diseños únicos, calidad premium y entrega rápida para tu equipo.' },
      { id: 'hero_btn', content: 'COTIZAR POR WHATSAPP' },
      { id: 'steps_title', content: 'CÓMO FUNCIONA' },
      { id: 'catalog_title', content: 'NUESTROS DISEÑOS' },
      { id: 'catalog_subtitle', content: 'Cada modelo se personaliza con nombre, número y escudo a elección.' }
    ];

    for (const d of defaults) {
      await client.query(`
        INSERT INTO site_settings (id, content) 
        VALUES ($1, $2)
        ON CONFLICT (id) DO NOTHING;
      `, [d.id, d.content]);
    }
    
    console.log('Defaults inserted.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

createSettingsTable();
