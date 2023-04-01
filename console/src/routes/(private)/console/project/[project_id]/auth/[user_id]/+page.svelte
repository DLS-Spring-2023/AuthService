<script lang="ts">
	import { page } from '$app/stores';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Input from '$lib/components/Input.svelte';
	import SubmitButton from '$lib/components/buttons/SubmitButton.svelte';
	import DeleteButton from '$lib/components/buttons/DeleteButton.svelte';
	import { deleteUserModal } from '$lib/store/modals';
	import toast, { ToastType } from '$lib/store/toast';
	import { onMount } from 'svelte';

	$: user = $page.data.user;

	let name = '';
	let email = '';
	let password = '';

	onMount(() => {
		name = user.name;
		email = user.email;
	});

	const submitBlock: SubmitFunction = () => {
		return ({ result }) => {
			switch (result.type) {
				case 'success':
					invalidateAll();
					toast.push({
						type: ToastType.success,
						message: 'User successfully blocked',
						closeAfter: 2000
					});
					break;
				case 'failure':
					toast.push({ type: ToastType.error, message: result.data?.message, closeAfter: 2000 });
			}
		};
	};

	const submitVerify: SubmitFunction = () => {
		return ({ result }) => {
			switch (result.type) {
				case 'success':
					invalidateAll();
					toast.push({
						type: ToastType.success,
						message: 'User successfully verified',
						closeAfter: 2000
					});
					break;
				case 'failure':
					toast.push({ type: ToastType.error, message: result.data?.message, closeAfter: 2000 });
			}
		};
	};

	const submitName: SubmitFunction = () => {
		return ({ result }) => {
			switch (result.type) {
				case 'success':
					invalidateAll();
					toast.push({
						type: ToastType.success,
						message: 'Name successfully updated',
						closeAfter: 2000
					});
					break;
				case 'failure':
					toast.push({ type: ToastType.error, message: result.data?.message, closeAfter: 2000 });
					name = user.name;
			}
		};
	};

	const submitEmail: SubmitFunction = () => {
		return ({ result }) => {
			switch (result.type) {
				case 'success':
					invalidateAll();
					toast.push({
						type: ToastType.success,
						message: 'Email successfully updated',
						closeAfter: 2000
					});
					break;
				case 'failure':
					toast.push({ type: ToastType.error, message: result.data?.message, closeAfter: 2000 });
					email = user.email;
			}
		};
	};

	const submitPassword: SubmitFunction = () => {
		return ({ result }) => {
			switch (result.type) {
				case 'success':
					invalidateAll();
					toast.push({
						type: ToastType.success,
						message: 'Password successfully updated',
						closeAfter: 2000
					});
					break;
				case 'failure':
					toast.push({ type: ToastType.error, message: result.data?.message, closeAfter: 2000 });
			}
		};
	};
</script>

<div class="w-full">
	<!-- User Info and Enable/Verify forms -->
	<div class="bg-dark brightness-125 m-12 flex flex-col justify-between rounded-2xl border-full">
		<div class="flex justify-between items-center p-8">
			<h4>{user.name}</h4>
			<div class="text-gray-400 text-md">
				<p>{user.email}</p>
				<p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
			</div>
			<div
				class="{user.enabled
					? user.verified
						? 'text-green-400'
						: 'text-gray-400'
					: 'text-red-600'} bg-slate-800 rounded-full py-2 px-4 text-sm"
			>
				<p>{user.enabled ? (user.verified ? 'verified' : 'unverified') : 'disabled'}</p>
			</div>
		</div>
		<span class="border-bottom" />
		<div class="p-8 flex justify-end items-center">
			<form method="post" action="?/updateUser" use:enhance={submitBlock}>
				<button class="text-gray-400 py-2 hover:text-white"
					>{user.enabled ? 'Disable user' : 'Enable user'}</button
				>
				<input type="hidden" name="enabled" value={!user.enabled} />
			</form>
			{#if user.enabled}
				<form class="ml-8" method="post" action="?/updateUser" use:enhance={submitVerify}>
					<SubmitButton w={44}>{user.verified ? 'Unverify user' : 'Verify user'}</SubmitButton>
					<input type="hidden" name="verified" value={!user.verified} />
				</form>
			{/if}
		</div>
	</div>

	<!-- Update Name -->
	<div class="bg-dark brightness-125 m-12 flex flex-col justify-between rounded-2xl border-full">
		<form class="contents" method="post" action="?/updateUser" use:enhance={submitName}>
			<div class="w-full flex justify-between items-center p-8">
				<h4 class="font-medium">Update name</h4>
				<div class="w-1/2">
					<label for="name">Name</label>
					<Input id="name" name="name" required bind:value={name} />
				</div>
			</div>
			<span class="border-bottom" />
			<div class="w-full flex justify-end p-8">
				<SubmitButton disabled={name.trim() === user.name} w={20}>Update</SubmitButton>
			</div>
		</form>
	</div>

	<!-- Update Email -->
	<div class="bg-dark brightness-125 m-12 flex flex-col justify-between rounded-2xl border-full">
		<form class="contents" method="post" action="?/updateUser" use:enhance={submitEmail}>
			<div class="w-full flex justify-between items-center p-8">
				<h4 class="font-medium">Update email</h4>
				<div class="w-1/2">
					<label for="email">Email</label>
					<Input id="email" name="email" required bind:value={email} />
				</div>
			</div>
			<span class="border-bottom" />
			<div class="w-full flex justify-end p-8">
				<SubmitButton disabled={email.trim() === user.email} w={20}>Update</SubmitButton>
			</div>
		</form>
	</div>

	<!-- Update Password -->
	<div class="bg-dark brightness-125 m-12 flex flex-col justify-between rounded-2xl border-full">
		<form class="contents" method="post" action="?/updateUser" use:enhance={submitPassword}>
			<div class="w-full flex justify-between items-center p-8">
				<h4 class="font-medium">Update password</h4>
				<div class="w-1/2">
					<label for="password">Password (minimum 6 characters)</label>
					<Input
						id="password"
						name="password"
						type="password"
						placeholder="******"
						required
						bind:value={password}
					/>
				</div>
			</div>
			<span class="border-bottom" />
			<div class="w-full flex justify-end p-8">
				<SubmitButton disabled={password.length < 6} w={20}>Update</SubmitButton>
			</div>
		</form>
	</div>

	<!-- Delete User -->
	<div class="bg-dark brightness-125 m-12 flex flex-col justify-between rounded-2xl border-full">
		<div class="w-full flex justify-between items-center p-8">
			<h4 class="font-medium text-red-600">Delete user</h4>
			<div class="">
				<p class="font-semibold">{user.name}</p>
				<p>{user.email}</p>
			</div>
		</div>
		<span class="border-bottom" />
		<div class="w-full flex justify-end p-8">
			<DeleteButton onClick={() => deleteUserModal.set(true)} w={20}>Delete</DeleteButton>
		</div>
	</div>
</div>
