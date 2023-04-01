<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { page } from '$app/stores';
	import DeleteButton from '$lib/components/buttons/DeleteButton.svelte';
	import SubmitButton from '$lib/components/buttons/SubmitButton.svelte';
	import DeleteAccountModal from '$lib/components/modals/DeleteAccountModal.svelte';
	import Input from '$lib/components/Input.svelte';
	import toast, { ToastType } from '$lib/store/toast';
	import { onMount } from 'svelte';

	const { consoleUser } = $page.data;

	let showModal = false;

	let name = consoleUser.name;
	let email = consoleUser.email;
	let oldPassword = '';
	let newPassword = '';
	let re_newPassword = '';

	let loading = false;
	let form: any = {};

	const reset = () => {
		name = consoleUser.name;
		email = consoleUser.email;
		oldPassword = '';
		newPassword = '';
		re_newPassword = '';
		form = {};
	};

	const submit: SubmitFunction = () => {
		form = {};
		loading = true;

		return ({ result }) => {
			switch (result.type) {
				case 'success':
					toast.push({ type: ToastType.success, message: 'Changes saved', closeAfter: 2000 });
					loading = false;
					break;
				case 'failure':
					form = result.data;
					if (form.error && form.message) {
						toast.push({ type: ToastType.warning, message: form.message, removeOnNavigate: true });
					}
					loading = false;
					break;
			}
		};
	};

	onMount(reset);
</script>

<div class="w-full flex flex-col items-center mt-16">
	<div class="grid grid-cols-3 gap-2">
		<!-- Update Account Form -->
		<form class="contents" action="?/update" method="post" use:enhance={submit}>
			<!-- NAME -->
			<label for="name" class="h-11 w-full flex items-center pr-8">Name</label>
			<div class="w-64 flex items-center">
				<Input id="name" name="name" type="text" bind:value={name} />
			</div>
			<code class="ml-2 w-64 text-sm h-full flex items-center text-red-600"
				>{form.name ? form.name.message : ''}</code
			>

			<!-- EMAIL -->
			<label for="email" class="h-11 w-full flex items-center pr-8">Email</label>
			<div class="w-64 flex items-center">
				<Input id="email" name="email" type="text" bind:value={email} />
			</div>
			<code class="ml-2 w-64 text-sm h-full flex items-center text-red-600"
				>{form.email ? form.email.message : ''}</code
			>

			<!-- OLD PASSWORD -->
			<label for="oldPassword" class="h-11 w-full flex items-center pr-8">Old password</label>
			<div class="w-64 flex items-center">
				<Input
					id="oldPassword"
					name="oldPassword"
					type="password"
					placeholder="******"
					bind:value={oldPassword}
				/>
			</div>
			<code class="ml-2 w-64 text-sm h-full flex items-center text-red-600"
				>{form.oldPassword ? form.oldPassword.message : ''}</code
			>

			<!-- NEW PASSWORD -->
			<label for="newPassword" class="h-11 w-full flex items-center pr-8">New password</label>
			<div class="w-64 flex items-center">
				<Input
					id="newPassword"
					name="newPassword"
					type="password"
					placeholder="******"
					bind:value={newPassword}
				/>
			</div>
			<code class="ml-2 w-64 text-sm h-full flex items-center text-red-600"
				>{form.newPassword ? form.newPassword.message : ''}</code
			>

			<!-- REPEAT NEW PASSWORD -->
			<label for="re_new_password" class="h-11 w-full flex items-center pr-8 "
				>Repeat new password</label
			>
			<div class="w-64 flex items-center">
				<Input
					id="re_newPassword"
					name="re_newPassword"
					type="password"
					placeholder="******"
					bind:value={re_newPassword}
				/>
			</div>
			<code class="ml-2 w-64 text-sm h-full flex items-center text-red-600"
				>{form.re_newPassword ? form.re_newPassword.message : ''}</code
			>

			<!-- SUBMIT -->
			<div class="col-start-2 flex justify-between mt-1 mx-1 items-center">
				<button type="button" on:click={reset} class=" col-start-2 h-10 rounded-md">Reset</button>
				<SubmitButton disabled={loading} w={20}>Save</SubmitButton>
			</div>
		</form>

		<div class="mt-6 col-start-2 flex justify-center">
			<DeleteButton onClick={() => (showModal = true)} h={8}>Delete Account</DeleteButton>
			<!-- <button type="button" on:click={() => showModal = true} class="bg-red-700 px-2 py-1 rounded-md">Delete Account</button> -->
		</div>
	</div>
</div>

{#if showModal}
	<DeleteAccountModal onRequestClose={() => (showModal = false)} />
{/if}
