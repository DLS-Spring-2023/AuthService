import { UAParser as UAParserType } from 'ua-parser-js';

type CustomResult = {
	browser?: string;
	os?: string;
};

class UAParser extends UAParserType {
	private headers: Headers;

	constructor(headers: Headers) {
		super(headers.get('user-agent') || '');
		this.headers = headers;
	}

	getResults(): CustomResult {
		const results = this.getResult();
		const browser = this.headers.get('sec-ch-ua');
		const platform = this.headers.get('sec-ch-ua-platform');

		if (browser) {
			results.browser.name = browser.split(';')[0].replace(/"/g, '');
		}

		if (platform) {
			results.os.name = platform.replace(/"/g, '');
		}

		return {
			browser: results.browser.name,
			os: results.os.name
		};
	}
}

export default UAParser;
