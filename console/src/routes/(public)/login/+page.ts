import type { PageLoad } from './$types';
import { PUBLIC_AUTOFILL_EMAIL, PUBLIC_AUTOFILL_PASSWORD } from '$env/static/public';

export const load: PageLoad = async () => {
	return {
		autofill_email: PUBLIC_AUTOFILL_EMAIL,
		autofill_password: PUBLIC_AUTOFILL_PASSWORD
	};
};
