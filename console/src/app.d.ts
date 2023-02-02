// See https://kit.svelte.dev/docs/types#app

import type { ConsoleUser } from "$lib/server/utils/inerfaces/interfaces";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			REQUIRE_AUTH: boolean,
			consoleUser?: ConsoleUser,
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};