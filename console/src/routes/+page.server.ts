import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.consoleUser) {
		throw redirect(302, '/login');
	} else {
		throw redirect(302, '/console/dashboard');
	}
};
