import Settings from '$lib/server/settings/Settings';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({locals}) => {
    
    if (Settings.REQUIRE_AUTH && !locals.consoleUser) {
        throw redirect(302, '/login');
    } else {
        throw redirect(302, '/console/dashboard');
    }
};