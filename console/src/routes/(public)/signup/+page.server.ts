import { AUTH_TARGET } from '$env/static/private';
import Settings from '$lib/server/settings/Settings';
import Zod from '$lib/server/utils/zod/Zod';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.consoleUser) {
		throw redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, fetch, cookies }) => {
		const form = await request.formData();
		const formData = Object.fromEntries(form);

		let parsedData = Zod.registration.parse(formData);

		if (parsedData.error) {
			return fail(400, parsedData);
		}

		const response = await fetch(AUTH_TARGET + '/account/create', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: parsedData.name,
				email: parsedData.email,
				password: parsedData.password
			})
		});

		const data = await response.json();

		if (!response.ok) {
			return fail(data.code, { error: true, message: data.message });
		}

		cookies.set('account_access_token', data.accessToken, {
			maxAge: 60 * 15 - 10,
			httpOnly: true,
			secure: false, // TODO
			path: '/',
			sameSite: 'strict'
		});

		cookies.set('account_session_token', data.sessionToken, {
			maxAge: 60 * 60 * 24 * 365 - 10,
			httpOnly: true,
			secure: false, // TODO
			path: '/',
			sameSite: 'strict'
		});

		throw redirect(302, '/');
	}
};
