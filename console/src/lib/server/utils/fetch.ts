import { AUTH_TARGET } from '$env/static/private';

interface AuthTokens {
	accessToken?: string;
	sessionToken?: string;
}

const getAuthHeader = (tokens: AuthTokens) => {
	return [
		tokens?.accessToken ? 'Bearer ' + tokens?.accessToken : '',
		tokens?.sessionToken ? 'Session ' + tokens?.sessionToken : ''
	]
	.filter(value => value ? value : false)
	.reduce((acc, cur) => cur ? acc + ', ' + cur : acc);
};

export const GET = async (path: string, tokens: AuthTokens) => {
	return fetch(AUTH_TARGET + path, {
		method: 'GET',
		headers: {
			Authorization: getAuthHeader(tokens)
		}
	});
};

export const POST = async (path: string, tokens: AuthTokens, body: object) => {
	return fetch(AUTH_TARGET + path, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: getAuthHeader(tokens)
		},
		body: JSON.stringify(body)
	});
};

export const PUT = async (path: string, tokens: AuthTokens, body: object) => {
	return fetch(AUTH_TARGET + path, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: getAuthHeader(tokens)
		},
		body: JSON.stringify(body)
	});
};

export const DELETE = async (path: string, tokens: AuthTokens) => {
	return fetch(AUTH_TARGET + path, {
		method: 'DELETE',
		headers: {
			Authorization: getAuthHeader(tokens)
		}
	});
};
