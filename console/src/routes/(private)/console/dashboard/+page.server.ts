import type { PageServerLoad } from './$types';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import Zod from '$lib/server/utils/zod/Zod';
import { GET, POST } from '$lib/server/utils/fetch';

export const load: PageServerLoad = async ({ locals }) => {
	const fetchPersonalProjects = async () => {
		const response = await GET('/project', locals.authTokens || {});

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
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const formData = Object.fromEntries(form);

		const parsedData = Zod.project.parse(formData);

		if (parsedData.error) {
			return fail(400, parsedData);
		}

		const response = await POST('/project', locals.authTokens || {}, parsedData);

		if (!response.ok) {
			return fail(response.status, { message: response.statusText });
		}

		const data = await response.json();

		throw redirect(302, `/console/project/${data.data.id}`);
	}
};
