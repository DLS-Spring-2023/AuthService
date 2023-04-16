import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { DELETE } from '$lib/server/utils/fetch';

export const load: PageServerLoad = async () => {
	throw error(404, { message: 'Not found' });
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();

		const session_id = form.get('session_id');
		const type = form.get('type');

		if (!session_id || typeof session_id !== 'string' || (type !== 'account' && type !== 'user')) {
			return fail(400, { message: 'Invalid request' });
		}

		let path = type === 'account' ? '/session/account/' : '/session/account/user/';
		path += session_id;

		const response = await DELETE(path, locals.authTokens || {});

		if (!response.ok) {
			return fail(400, { message: 'Could not revoke session' });
		}
	}
};
