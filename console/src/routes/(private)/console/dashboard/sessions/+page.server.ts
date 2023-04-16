import { GET } from '$lib/server/utils/fetch';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const { authTokens } = locals;
	const fetchSessions = async () => {
		const response = await GET('/session/account', authTokens || {});

		if (response.ok) {
			const data = await response.json();
			return data.data;
		} else return [];
	};

	return {
		sessions: fetchSessions()
	};
}) satisfies PageServerLoad;
