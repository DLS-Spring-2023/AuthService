<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import toast, { ToastType } from '$lib/store/toast';
	import SubmitButton from '$lib/components/buttons/SubmitButton.svelte';
	import Input from '$lib/components/Input.svelte';

	const { data } = $page;

	let loading = false;

	let form: Record<string, { [key: string]: string }> | undefined = {};

	const submit: SubmitFunction = () => {
		form = {};
		loading = true;

		return ({ result }) => {
			if (result.type === 'redirect') {
				sessionStorage.signinEvent = true;
				goto(result.location);
			}

			if (result.type === 'failure') {
				form = result.data;
				if (form?.error && form.message) {
					toast.push({
						type: ToastType.warning,
						message: form.message as unknown as string,
						removeOnNavigate: true
					});
				}
				loading = false;
			}
		};
	};
</script>

<div class="w-1/2 flex items-center justify-center">
	<div class="w-full mx-24">
		<form class="flex flex-col w-full" method="post" use:enhance={submit}>
			<h1 class="mb-5 font-bold">Sign in</h1>

			<!-- Email Input -->
			<div class="flex flex-col relative">
				<label class="text-sm mt-6 mb-1" for="email">Email</label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="Email"
					required
					value={data.autofill_email}
				/>
				{#if form?.error && form.email}
					<p class="text-red-600 dark:text-red-500 text-xs ml-1 absolute -bottom-4">
						{form.email.message}
					</p>
				{/if}
			</div>

			<!-- Password Input -->
			<div class="flex flex-col relative mb-8">
				<label class="text-sm mt-6 mb-1" for="password">Password</label>
				<Input
					id="password"
					type="password"
					name="password"
					placeholder="Password"
					required
					value={data.autofill_password}
				/>
				{#if form?.error && form.password}
					<p class="text-red-600 dark:text-red-500 text-xs ml-1 absolute -bottom-4">
						{form.password.message}
					</p>
				{/if}
			</div>

			<!-- Submit Button -->
			<SubmitButton disabled={loading}>Login</SubmitButton>
		</form>
		<div class="flex justify-center mt-6">
			<a href="/signup">Register</a>
		</div>
	</div>
</div>
