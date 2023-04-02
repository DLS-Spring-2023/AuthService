import { AUTH_TARGET } from '$env/static/private';
import Zod from '$lib/server/utils/zod/Zod';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	update: async ({ request, fetch, locals }) => {
		const form = await request.formData();
		const formData = Object.fromEntries(form);

		const parsedData = Zod.updateAccount.parse(formData);
		if (parsedData.error) {
			return fail(400, parsedData);
		}

		await fetch(AUTH_TARGET + '/account/update', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				accessToken: locals.authTokens?.accessToken,
				...parsedData
			})
		});
	},

	delete: async ({ fetch, locals, cookies }) => {
		const response = await fetch(AUTH_TARGET + '/account', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				accessToken: locals.authTokens?.accessToken
			})
		});

		if (response.ok) {
			cookies.delete('account_access_token');
			cookies.delete('account_session_token');
		}
	}
};
