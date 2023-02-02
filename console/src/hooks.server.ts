import { AUTH_TARGET } from "$env/static/private";
import Settings from "$lib/server/settings/Settings";
import Startup from "$lib/server/startup/Startup";
import { error, fail, type Handle } from "@sveltejs/kit";

await Startup.run()

export const handle: Handle = async ({resolve, event}) => {
    
    const verifyUser = async () => {
        if (!Settings.REQUIRE_AUTH) {
            event.locals.consoleUser = { id: 'noauth', authenticated: true, name: 'Anonymous' };
        }

        event.locals.consoleUser = undefined;

        const accessToken = event.cookies.get('account_access_token');
        const sessionToken = event.cookies.get('account_session_token');

        if (!accessToken && !sessionToken) return;

        const response = await event.fetch(AUTH_TARGET + '/account', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, sessionToken }),
        });
        
        if (!response.ok) {
            event.cookies.delete('account_session_token', { path: '/' });
            event.cookies.delete('account_session_token', { path: '/' });
            return;
        }

        const data = await response.json();
       
        event.locals.consoleUser = { 
            id: data.user.id, 
            name: data.user.name, 
            email: data.user.email, 
            personalOrgId: data.user.personalOrgId,
            authenticated: true, 
            accessToken: data.accessToken,
            sessionToken: data.sessionToken,
        };
        
        if (data.didTokensRefresh) {
            event.cookies.set('account_access_token', data.accessToken, { 
                maxAge: 60 * 15 - 10,
                httpOnly: true,
                secure: false, // TODO
                path: '/',
                sameSite: 'strict' 
            });
    
            event.cookies.set('account_session_token', data.sessionToken, {
                maxAge: 60 * 60 * 25 * 365 - 10,
                httpOnly: true,
                secure: false, // TODO
                path: '/',
                sameSite: 'strict'
            });
        }
    }

    await verifyUser();
    
    // Auth check
    if ((!event.route.id || event.route.id.startsWith('/(private)')) && !event.locals.consoleUser?.authenticated) {
        throw error(401, { message: "Unauthorized" });
    }
    
    return resolve(event);
}