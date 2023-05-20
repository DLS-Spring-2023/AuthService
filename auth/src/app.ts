import express from 'express';
import cookies from 'cookie-parser';
import db from './database/DatabaseGateway.js';
import router from './router/router.js';
import { Project } from '@prisma/client';
import Logger from './util/Logger.js';

declare module 'express-serve-static-core' {
	interface Request {
		auth: {
			accessToken: string;
			sessionToken: string;
			sessionId?: bigint;
			user: {
				id: string;
				name: string;
				email: string;
			};
		};
		project: Project;
	}
}

// Initialize Database
await db.init();

const app = express();

app.use((req, _, next) => {
	req.auth = { accessToken: '', sessionToken: '', user: { id: '', name: '', email: '' } };
	next();
});
app.use(express.json());
app.use(cookies());

app.use(router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	Logger.logInfo('Auth server came online', {
		port: PORT,
		datetime: new Date().toISOString(),
	}).catch();
});
