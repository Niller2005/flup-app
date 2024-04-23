import { db } from '$lib/db';
import { users } from '$lib/db/auth';
import { lucia, twitch } from '$lib/server/auth';
import { createId } from '@paralleldrive/cuid2';
import type { RequestHandler } from '@sveltejs/kit';
import { OAuth2RequestError } from 'arctic';
import { eq, sql } from 'drizzle-orm';
import { generateId } from 'lucia';
import { parseCookies } from 'oslo/cookie';

export const GET: RequestHandler = async ({ url, request }) => {
	const cookies = parseCookies(request.headers.get('Cookie') ?? '');
	const stateCookie = cookies.get('twitch_oauth_state') ?? null;

	const state = url.searchParams.get('state');
	const code = url.searchParams.get('code');

	if (!state || !stateCookie || !code || stateCookie !== state) {
		return new Response(null, { status: 400 });
	}

	try {
		const tokens = await twitch.validateAuthorizationCode(code);
		const twitchUserResponse = await fetch('https://api.twitch.tv/helix/users', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const twitchUserResult: TwitchUserResult = await twitchUserResponse.json();

		const existingUser = await db.query.users.findFirst({
			where: eq(users.twitchId, +twitchUserResult.id)
		});

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			return new Response(null, {
				status: 302,
				headers: {
					location: '/',
					'Set-Cookie': sessionCookie.toString()
				}
			});
		}

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

		return new Response(null, {
			status: 302,
			headers: {
				location: '/',
				'Set-Cookie': sessionCookie.toString()
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
}
