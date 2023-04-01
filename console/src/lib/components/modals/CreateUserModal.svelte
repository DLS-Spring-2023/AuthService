<script lang="ts">
	import { page } from '$app/stores';
	import { enhance, type SubmitFunction } from '$app/forms';
	import ModalBase from '$lib/components/modals/ModalBase.svelte';
	import store, { ToastType } from '$lib/store/toast';
	import SubmitButton from '../buttons/SubmitButton.svelte';
	import CancelButton from '../buttons/CancelButton.svelte';
	import Input from '../Input.svelte';
	import { invalidate } from '$app/navigation';

	export let onRequestClose: () => void;

	let loading = false;

	const submit: SubmitFunction = () => {
		loading = true;

		return ({ result }) => {
			switch (result.type) {
				case 'success':
					store.push({
						type: ToastType.success,
						message: 'User successfully created',
						closeAfter: 2000
					});
					invalidate((url) => url.pathname === `/v1/project/${$page.data.project.id}/users`);
					onRequestClose();
					break;
				case 'failure':
					result.data?.message
						? store.push({ type: ToastType.error, message: result.data?.message, closeAfter: 2000 })
						: store.push({ type: ToastType.error, message: 'An error occurred', closeAfter: 2000 });
					loading = false;
					break;
			}
		};
	};
</script>

<ModalBase onRequestClose={loading ? () => {} : onRequestClose}>
	<div class="p-8 max-w-lg">
		<div class="flex justify-between">
			<h3 class="mr-64">Create User</h3>
		</div>
		<form class="flex flex-col mt-8" method="post" use:enhance={submit}>
			<label for="name">Name</label>
			<Input id="name" name="name" placeholder="Name" disabled={loading} focus required />

			<label for="email" class="mt-4">Email</label>
			<Input
				id="email"
				name="email"
				placeholder="email@example.com"
				disabled={loading}
				focus
				required
			/>

			<label for="password" class="mt-4">Password</label>
			<Input
				id="password"
				name="password"
				placeholder="********"
				type="password"
				disabled={loading}
				focus
				required
			/>

			<label for="re_password" class="mt-4">Repeat Password</label>
			<Input
				id="re_password"
				name="re_password"
				placeholder="********"
				type="password"
				disabled={loading}
				focus
				required
			/>

			<input type="hidden" name="api_key" value={$page.data.project.keystore.api_key} />

			<div class="flex w-full justify-between mt-8">
				<CancelButton w={20} disabled={loading} onClick={onRequestClose}>Cancel</CancelButton>
				<SubmitButton w={20} disabled={loading}>Create</SubmitButton>
			</div>
		</form>
	</div>
</ModalBase>
