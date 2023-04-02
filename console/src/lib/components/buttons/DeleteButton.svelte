<script lang="ts">
	import ButtonBase from './ButtonBase.svelte';

	export let type: 'reset' | 'button' | 'submit' = 'submit';
	export let loading = false;
	export let onClick: (() => void) | undefined = undefined;
	export let w: number | undefined = undefined;
	export let h: number | undefined = 10;
	export let p = 2;
</script>

<ButtonBase
	{type}
	{loading}
	disabled={loading}
	{onClick}
	_class="
        bg-red-600
        flex items-center 
        {!loading ? 'hover:brightness-150' : ''}
        {w ? `w-${w}` : ''}
        {h ? `h-${h}` : ''}
        {`p-${p}`}
    "
>
	<slot />
</ButtonBase>
