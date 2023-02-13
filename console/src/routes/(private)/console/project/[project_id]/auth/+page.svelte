<script lang="ts">
    import { page } from '$app/stores';
	import SubmitButton from '$lib/components/buttons/SubmitButton.svelte';
    import { createUserModal } from '$lib/store/modals';

    $: users = $page.data.users;
</script>


<div class="w-full p-8">
    <div class="w-full flex justify-end mb-8">
        <SubmitButton type="button" onClick={() => createUserModal.set(true)}>Create User</SubmitButton>
    </div>

    <div class="w-full bg-dark brightness-125 rounded-xl border-full">
        <div class="grid grid-cols-5">
            <p class="my-4 ml-6">NAME</p>
            <p class="my-4">EMAIL</p>
            <p class="my-4">STATUS</p>
            <p class="my-4">ID</p>
            <p class="my-4">JOINED</p>
            <span class="col-span-5 border-top"></span>
            {#each users as user, index}
                <a href={`/console/project/${$page.params.project_id}/auth`} class="contents">
                    <div class="pl-6 py-4">{user.name}</div>
                    <div class="py-4">{user.email}</div>
                    <div class="py-4">{user.verified ? 'verified' : 'not verified'}</div>
                    <div class="py-4">{user.id}</div>
                    <div class="py-4">{new Date(user.created_at).toLocaleDateString()}</div>
                </a>
                {#if index < users.length - 1}
                    <span class="col-span-5 border-top"></span>
                {/if}
            {/each}
        </div>
    </div>
</div>

