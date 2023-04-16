import { AUTH_TARGET } from '$env/static/private';

interface AuthTokens {
	accessToken?: string;
	sessionToken?: string;
}
export const GET = async (path: string, tokens: AuthTokens) => {
	return fetch(AUTH_TARGET + path, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${tokens?.accessToken}, Session ${tokens?.sessionToken}`
		}
	});
};

export const POST = async (path: string, tokens: AuthTokens, body: object) => {
	return fetch(AUTH_TARGET + path, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${tokens?.accessToken}, Session ${tokens?.sessionToken}`
		},
		body: JSON.stringify(body)
	});
};

export const PUT = async (path: string, tokens: AuthTokens, body: object) => {
	return fetch(AUTH_TARGET + path, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${tokens?.accessToken}, Session ${tokens?.sessionToken}`
		},
		body: JSON.stringify(body)
	});
};

export const DELETE = async (path: string, tokens: AuthTokens) => {
	return fetch(AUTH_TARGET + path, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${tokens?.accessToken}, Session ${tokens?.sessionToken}`
		}
	});
};
