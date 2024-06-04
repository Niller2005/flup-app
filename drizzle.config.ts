import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();

export default {
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	driver: 'turso',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.DB_URL ?? '',
		authToken: process.env.DB_AUTH_TOKEN ?? ''
	}
} satisfies Config;
