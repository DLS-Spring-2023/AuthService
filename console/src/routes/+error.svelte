<script>
	import { page } from '$app/stores';

	const error = $page;
</script>

<div class="flex min-h-screen justify-center items-center">
	<h1>{error.status}</h1>
	<span class="w-px h-10 bg-black dark:bg-white mx-4" />
	<h2>{error.error?.message}</h2>
</div>
