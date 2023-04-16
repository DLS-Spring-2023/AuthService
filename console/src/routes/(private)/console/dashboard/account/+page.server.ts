import Zod from '$lib/server/utils/zod/Zod';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { DELETE, PUT } from '$lib/server/utils/fetch';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	update: async ({ request, locals }) => {
		const form = await request.formData();
		const formData = Object.fromEntries(form);

		const parsedData = Zod.updateAccount.parse(formData);
		if (parsedData.error) {
			return fail(400, parsedData);
		}

		await PUT('/account/update', locals.authTokens || {}, parsedData);
	},

	delete: async ({ locals, cookies }) => {
		const response = await DELETE('/account/delete', locals.authTokens || {});

		if (response.ok) {
			cookies.delete('access_token');
			cookies.delete('session_token');
		}
	}
};
