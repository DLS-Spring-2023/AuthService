import { AUTH_TARGET } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (({ params, locals }) => {

    const fetchProject = async () => {
        const response = await fetch(AUTH_TARGET + '/project/' + params.project_id + '/get', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accessToken: locals.authTokens?.accessToken
            })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw error(response.status, { message: data.message });
        }
        
        return data;
    }

    return {
        project: fetchProject()
    };
}) satisfies LayoutServerLoad;