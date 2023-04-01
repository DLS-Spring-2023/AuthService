<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import DeleteButton from '$lib/components/buttons/DeleteButton.svelte';
	import SubmitButton from '$lib/components/buttons/SubmitButton.svelte';
	import DeleteProjectModal from '$lib/components/modals/DeleteProjectModal.svelte';
	import Input from '$lib/components/Input.svelte';
	import store, { ToastType } from '$lib/store/toast';

	let showModal = false;
	let nameLoading = false;

	const submitName: SubmitFunction = () => {
		nameLoading = true;

		return ({ result }) => {
			switch (result.type) {
				case 'failure':
					store.push({ type: ToastType.error, message: result.data?.message, closeAfter: 2000 });
					break;
				case 'success':
					invalidateAll();
					store.push({
						type: ToastType.success,
						message: 'Successfully updated project name',
						closeAfter: 2000
					});
					break;
			}
			nameLoading = false;
		};
	};
</script>

<div class="w-full">
	<div
		class="bg-dark brightness-125 m-12 p-8 flex flex-col justify-between rounded-2xl border-full"
	>
		<form class="contents" method="post" action="?/updateName" use:enhance={submitName}>
			<div class="w-full flex justify-between">
				<h4 class="font-medium">Update name</h4>
				<div class="w-1/2">
					<Input id="name" name="name" required value={$page.data.project.name} />
				</div>
			</div>
			<div class="w-full flex justify-end mt-10">
				<SubmitButton w={20}>Update</SubmitButton>
			</div>

			<input type="hidden" name="project_id" value={$page.data.project.id} />
		</form>
	</div>

	<div
		class="bg-dark brightness-125 m-12 p-8 mt-10 flex flex-col justify-between rounded-2xl border-full"
	>
		<div class="w-full flex justify-between items-center">
			<h4 class="font-medium text-red-600">Delete Project</h4>
			<DeleteButton type="button" onClick={() => (showModal = true)} w={20}>Delete</DeleteButton>
		</div>
	</div>
</div>

{#if showModal}
	<div style="margin-left: -200px">
		<DeleteProjectModal onRequestClose={() => (showModal = false)} />
	</div>
{/if}
