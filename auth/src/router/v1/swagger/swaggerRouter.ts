import { Router } from 'express';
import basicAuth from 'express-basic-auth';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     AccountAccessToken:
 *       type: apiKey
 *       in: header
 *       name: x-account-access-token
 *     AccountSessionToken:
 *       type: apiKey 
 *       in: header
 *       name: x-account-session-token
 *     AccessToken:
 *       type: apiKey
 *       in: header
 *       name: x-access-token
 *     SessionToken:
 *       type: apiKey 
 *       in: header
 *       name: x-session-token
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
 *     LoginAccountRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     CreateAccountRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     UpdateAccountRequest:
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
 *     LoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         sessionToken:
 *           type: string 
 */

const router = Router(); 

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'jAuth API',
        version: '1.0.0',
        description: 'Swagger for jAuth API',
    },
};

const options = {
    swaggerDefinition,
    apis: ['./src/router/**/*.ts'],
};

const openapiSpecification = swaggerJSDoc(options);

// Basic auth for /v1/docs. If no user or pass are set, auth will be disabled.
const authorizer = (username: string, password: string) => {
    if (!process.env.SWAGGER_USER) return true;
    
    const userMatches = basicAuth.safeCompare(username, process.env.SWAGGER_USER);
    const passwordMatches = basicAuth.safeCompare(password, process.env.SWAGGER_PASS || '');
    return userMatches && passwordMatches;
}

const docsMiddelware = (req: any, res: any, next: any) => {
    
    if (!process.env.SWAGGER_USER) {
        next();
    } else {
        basicAuth({ authorizer, challenge: true })(req, res, next);
    }
}

router.use(
    docsMiddelware,
    swaggerUi.serve, swaggerUi.setup(openapiSpecification)
);

export default router;