import type { PageLoad } from './$types';
import {
	PUBLIC_AUTOFILL_NAME,
	PUBLIC_AUTOFILL_EMAIL,
	PUBLIC_AUTOFILL_PASSWORD,
	PUBLIC_AUTOFILL_RE_PASSWORD
} from '$env/static/public';

export const load: PageLoad = async () => {
	return {
		autofill_name: PUBLIC_AUTOFILL_NAME,
		autofill_email: PUBLIC_AUTOFILL_EMAIL,
		autofill_password: PUBLIC_AUTOFILL_PASSWORD,
		autofill_re_password: PUBLIC_AUTOFILL_RE_PASSWORD
	};
};
