// See https://kit.svelte.dev/docs/types#app

import type { AuthTokens, ConsoleUser } from "$lib/server/utils/inerfaces/interfaces";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			consoleUser?: ConsoleUser,
			authTokens?: AuthTokens,
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
