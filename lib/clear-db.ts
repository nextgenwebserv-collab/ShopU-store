//run this to remove everything from the database
//can be removed later during deployment

import { prisma } from '@/lib/client';

async function clearDB() {
  console.log('🧨 Dropping all tables in public schema...');
  await prisma.$executeRawUnsafe(`
    DO
    $$
    DECLARE
        tabname TEXT;
    BEGIN
        FOR tabname IN
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
        LOOP
            EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(tabname) || ' CASCADE';
        END LOOP;
    END
    $$;
  `);
  console.log('✅ All tables dropped.');
  await prisma.$disconnect();
}

clearDB().catch(e => {
  console.error('❌ Error clearing database:', e);
  process.exit(1);
});
