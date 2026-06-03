import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as argon2 from 'argon2';
import * as schema from './schema';

config({ path: '../../.env' });

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle({ client, schema });

  console.log('Seeding database...');

  const passwordHash = await argon2.hash('changeme123');

  const [user] = await db
    .insert(schema.users)
    .values({
      email: 'demo@golev.com.br',
      name: 'Demo Go Lev',
      passwordHash,
      role: 'member',
    })
    .onConflictDoNothing()
    .returning();

  console.log('Created user:', user?.email ?? 'already existed');

  console.log('Seed completed.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
