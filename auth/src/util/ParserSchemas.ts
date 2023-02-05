import { z } from "zod";

abstract class ParserSchemas {
    private readonly stringProps = { required_error: 'Field is required', invalid_type_error: "Must be a string" }

    protected readonly updateAccount = z
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
                    z.string(this.stringProps).max(64, { message: 'Must not be longer than 64 characters' }),
                ])
                .optional()
                .transform(e => e === "" ? undefined : e),
            newPassword: z
                .union([
                    z.string(this.stringProps).length(0), 
                    z.string(this.stringProps).min(6, { message: 'Must be at least 6 character' }),
                    z.string(this.stringProps).max(64, { message: 'Must not be longer than 64 characters' }),
                ])
                .optional()
                .transform(e => e === "" ? undefined : e),
            
        })
        .superRefine(({ oldPassword, newPassword }, ctx) => {
            if (newPassword && !oldPassword) {
                ctx.addIssue({
                    code: 'custom',
                    path: [ 'oldPassword' ],
                    message: 'Please provide your old password'
                });
            }

            if (oldPassword && !newPassword) {
                ctx.addIssue({
                    code: 'custom',
                    path: [ 'newPassword' ],
                    message: 'Password cannot be empty'
                });
            }
        });

    protected readonly name = z.object({ name: z
        .string(this.stringProps)
        .trim()
        .min(2, { message: 'Must be at least 2 characters' })
        .max(64, { message: 'Must not be longer than 64 characters' })
    });

    protected readonly email = z.object({ email: z
        .string(this.stringProps)
        .trim()
        .min(1, { message: 'Email Required' })
        .max(164, { message: 'Email is too long' })
        .email({ message: 'Must be a valid email address' })
    });

    protected readonly password = z.object({ password: z
        .string(this.stringProps)
        .min(6, { message: 'Must be at least 6 character' })
        .max(64, { message: 'Must not be longer than 64 characters' }),
    })
}

export default ParserSchemas;