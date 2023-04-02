import { AUTH_TARGET } from '$env/static/private';
import Startup from '$lib/server/startup/Startup';
import { redirect, type Handle } from '@sveltejs/kit';

await Startup.run();

export const handle: Handle = async ({ resolve, event }) => {
	const verifyUser = async () => {
		event.locals.consoleUser = undefined;

		const accessToken = event.cookies.get('account_access_token');
		const sessionToken = event.cookies.get('account_session_token');

		if (!accessToken && !sessionToken) return;

		const response = await event.fetch(AUTH_TARGET + '/account', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ accessToken, sessionToken })
		});

		if (!response.ok) {
			event.cookies.delete('account_session_token');
			event.cookies.delete('account_session_token');
			return;
		}

		const data = await response.json();

		event.locals.consoleUser = {
			id: data.user.id,
			name: data.user.name,
			email: data.user.email
		};

		event.locals.authTokens = {
			accessToken: data.accessToken,
			sessionToken: data.sessionToken
		};

		if (data.didTokensRefresh) {
			event.cookies.set('account_session_token', data.sessionToken, {
				maxAge: 60 * 60 * 24 * 365 - 10,
				httpOnly: true,
				secure: true,
				path: '/',
				sameSite: 'strict'
			});
			event.cookies.set('account_access_token', data.accessToken, {
				maxAge: 60 * 15 - 10,
				httpOnly: true,
				secure: true,
				path: '/',
				sameSite: 'strict'
			});
		}
	};

	await verifyUser();

	// Auth check
	if ((!event.route.id || event.route.id.startsWith('/(private)')) && !event.locals.consoleUser) {
		throw redirect(303, '/');
	}

	return resolve(event);
};
