import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle({ client, schema });

  console.log('Seeding database...');

  const [tenant] = await db
    .insert(schema.tenants)
    .values({
      name: 'Trianox',
      slug: 'trianox',
    })
    .returning();

  console.log('Created tenant:', tenant!.name);

  console.log('Seed completed.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
