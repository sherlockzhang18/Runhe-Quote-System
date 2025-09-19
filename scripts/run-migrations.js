const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    console.log('🗄️ Running database migrations...');
    
    // Read and execute the migration SQL file
    const migrationPath = path.join(__dirname, '../drizzle/migrations/0000_normal_the_stranger.sql');
    
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(sql);
      console.log('✅ Database tables created successfully');
    } else {
      console.log('⚠️ Migration file not found, tables might already exist');
    }

    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Database tables:', tablesResult.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigrations();