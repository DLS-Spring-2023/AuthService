import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DELETE, GET, PUT } from '$lib/server/utils/fetch';

export const load: PageServerLoad = (async ({ params, locals }) => {
	const fetchUser = async () => {
		const response = await GET(
			`/project/${params.project_id}/users/${params.user_id}`,
			locals.authTokens || {}
		);

		if (!response.ok) {
			return fail(response.status, { message: response.statusText });
		}

		const data = await response.json();
		return data.data;
	};

	return {
		user: fetchUser()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	updateUser: async ({ params, locals, request }) => {
		const form = await request.formData();

		const name = form.get('name') as string;
		const email = form.get('email') as string;
		const password = form.get('password') as string;
		const enabled = form.get('enabled') as string;
		const verified = form.get('verified') as string;

		if (!name && !email && !password && !enabled && !verified) {
			return fail(400, { message: 'Bad Request' });
		}

		const response = await PUT(
			`/project/${params.project_id}/users/${params.user_id}`,
			locals.authTokens || {},
			{
				user: {
					name,
					email,
					password,
					enabled: enabled ? enabled === 'true' : undefined,
					verified: verified ? verified === 'true' : undefined
				}
			}
		);

		if (!response.ok) {
			try {
				const data = await response.json();
				return fail(400, { message: data.message });
			} catch (e) {
				return fail(500, { message: 'Something went wrong...' });
			}
		}
	},

	deleteUser: async ({ params, locals }) => {
		const response = await DELETE(
			`/project/${params.project_id}/users/${params.user_id}`,
			locals.authTokens || {}
		);

		if (!response.ok) {
			return fail(500, { message: 'Something went wrong...' });
		}

		throw redirect(302, `/console/project/${params.project_id}/auth`);
	}
};
