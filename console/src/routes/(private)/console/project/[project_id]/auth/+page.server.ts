import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import Zod from '$lib/server/utils/zod/Zod';
import { AUTH_TARGET } from '$env/static/private';
import { GET } from '$lib/server/utils/fetch';

export const load = (async ({ params, locals }) => {
	const fetchUsers = async () => {
		const response = await GET(`/project/${params.project_id}/users`, locals.authTokens || {});

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

		const parsedData = Zod.userRegistration.parse(formData);

		if (parsedData.error) {
			return fail(400, parsedData);
		}

		const response = await fetch(AUTH_TARGET + `/user?API_KEY=${parsedData.api_key}`, {
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
