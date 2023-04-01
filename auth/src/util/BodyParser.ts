import { ZodError } from 'zod';
import ParserSchemas from './ParserSchemas.js';

class BodyParser extends ParserSchemas {
	parseUpdateAccount(data: {
		name: string;
		email: string;
		oldPassword: string;
		newPassword: string;
	}) {
		try {
			return { ...this.updateAccount.parse(data), error: undefined };
		} catch (err: unknown) {
			const log: { [key: string]: boolean | { message: string } } = { error: true };
			for (const error of (err as ZodError).errors) {
				log[error.path[0]] = { message: error.message };
			}
			return log;
		}
	}

	parseCreateUser(data: { name: string; email: string; password: string }) {
		try {
			return { ...this.createUser.parse(data), error: undefined };
		} catch (err: unknown) {
			const log: { [key: string]: boolean | string } = { error: true };
			for (const error of (err as ZodError).errors) {
				log[error.path[0]] = error.message;
			}
			return log;
		}
	}

	parseEmail(email: string) {
		try {
			return { error: false, ...this.email.parse({ email }) };
		} catch (err: unknown) {
			return { error: true, message: (err as ZodError).errors[0].message };
		}
	}
}

export default new BodyParser();
