// import { AUTH_TARGET } from '$env/static/private';
// import Settings from '../settings/Settings';

class Startup {
	private static async setPublicAccessKey() {
		// const response = await fetch(AUTH_TARGET + '/keys/access');
		// Settings.ACCESS_KEY = response.ok ? await response.text() : '';
	}

	static async run() {
		await Promise.all([this.setPublicAccessKey()]);
	}
}

export default Startup;
