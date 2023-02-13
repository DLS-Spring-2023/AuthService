<script lang="ts">
    import { page } from '$app/stores';
    import { enhance, type SubmitFunction } from "$app/forms";
	import { goto, invalidateAll } from "$app/navigation";
    import ExclamationTriangle from 'svelte-icons/fa/FaExclamationTriangle.svelte'
	import CancelButton from "../buttons/CancelButton.svelte";
    import DeleteButton from "../buttons/DeleteButton.svelte";
    import ModalBase from "./ModalBase.svelte";
    import toast, { ToastType } from '$lib/store/toast';

    export let onRequestClose: () => void;

    let loading = false;

    const submit: SubmitFunction = () => {
        loading = true;
        return ({result}) => {
            switch(result.type) {
                case "redirect":
                    toast.push({ type: ToastType.success, message: "User successfully deleted", closeAfter: 2000});
                    onRequestClose();
                    goto(result.location, {invalidateAll: true});
                    break;
                case "failure":
                    toast.push({ type: ToastType.error, message: result.data?.message, closeAfter: 2000});
                default:
                    loading= false;
            }
        }
    }
    
</script>

<ModalBase onRequestClose={!loading ? onRequestClose : () => {}}>
    <div class="p-4 text-center max-w-sm">
        <h3 class="text-red-600 font-medium flex justify-between items-center">
            <div class="w-fit h-8"><ExclamationTriangle/></div>
             DELETE USER
            <div class="w-fit h-8"><ExclamationTriangle/></div>
        </h3>
        <p class="my-8">All user data will be permanently deleted and cannot be recovered</p>
        <p class="my-4">Are you sure?</p>

        <div class="flex justify-between mx-2">
            <CancelButton disabled={loading} w={20} p={2} onClick={onRequestClose}>Cancel</CancelButton>

            <form method="post" action="?/deleteUser" use:enhance={submit}>
                <DeleteButton loading={loading} w={20} p={2}>Delete</DeleteButton>
            </form>
        </div>
    </div>
</ModalBase>