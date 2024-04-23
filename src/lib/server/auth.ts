import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { db } from '$lib/db';
import { sessions, users } from '$lib/db/auth';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Twitch } from 'arctic';
import { Lucia } from 'lucia';

export const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			twitchId: attributes.twitch_id,
			username: attributes.username
		};
	}
});

export const twitch = new Twitch(
	env.TWITCH_CLIENT_ID,
	env.TWITCH_CLIENT_SECRET,
	env.TWITCH_REDIRECT_URI
);

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			twitch_id: number;
			username: string;
		};
	}
}
