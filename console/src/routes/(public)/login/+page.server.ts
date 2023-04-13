import { fail, redirect, type Actions } from '@sveltejs/kit';

import Zod from '$lib/server/utils/zod/Zod';
import type { PageServerLoad } from './$types';
import { AUTH_TARGET } from '$env/static/private';
import UAParser from '$lib/server/utils/parsing/UAParser';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.consoleUser) {
		throw redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, getClientAddress, fetch, cookies, platform }) => {
		const form = await request.formData();
		const formData = Object.fromEntries(form);

		const parsedData = Zod.login.parse(formData);

		if (parsedData.error) {
			return fail(400, parsedData);
		}

		const uaParser = new UAParser(request.headers);
		const { browser, os } = uaParser.getResults();
		// console.log(browser, os);
		
		const headers = { 
			'Content-Type': 'application/json',
			'User-Agent': request.headers.get('user-agent') || '',
			'x-forwarded-for': getClientAddress(),
			'x-forwarded-browser': browser || '',
			'x-forwarded-os': os || '',
		};

		console.log(headers);
		

		const response = await fetch(AUTH_TARGET + '/account/login', {
			method: 'POST',
			headers,
			body: JSON.stringify({
				email: parsedData.email,
				password: parsedData.password
			})
		});

		const data = await response.json();

		if (!response.ok) {
			return fail(data.code, { error: true, message: data.message });
		}

		cookies.set('account_access_token', data.accessToken, {
			maxAge: 60 * 15 - 10,
			httpOnly: true,
			secure: true,
			path: '/',
			sameSite: 'strict'
		});
		
		cookies.set('account_session_token', data.sessionToken, {
			maxAge: 60 * 60 * 24 * 365 - 10,
			httpOnly: true,
			secure: true,
			path: '/',
			sameSite: 'strict'
		});

		throw redirect(302, '/');
	}
};
