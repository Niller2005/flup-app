import { lucia } from '$lib/server/auth';
import type { PageServerLoad } from './$types';
import { redirect, type Actions, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	return { username: locals.user.username };
};

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		if (!locals.session) return fail(401);
		await lucia.invalidateSession(locals.session.id);

		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		redirect(302, '/login');
	}
};
