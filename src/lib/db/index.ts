import { env } from '$env/dynamic/private';
import * as auth from './auth';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({ url: env.DB_URL, authToken: env.DB_AUTH_TOKEN });

export const db = drizzle(client, { schema: { ...auth } });
