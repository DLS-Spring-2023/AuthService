<script lang="ts">
	import { page } from '$app/stores';
	import SessionTable from '$lib/components/SessionTable.svelte';

	$: sessions = $page.data.sessions;
</script>

<div class="p-10 w-full">
	<SessionTable {sessions} />
</div>
