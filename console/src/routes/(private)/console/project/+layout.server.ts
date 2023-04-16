import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { GET } from '$lib/server/utils/fetch';

export const load = (({ params, locals }) => {
	const fetchProject = async () => {
		const response = await GET(`/project/${params.project_id}`, locals.authTokens || {});

		const data = await response.json();

		if (!response.ok) {
			throw error(response.status, { message: data.message });
		}

		return data.data;
	};

	return {
		project: fetchProject()
	};
}) satisfies LayoutServerLoad;
