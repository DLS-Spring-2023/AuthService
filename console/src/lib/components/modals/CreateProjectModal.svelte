<script lang="ts">
    import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
    import Close from 'svelte-icons/md/MdClose.svelte'
    import LoadingSpinner from "svelte-icons/fa/FaSpinner.svelte";
    import ModalBase from "$lib/components/modals/ModalBase.svelte";
    import store, { ToastType } from '$lib/store/toast';

    export let onRequestClose: () => void;
    export let action: string | undefined = undefined;

    let isLoading = false;

    const formReturn = ({result}: {result: ActionResult<Record<string, any>, Record<string, any>>}) => {
        console.log(result);
        
        if (result.type === 'success') {
            store.push({type: ToastType.success, message: "Project successfully created", closeAfter: 2000})
            setTimeout(() => location.reload(), 2300);
        } else if (result.type === 'failure' && !result.data?.message) {
            store.push({type: ToastType.error, message: "An error occurred", closeAfter: 2000 });
            isLoading = false;
        } else if (result.type === 'failure') {
            store.push({type: ToastType.error, message: result.data?.message, closeAfter: 2000 });
            isLoading = false;
        }
    }
</script>

<ModalBase onRequestClose={isLoading ? () => {} : onRequestClose}>
    <div class="p-8 max-w-lg">
        <div class="flex justify-between">
            <h3 class="mr-64">Create Project</h3>
            <button disabled={isLoading} type="button" class="w-6" on:click={onRequestClose}><Close/></button>
        </div>
        <form class="flex flex-col mt-8" method="post" action={action || ''} use:enhance={() => {
            isLoading = true;
            return formReturn;
        }}>
            <label for="name">Name</label>
            <input disabled={isLoading} id="name" name="name" type="text" required>

            <div class="flex w-full justify-end mt-8">
                <button 
                    disabled={isLoading}
                    type="button" 
                    on:click={onRequestClose}
                    class="p-2 mr-4"
                >Cancel</button>
                <button 
                    disabled={isLoading}
                    type="submit" 
                    class="p-2 bg-indigo-600 rounded-md"
                >
                    {#if isLoading}<div class="spinner"><LoadingSpinner/></div>{:else}Create{/if}
                </button>

            </div>
        </form>
    </div>
</ModalBase>