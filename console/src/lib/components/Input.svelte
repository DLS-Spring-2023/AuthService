<script lang="ts">
	import FaEye from 'svelte-icons/fa/FaEye.svelte';
	import FaEyeSlash from 'svelte-icons/fa/FaEyeSlash.svelte';
	import Copy from 'svelte-icons/fa/FaRegCopy.svelte';
	import Clipboard from 'clipboard';

	export let type: 'text' | 'password' | 'email' = 'text';
	export let name = '';
	export let id = '';
	export let value = '';
	export let placeholder = '';
	export let required = false;
	export let disabled = false;
	export let focus = false;
	export let copy = false;
	export let cursor: 'text' | 'pointer' | 'default' | undefined = undefined;

	let hidePass = true;

	const hidePassAction = (node: HTMLInputElement, hide: boolean) => {
		node.type = type === 'password' ? (hide ? 'password' : 'text') : type;

		return {
			update(hide: boolean) {
				node.type = type === 'password' ? (hide ? 'password' : 'text') : type;
			}
		};
	};

	let bg = 'bg-dark';
	let duration = 'duration-100';
	const copyToClipboard = (node: HTMLButtonElement) => {
		const clipboard = new Clipboard(node, {
			text: () => value
		});

		clipboard.on('success', () => {
			bg = 'bg-green-600';
			duration = 'duration-100';
			setTimeout(() => {
				bg = 'bg-dark';
				duration = 'duration-300';
			}, 300);
		});

		clipboard.on('error', () => {
			bg = 'bg-red-500';
			duration = 'duration-100';
			setTimeout(() => {
				bg = 'bg-dark';
				duration = 'duration-300';
			}, 1000);
		});

		return {
			destroy() {
				clipboard.destroy();
			}
		};
	};

	const focusInput = (node: HTMLInputElement, focus: boolean) => {
		if (focus) node.focus();
	};
</script>

<div class="relative">
	<input
		{id}
		{name}
		{placeholder}
		{required}
		{disabled}
		use:hidePassAction={hidePass}
		use:focusInput={focus}
		bind:value
		class="
            w-full 
			transition-colors ease-in-out {duration} {bg} p-2
            border border-solid border-slate-500 rounded-md
			{cursor ? `hover:cursor-${cursor}` : ''}
    "
	/>
	{#if type === 'password' || copy}
		<div
			class="
            flex h-full items-center absolute right-2 top-0 text-gray-400 hover:cursor-pointer
        "
		>
			{#if copy}
				<button type="button" use:copyToClipboard class="w-4 mr-2 hover:text-gray-50">
					<Copy />
				</button>
			{/if}
			{#if type === 'password'}
				<button
					type="button"
					on:click|preventDefault={() => (hidePass = !hidePass)}
					class="w-6 hover:text-gray-50"
				>
					{#if hidePass}<FaEye />{:else}<FaEyeSlash />{/if}
				</button>
			{/if}
		</div>
	{/if}
</div>
