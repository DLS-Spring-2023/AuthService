<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import ModalBase from '$lib/components/modals/ModalBase.svelte';
	import store, { ToastType } from '$lib/store/toast';
	import SubmitButton from '../buttons/SubmitButton.svelte';
	import CancelButton from '../buttons/CancelButton.svelte';
	import Input from '../Input.svelte';
	import { goto } from '$app/navigation';

	export let onRequestClose: () => void;
	// export let projects: any[];

	let loading = false;

	const submit: SubmitFunction = () => {
		loading = true;

		return ({ result }) => {
			switch (result.type) {
				case 'redirect':
					store.push({
						type: ToastType.success,
						message: 'Project successfully created',
						closeAfter: 2000
					});
					onRequestClose();
					goto(result.location);
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
			<h3 class="mr-64">Create Project</h3>
		</div>
		<form class="flex flex-col mt-8" method="post" use:enhance={submit}>
			<label for="name">Name</label>
			<Input id="name" name="name" placeholder="Name" disabled={loading} focus required />

			<div class="flex w-full justify-between mt-8">
				<CancelButton w={20} disabled={loading} onClick={onRequestClose}>Cancel</CancelButton>
				<SubmitButton w={20} disabled={loading}>Create</SubmitButton>
			</div>
		</form>
	</div>
</ModalBase>
