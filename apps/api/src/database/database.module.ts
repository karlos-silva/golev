import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../drizzle/schema';

export const DATABASE = 'DATABASE';

export type Database = ReturnType<typeof drizzle<typeof schema>>;

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () => {
        const client = postgres(process.env.DATABASE_URL!);
        return drizzle({ client, schema });
      },
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
