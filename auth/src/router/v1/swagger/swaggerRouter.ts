import { NextFunction, Request, Response, Router } from 'express';
import basicAuth from 'express-basic-auth';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import Log from '../../../util/ServiceBus.js';

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     Authorization:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: 'Bearer token and/or Session token, comma separated WITH space (important). <br>Example: "Bearer \<token\>, Session \<token\>"'
 *   parameters:
 *     API_KEY:
 *       name: API_KEY
 *       in: path
 *       description: Project API key
 *       required: true
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         account_id:
 *           type: string
 *         name:
 *           type: string
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *         keystore:
 *           type: object
 *           properties:
 *             api_key:
 *               type: string
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user_id:
 *           type: string
 *         created_at:
 *           type: string
 *         ip:
 *           type: string
 *         os:
 *           type: string
 *         browser:
 *           type: string
 *         location:
 *           type: string
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *         message:
 *           type: string
 *     LoginUserRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     CreateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         oldPassword:
 *           type: string
 *         newPassword:
 *           type: string
 */

const router = Router();

const swaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'jAuth API',
		version: '1.0.0',
		description: 'Swagger for jAuth API'
	}
};

const options = {
	swaggerDefinition,
	apis: ['./src/router/**/*.ts']
};

const openapiSpecification = swaggerJSDoc(options);

// Basic auth for /v1/docs. If no user or pass are set, auth will be disabled.
const authorizer = (username: string, password: string) => {
	if (!process.env.SWAGGER_USER) return true;

	const userMatches = basicAuth.safeCompare(username, process.env.SWAGGER_USER);
	const passwordMatches = basicAuth.safeCompare(password, process.env.SWAGGER_PASS || '');
	return userMatches && passwordMatches;
};

const docsMiddelware = (req: Request, res: Response, next: NextFunction) => {
	if (!process.env.SWAGGER_USER) {
		next();
	} else {
		basicAuth({ authorizer, challenge: true })(req, res, next);
	}
};

const log = (req: Request, __: Response, next: NextFunction) => {
	Log.logInfo('Swagger docs accessed', {
		datetime: new Date().toISOString(),
		from_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
	});
	next();
}

router.use(docsMiddelware, log, swaggerUi.serve, swaggerUi.setup(openapiSpecification));

export default router;
