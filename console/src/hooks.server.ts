import { AUTH_TARGET } from '$env/static/private';
import Startup from '$lib/server/startup/Startup';
import { redirect, type Handle } from '@sveltejs/kit';

await Startup.run();

export const handle: Handle = async ({ resolve, event }) => {
	const verifyUser = async () => {
		event.locals.consoleUser = undefined;

		const accessToken = event.cookies.get('access_token');
		const sessionToken = event.cookies.get('session_token');

		if (!accessToken && !sessionToken) return;

		const response = await event.fetch(AUTH_TARGET + '/account', {
			headers: { Authorization: 'Bearer ' + accessToken + ', Session ' + sessionToken }
		});

		if (!response.ok) {
			event.cookies.delete('session_token');
			event.cookies.delete('session_token');
			return;
		}

		const { data: user } = await response.json();

		event.locals.consoleUser = {
			id: user.id,
			name: user.name,
			email: user.email
		};

		const authHeader = response.headers.get('Authorization');
		const newTokens = authHeader?.split(', ') || [];

		event.locals.authTokens = {
			accessToken: newTokens[0] || accessToken,
			sessionToken: newTokens[1] || sessionToken
		};

		if (newTokens.length < 2) return;

		event.cookies.set('access_token', newTokens[0].split(' ')[1], {
			maxAge: 60 * 15 - 10,
			httpOnly: true,
			secure: true,
			path: '/',
			sameSite: 'strict'
		});

		event.cookies.set('session_token', newTokens[1].split(' ')[1], {
			maxAge: 60 * 60 * 24 * 365 - 10,
			httpOnly: true,
			secure: true,
			path: '/',
			sameSite: 'strict'
		});
	};

	await verifyUser();

	// Auth check
	if ((!event.route.id || event.route.id.startsWith('/(private)')) && !event.locals.consoleUser) {
		throw redirect(303, '/');
	}

	return resolve(event);
};
