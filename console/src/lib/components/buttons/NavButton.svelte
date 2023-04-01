<script lang="ts">
	import { page } from '$app/stores';
	import ButtonBase from './ButtonBase.svelte';

	export let href: string;

	$: active = $page.url.pathname === href;
</script>

<ButtonBase
	{href}
	_class="
        flex
        items-center
        w-full
        {active ? 'bg-gray-700' : ''}
        hover:bg-gray-700
        p-2 rounded-md
        text-slate-100
        mb-4
    "
>
	<slot />
</ButtonBase>
