<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ExclamationTriangle from 'svelte-icons/fa/FaExclamationTriangle.svelte';
	import CancelButton from '../buttons/CancelButton.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import ModalBase from './ModalBase.svelte';
	import store, { ToastType } from '$lib/store/toast';

	export let onRequestClose: () => void;

	let loading = false;

	const submit: SubmitFunction = () => {
		loading = true;
		return ({ result }) => {
			switch (result.type) {
				case 'redirect':
					store.push({ type: ToastType.success, message: 'Project deleted', closeAfter: 2000 });
					goto(result.location);
					break;
				case 'failure':
					store.push({ type: ToastType.error, message: result.data?.message, closeAfter: 2000 });
					break;
			}
			loading = false;
		};
	};
</script>

<ModalBase onRequestClose={!loading ? onRequestClose : undefined}>
	<div class="p-4 text-center max-w-sm">
		<h3 class="text-red-600 font-medium flex justify-between items-center">
			<div class="w-fit h-8"><ExclamationTriangle /></div>
			DELETE PROJECT
			<div class="w-fit h-8"><ExclamationTriangle /></div>
		</h3>
		<p class="my-8">All project data will be permanently deleted and cannot be restored</p>
		<p class="my-4">Are you sure?</p>

		<div class="flex justify-between mx-2">
			<CancelButton disabled={loading} w={20} p={2} onClick={onRequestClose}>Cancel</CancelButton>

			<form method="post" action="?/delete" use:enhance={submit}>
				<DeleteButton {loading} w={20} p={2}>Delete</DeleteButton>
				<input type="hidden" name="project_id" value={$page.data.project.id} />
			</form>
		</div>
	</div>
</ModalBase>
