import { z } from 'zod';

class Project {
    private readonly stringProps = { required_error: 'Field is required', invalid_type_error: "Must be a string" }

    readonly registrationSchema = z
        .object({
            name: z
                .string(this.stringProps)
                .min(2, { message: 'Name must be at least 2 characters' })
                .max(30, { message: 'Name must not be longer than 30 characters' }),
        });

    parse(data: unknown) {
        try {
            return this.registrationSchema.parse(data);
        } catch (err: any) {
            const log: { [key: string]: any } = { error: true }
            for (const error of err.errors) {
                log[error.path[0]] = { message: error.message };
            }
            return log;
        }
    }
}

export default new Project();