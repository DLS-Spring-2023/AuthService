<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import ExclamationTriangle from 'svelte-icons/fa/FaExclamationTriangle.svelte';
	import CancelButton from '../buttons/CancelButton.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import ModalBase from './ModalBase.svelte';

	export let onRequestClose: () => void;

	let loading = false;

	const submit: SubmitFunction = () => {
		loading = true;
		return ({ result }) => {
			if (result.type === 'success') {
				location.reload();
			} else {
				loading = false;
			}
		};
	};
</script>

<ModalBase onRequestClose={!loading ? onRequestClose : undefined}>
	<div class="p-4 text-center max-w-sm">
		<h3 class="text-red-600 font-medium flex justify-between items-center">
			<div class="w-fit h-8"><ExclamationTriangle /></div>
			DELETE ACCOUNT
			<div class="w-fit h-8"><ExclamationTriangle /></div>
		</h3>
		<p class="my-8">
			All account and project data will be permanently deleted and cannot be recovered
		</p>
		<p class="my-4">Are you sure?</p>

		<div class="flex justify-between mx-2">
			<CancelButton disabled={loading} w={20} p={2} onClick={onRequestClose}>Cancel</CancelButton>

			<form method="post" action="?/delete" use:enhance={submit}>
				<DeleteButton {loading} w={20} p={2}>Delete</DeleteButton>
			</form>
		</div>
	</div>
</ModalBase>
