import { NextFunction, Request, Response } from 'express';
import { AccountJWT, UserJWT } from '../jwt/JWT.js';
import db from '../../database/DatabaseGateway.js';
import Logger from '../../util/Logger.js';

enum AuthType {
	Account,
	User
}
enum TokenType {
	Bearer = 'Bearer',
	Session = 'Session'
}

export const authenticateAccount = async (req: Request, res: Response, next: NextFunction) => {
	return authenticate(req, res, next, AuthType.Account);
};

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
	return authenticate(req, res, next, AuthType.User);
};

export const loginAccount = async (req: Request, res: Response) => {
	return login(req, res, AuthType.Account);
};

export const loginUser = async (req: Request, res: Response) => {
	return login(req, res, AuthType.User);
};

export const verifyProject = async (req: Request, res: Response, next: NextFunction) => {
	const { API_KEY } = req.query;
	if (!API_KEY) {
		res.status(401).send({ code: 401, message: 'API key is missing' });
		return;
	}

	const project = await db.project.findByAPIKey(API_KEY as string);
	if (!project) {
		res.status(401).send({ code: 401, message: 'Invalid API key' });
		return;
	}

	req.project = project;
	next();
};

const login = async (req: Request, res: Response, type: AuthType) => {
	const JWT = type === AuthType.Account ? AccountJWT : UserJWT;
	const userId = req.auth.user.id;

	const session = await JWT.signNewSessionToken(userId, type === AuthType.User ? req.project.id : undefined);

	if (!session) {
		return res.status(500).send({ code: 500, message: 'Internal Error' });
	}

	const project_id = type === AuthType.User ? req.project.id : undefined;
	const accessToken = await JWT.signAccessToken(userId, session?.session_id, project_id);

	res.cookie('access_token', accessToken, {
		maxAge: 1000 * 60 * 15 - 10,
		httpOnly: true,
		secure: true,
		path: '/',
		sameSite: 'lax'
	});

	res.cookie('session_token', session.token, {
		maxAge: 1000 * 60 * 60 * 24 * 365 - 1000 * 10, // 1 year minus 10 seconds
		httpOnly: true,
		secure: true,
		path: '/',
		sameSite: 'lax'
	});

	res.setHeader(
		'Authorization',
		`${TokenType.Bearer} ${accessToken}, ${TokenType.Session} ${session.token}`
	);
	res.send();

	saveUserAgent(session.session_id, req, type === AuthType.Account ? 'account' : 'user');
	Logger.logInfo(`New user login`, {
		user_id: userId,
		project_id: project_id,
		datetime: new Date().toISOString(),
	}).catch();
};

const authenticate = async (req: Request, res: Response, next: NextFunction, type: AuthType) => {
	const JWT = type === AuthType.Account ? AccountJWT : UserJWT;
	
	let accessToken = req.cookies.access_token;
	let sessionToken = req.cookies.session_token;

	// If not set in cookies, extract auth tokens from header
	// Bearer <token>, Session <token>
	if (!accessToken || !sessionToken) {
		const tokenList = req.headers.authorization?.split(', ') || [];

		for (const token of tokenList) {
			const [type, value] = token.split(' ');
			if (!accessToken && type === TokenType.Bearer) {
				accessToken = value;
			} else if (!sessionToken && type === TokenType.Session) {
				sessionToken = value;
			}
		}
	}

	// Verify access token
	const verifiedAccess = accessToken ? await JWT.verifyAccessToken(accessToken) : null;
	if (verifiedAccess && verifiedAccess.account.id) {
		req.auth = {
			accessToken,
			sessionToken,
			sessionId: verifiedAccess.session_id,
			user: {
				id: verifiedAccess.account.id,
				name: verifiedAccess.account.name as string,
				email: verifiedAccess.account.email as string
			}
		};
		return next();
	}

	// Verify session token if access was not verified
	const verifiedSession = sessionToken ? await JWT.validateAndRenewSession(sessionToken) : null;
	
	if (
		!verifiedSession ||
		!verifiedSession.token ||
		!verifiedSession.account.id ||
		(type === AuthType.User && !verifiedSession.project_id)
	) {
		return res.status(401).send({ code: 401, message: 'Unauthorized' });
	}

	accessToken = await JWT.signAccessToken(
		verifiedSession.account.id,
		verifiedSession.session_id,
		type === AuthType.User ? verifiedSession.project_id : undefined
	);

	req.auth = {
		accessToken,
		sessionToken: verifiedSession.token,
		sessionId: verifiedSession.session_id,
		user: {
			id: verifiedSession.account.id,
			name: verifiedSession.account.name as string,
			email: verifiedSession.account.email as string
		}
	};

	res.setHeader(
		'Authorization',
		`${TokenType.Bearer} ${accessToken}, ${TokenType.Session} ${verifiedSession.token}`
	);

	res.cookie('access_token', accessToken, {
		maxAge: 1000 * 60 * 15 - 10,
		httpOnly: true,
		secure: true,
		path: '/',
		sameSite: 'strict'
	});

	res.cookie('session_token', verifiedSession.token, {
		maxAge: 1000 * 60 * 60 * 24 * 365 - 1000 * 10,
		httpOnly: true,
		secure: true,
		path: '/',
		sameSite: 'strict'
	});

	return next();
};

function saveUserAgent(session_id: bigint, req: Request, type: 'account' | 'user') {
	// Save client information
	try {
		const ip = (req.headers['x-forwarded-for'] ||
			req.headers['x-forwarded-for'] ||
			req.socket.remoteAddress) as string | undefined;
		let os = req.headers['x-forwarded-os'] as string;
		let browser = req.headers['x-forwarded-browser'] as string;

		if (!os || !browser) {
			const ua = new UAParser(req);
			const results = ua.getResults();
			if (!os) os = results.os as string;
			if (!browser) browser = results.browser as string;
		}

		const data = { ip, os, browser, location: undefined };

		if (type === 'account') db.accountSession.updateUserAgent(session_id, data);
		else db.userSession.updateUserAgent(session_id, data);
	} catch (e) {
		// console.log(e);
	}
}

// UA Parser - TODO: Move to separate file
import { UAParser as UAParserType } from 'ua-parser-js';
type CustomResult = { browser?: string; os?: string };
class UAParser extends UAParserType {
	private headers;

	constructor(req: Request) {
		super(req.headers['user-agent'] || '');
		this.headers = req.headers;
	}

	getResults(): CustomResult {
		const results = this.getResult();
		const browser = this.headers['sec-ch-ua'] as string;
		const platform = this.headers['sec-ch-ua-platform'] as string;

		if (browser) {
			results.browser.name = browser.split(';')[0].replace(/"/g, '');
		}

		if (platform) {
			results.os.name = platform.replace(/"/g, '');
		}

		return {
			browser: results.browser.name || results.ua,
			os: results.os.name
		};
	}
}
