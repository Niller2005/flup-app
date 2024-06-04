import { env } from '$env/dynamic/private';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { lucia, twitch } from '$lib/server/auth';
import { createId } from '@paralleldrive/cuid2';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { OAuth2RequestError } from 'arctic';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, request, cookies }) => {
	const state = url.searchParams.get('state');
	const code = url.searchParams.get('code');
	const storedState = cookies.get('twitch_oauth_state') ?? null;

	if (!state || !storedState || !code || storedState !== state) {
		return new Response(null, { status: 400 });
	}

	try {
		const tokens = await twitch.validateAuthorizationCode(code);
		console.log(tokens);

		const twitchUserResponse = await fetch('https://api.twitch.tv/helix/users', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
				'Client-Id': env.TWITCH_CLIENT_ID
			}
		});

		const twitchUserResult = ((await twitchUserResponse.json()) as TwitchUserResult).data[0];
		console.log(twitchUserResult);

		const existingUser = await db.select().from(users).get();

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} else {
			const userId = createId();
			await db.insert(users).values({
				id: userId,
				twitchId: +twitchUserResult.id,
				username: twitchUserResult.login,
				displayName: twitchUserResult.display_name,
				profileImageUrl: twitchUserResult.profile_image_url
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}

		return new Response(null, {
			status: 302,
			headers: {
				location: '/'
			}
		});
	} catch (e) {
		console.error(e);
		if (e instanceof OAuth2RequestError) {
			return new Response(null, { status: 400 });
		}
		return new Response(null, { status: 500 });
	}
};

interface TwitchUserResult {
	data: {
		id: string;
		login: string;
		display_name: string;
		type: string;
		broadcaster_type: string;
		description: string;
		profile_image_url: string;
		offline_image_url: string;
		view_count: number;
		email: string;
		created_at: Date;
	}[];
}
