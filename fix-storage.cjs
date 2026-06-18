const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-west-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mfkyksoprcqztanszhdt',
  password: 'd1ZOcrDoa9DAxoNa',
});

async function fixStorage() {
  try {
    await client.connect();
    
    // We try to create a policy to allow anyone to upload/read/delete from the 'images' bucket.
    // We ignore errors if the policy already exists.
    await client.query(`
      DROP POLICY IF EXISTS "Public Access" ON storage.objects;
      CREATE POLICY "Public Access"
      ON storage.objects FOR ALL
      TO public
      USING ( bucket_id = 'images' )
      WITH CHECK ( bucket_id = 'images' );
    `);
    
    console.log('Storage policies updated!');
  } catch (err) {
    console.error('Error fixing storage permissions:', err);
  } finally {
    await client.end();
  }
}

fixStorage();
