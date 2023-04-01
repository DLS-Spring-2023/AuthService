import { z } from 'zod';

class Login {
	private readonly stringProps = {
		required_error: 'Field is required',
		invalid_type_error: 'Must be a string'
	};

	readonly registrationSchema = z.object({
		email: z
			.string(this.stringProps)
			.min(1, { message: 'Email Required' })
			.max(164, { message: 'Email is too long' })
			.email({ message: 'Must be a valid email address' }),
		password: z
			.string(this.stringProps)
			.min(1, { message: 'Field is required' })
			.max(64, { message: 'Must not be longer than 64 characters' })
	});

	parse(data: unknown) {
		try {
			return this.registrationSchema.parse(data);
		} catch (err: any) {
			const log: { [key: string]: any } = { error: true };
			for (const error of err.errors) {
				log[error.path[0]] = { message: error.message };
			}
			return log;
		}
	}
}

export default new Login();
