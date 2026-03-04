import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { pool, db } from '../src/lib/db/index';

async function main() {
  console.log('⏳ Running migrations...');
  try {
    await migrate(db, {
      migrationsFolder: 'drizzle',
    });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
