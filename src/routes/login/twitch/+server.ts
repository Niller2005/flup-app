import { dev } from '$app/environment';
import { twitch } from '$lib/server/auth';
import { type RequestHandler, redirect } from '@sveltejs/kit';
import { generateState } from 'arctic';

export const GET: RequestHandler = async ({ cookies }) => {
	const state = generateState();
	const url = await twitch.createAuthorizationURL(state, {
		scopes: ['user:read:email']
	});

	cookies.set(`twitch_oauth_state`, state, {
		path: '/',
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	redirect(302, url.toString());
};
