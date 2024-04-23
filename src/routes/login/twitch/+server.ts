import { dev } from '$app/environment';
import { twitch } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';
import { generateState } from 'arctic';
import { serializeCookie } from 'oslo/cookie';

export const GET: RequestHandler = async ({ params }) => {
	const state = generateState();

	const url = await twitch.createAuthorizationURL(state);

	const provider = params.provider ?? 'twitch';

	return new Response(null, {
		status: 302,
		headers: {
			location: url.toString(),
			'Set-Cookie': serializeCookie(`twitch_oauth_state`, state, {
				httpOnly: true,
				secure: !dev,
				maxAge: 60 * 10,
				path: '/'
			})
		}
	});
};
