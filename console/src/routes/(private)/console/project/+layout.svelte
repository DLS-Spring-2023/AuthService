<script lang="ts">
	import { page } from '$app/stores';
	import ChartBar from 'svelte-icons/fa/FaRegChartBar.svelte';
	import Users from 'svelte-icons/fa/FaUserFriends.svelte';
	import Settings from 'svelte-icons/md/MdSettings.svelte';
	import NavButton from '$lib/components/buttons/NavButton.svelte';
	import CreateUserModal from '$lib/components/modals/CreateUserModal.svelte';
	import DeleteUserModal from '$lib/components/modals/DeleteUserModal.svelte';
	import { createUserModal, deleteUserModal } from '$lib/store/modals';
	import { onMount } from 'svelte';

	$: project = $page.data.project;

	let title: string;

	$: switch ($page.url.pathname.replace(`/console/project/${project.id}`, '')) {
		case '/settings':
			title = 'Settings';
			break;
		case '/auth':
			title = 'Auth';
			break;
		case `/auth/${$page.params.user_id}`:
			title = $page.data.user.name;
			break;
		default:
			title = project.name;
	}

	// Modals
	let showCreateUserModal = false;
	let showDeleteUserModal = false;
	onMount(() => {
		createUserModal.subscribe((value) => (showCreateUserModal = value));
		deleteUserModal.subscribe((value) => (showDeleteUserModal = value));
	});
</script>

<div class="relative w-full min-h-full flex">
	<!-- Side bar -->
	<div class="sidebar">
		<div class="h-full flex flex-col justify-between">
			<div class="flex flex-col">
				<NavButton href="/console/project/{project.id}"
					><div class="w-5 mr-2"><ChartBar /></div>
					Overview</NavButton
				>
				<NavButton href="/console/project/{project.id}/auth"
					><div class="w-5 mr-2"><Users /></div>
					Auth</NavButton
				>
			</div>
			<div>
				<NavButton href="/console/project/{project.id}/settings"
					><div class="w-5 mr-2"><Settings /></div>
					Settings</NavButton
				>
			</div>
		</div>
	</div>

	<div class="w-full h-full" style="padding-left: 200px">
		<div class="bg-dark brightness-110 h-44 border-bottom pt-16 pl-20">
			<h2 class="font-medium">{title}</h2>
		</div>
		<slot />
	</div>
</div>

<!-- Only display from /project/[id]/auth -->
{#if showCreateUserModal}
	<CreateUserModal onRequestClose={() => createUserModal.set(false)} />
{/if}

<!-- Only display from /project/[project_id]/auth/[user_id] -->
{#if showDeleteUserModal}
	<DeleteUserModal onRequestClose={() => deleteUserModal.set(false)} />
{/if}
