import { AUTH_TARGET } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load = (async ({locals, params}) => {

    const { authTokens } = locals;
    const fetchSessions = async () => {
        const response = await fetch(AUTH_TARGET + `/session/account/user/${params.user_id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                accessToken: authTokens?.accessToken,
                sessionToken: authTokens?.sessionToken
             })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else return [];
    }

    return {
        sessions: fetchSessions()
    };
}) satisfies PageServerLoad;