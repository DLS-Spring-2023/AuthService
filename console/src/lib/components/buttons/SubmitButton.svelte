<script lang="ts">
	import ButtonBase from './ButtonBase.svelte';

	export let type: 'reset' | 'button' | 'submit' = 'submit';
	export let onClick: () => void = () => {};
	export let disabled = false;
	export let loading = false;
	export let w: number | undefined = undefined;
	export let p = 2;
</script>

<ButtonBase
	{type}
	{onClick}
	disabled={disabled || loading}
	{loading}
	_class="
        {disabled ? 'bg-gray-800' : 'bg-indigo-600'}
        {disabled ? 'text-gray-400' : ''} 
        {!disabled ? 'hover:brightness-150' : ''}
        {w ? `w-${w}` : ''}
        {`p-${p}`}
        h-10
    "
>
	<slot />
</ButtonBase>
