import { z } from 'zod';

class UserRegistration {
    private readonly stringProps = { required_error: 'Field is required', invalid_type_error: "Must be a string" }

    readonly registrationSchema = z
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
            password: z
                .string(this.stringProps)
                .min(6, { message: 'Must be at least 6 character' })
                .max(64, { message: 'Must not be longer than 64 characters' }),
            re_password: z
                .string(this.stringProps),
            api_key: z
                .string(this.stringProps)
        })
        .superRefine(({ re_password, password }, ctx) => {
            if (re_password !== password) {
                ctx.addIssue({
                    code: 'custom',
                    path: [ 're_password' ],
                    message: 'Passwords must match'
                });
            }
        });

    parse(data: unknown) {
        try {
            return this.registrationSchema.parse(data);
        } catch (err: any) {
            const error: { [key: string]: any } = { 
                error: true,
                message: err.errors[0].message
            }
            return error;
            // for (const error of err.errors) {
            //     log[error.path[0]] = { message: error.message };
            // }
            // return log;
        }
    }
}

export default new UserRegistration();