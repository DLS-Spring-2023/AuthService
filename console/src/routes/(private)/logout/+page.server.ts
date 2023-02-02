import { AUTH_TARGET } from "$env/static/private";
import { error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    throw error(404, { message: 'Not Found' });
};

export const actions: Actions = {
    default: async ({fetch, cookies}) => {

        const sessionToken = cookies.get('account_session_token');

        fetch(AUTH_TARGET + '/account/logout', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionToken }),
        });

        cookies.delete('account_access_token', { path: '/' });
        cookies.delete('account_session_token', { path: '/' });
        throw redirect(302, '/');
    }
}