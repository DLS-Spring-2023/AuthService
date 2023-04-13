import { AUTH_TARGET } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load = (async ({locals, fetch}) => {

    const { authTokens } = locals;
    const fetchSessions = async () => {
        const response = await fetch(AUTH_TARGET + '/session/account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authTokens })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data;
        } else return undefined;
    }

    return {
        sessions: fetchSessions()
    };
}) satisfies PageServerLoad;