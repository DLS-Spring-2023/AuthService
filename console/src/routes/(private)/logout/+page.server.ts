import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { POST } from '$lib/server/utils/fetch';

export const load: PageServerLoad = async () => {
	throw error(404, { message: 'Not Found' });
};

export const actions: Actions = {
	default: async ({ cookies, locals }) => {
		POST('/account/logout', locals.authTokens || {}, {});
		cookies.delete('account_access_token', { path: '/' });
		cookies.delete('account_session_token', { path: '/' });
		throw redirect(302, '/');
	}
};
