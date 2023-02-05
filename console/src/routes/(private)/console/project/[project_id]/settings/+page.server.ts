import { AUTH_TARGET } from "$env/static/private";
import { fail, redirect, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
    updateName: async ({request, fetch, locals}) => {
        const form = await request.formData();

        const name = form.get('name');
        const project_id = form.get('project_id');

        if (!name || typeof name !== "string") {
            return fail(400, { message: "Bad Input" });
        }
        if (name.length < 2) {
            return fail(400, { message: "Name must be longer than 2 characters" });
        }
        if (name.length > 64) {
            return fail(400, { message: "Name cannot be longer than 64 characters" });
        }

        const response = await fetch(AUTH_TARGET + `/project/${project_id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accessToken: locals.authTokens?.accessToken,
                project: {
                    name: name
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return fail(response.status, { message: data.message });
        }
    },

    delete: async ({ request, fetch, locals }) => {
        const form = await request.formData();

        const project_id = form.get('project_id');

        if (!project_id || typeof project_id !== "string") {
            return fail(400, { message: "Bad Input" });
        }

        const response = await fetch(AUTH_TARGET + `/project/${project_id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accessToken: locals.authTokens?.accessToken
            })
        });

        if (!response.ok) {
            return fail(response.status, { message: response.statusText });
        }

        throw redirect(302, '/console/dashboard');
    }
};