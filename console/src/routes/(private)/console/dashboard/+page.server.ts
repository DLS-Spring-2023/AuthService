import type { PageServerLoad } from './$types';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { AUTH_TARGET } from '$env/static/private';
import Zod from '$lib/server/utils/zod/Zod';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const fetchPersonalProjects = async () => {
		const response = await fetch(AUTH_TARGET + '/project', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				accessToken: locals.authTokens?.accessToken
			})
		});

		if (!response.ok) {
			throw error(500, { message: 'Internal Error' });
		}

		const data = await response.json();
		return data.data;
	};

	return {
		projects: fetchPersonalProjects()
	};
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await request.formData();
		const formData = Object.fromEntries(form);

		let parsedData = Zod.project.parse(formData);

		if (parsedData.error) {
			return fail(400, parsedData);
		}

		const response = await fetch(AUTH_TARGET + '/project/create', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(parsedData)
		});

		if (!response.ok) {
			return fail(response.status, { message: response.statusText });
		}

		const data = await response.json();

		throw redirect(302, `/console/project/${data.data.id}`);
	}
};
