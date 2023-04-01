import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import Zod from '$lib/server/utils/zod/Zod';
import { AUTH_TARGET } from '$env/static/private';

export const load = (async ({ fetch, params, locals }) => {
	const fetchUsers = async () => {
		const response = await fetch(AUTH_TARGET + `/project/${params.project_id}/users`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				accessToken: locals.authTokens?.accessToken,
				sessionToken: locals.authTokens?.sessiontoken
			})
		});

		if (!response.ok) {
			return fail(500, { error: true, message: 'Failed to fetch users' });
		}

		const data = await response.json();
		return data.data;
	};

	return {
		users: fetchUsers()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	// Create a new user
	default: async ({ request }) => {
		const form = await request.formData();
		const formData = Object.fromEntries(form);

		let parsedData = Zod.userRegistration.parse(formData);

		if (parsedData.error) {
			return fail(400, parsedData);
		}

		const response = await fetch(AUTH_TARGET + `/user/create?API_KEY=${parsedData.api_key}`, {
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
	}
};
