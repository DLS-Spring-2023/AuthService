import { z } from 'zod';

class UpdateAccount {
	private readonly stringProps = { invalid_type_error: 'Must be a string' };

	readonly schema = z
		.object({
			name: z
				.string(this.stringProps)
				.min(2, { message: 'Must be at least 2 characters' })
				.max(64, { message: 'Must not be longer than 64 characters' })
				.trim(),
			email: z
				.string(this.stringProps)
				.min(1, { message: 'Email Required' })
				.max(164, { message: 'Email is too long' })
				.email({ message: 'Must be a valid email address' }),
			oldPassword: z
				.union([
					z.string(this.stringProps).length(0),
					z.string(this.stringProps).min(6, { message: 'Must be at least 6 character' }),
					z.string(this.stringProps).max(64, { message: 'Must not be longer than 64 characters' })
				])
				.optional()
				.transform((e) => (e === '' ? undefined : e)),
			newPassword: z
				.union([
					z.string(this.stringProps).length(0),
					z.string(this.stringProps).min(6, { message: 'Must be at least 6 character' }),
					z.string(this.stringProps).max(64, { message: 'Must not be longer than 64 characters' })
				])
				.optional()
				.transform((e) => (e === '' ? undefined : e)),
			re_newPassword: z
				.union([
					z.string(this.stringProps).length(0),
					z.string(this.stringProps).min(6, { message: 'Must be at least 6 character' }),
					z.string(this.stringProps).max(64, { message: 'Must not be longer than 64 characters' })
				])
				.optional()
				.transform((e) => (e === '' ? undefined : e))
		})
		.superRefine(({ oldPassword, newPassword, re_newPassword }, ctx) => {
			if ((newPassword || re_newPassword) && !oldPassword) {
				ctx.addIssue({
					code: 'custom',
					path: ['oldPassword'],
					message: 'Please provide your old password'
				});
			}
			if (oldPassword && !newPassword) {
				ctx.addIssue({
					code: 'custom',
					path: ['newPassword'],
					message: 'Password cannot be empty'
				});
			}
			if (newPassword !== re_newPassword) {
				ctx.addIssue({
					code: 'custom',
					path: ['re_newPassword'],
					message: "Passwords don't match"
				});
			}
		});

	parse(data: unknown) {
		try {
			return this.schema.parse(data);
		} catch (err: any) {
			const log: { [key: string]: any } = { error: true };
			for (const error of err.errors) {
				log[error.path[0]] = { message: error.message };
			}
			return log;
		}
	}
}

export default new UpdateAccount();
