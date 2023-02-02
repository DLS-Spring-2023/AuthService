<script lang="ts">
    import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
    import { page } from '$app/stores';
    import FaEye from 'svelte-icons/fa/FaEye.svelte';
    import FaEyeSlash from 'svelte-icons/fa/FaEyeSlash.svelte';
    import LoadingSpinner from "svelte-icons/fa/FaSpinner.svelte";
    import toast, { ToastType } from '$lib/store/toast';

    const { data } = $page;
    
    let passHidden = true;
    let rePassHidden = true;
    let loading = false;

    let form: any = {}
</script>

<div class="w-1/2 flex items-center justify-center">
    <div  class="w-full mx-24">
        <form 
            class="flex flex-col w-full" 
            method="post" 
            use:enhance={() => {
                form = {}
                loading = true;
                
                return ({result}) => {
                    if (result.type === "redirect") {
                        sessionStorage.signupEvent = true;
                        goto(result.location);
                    }   
                    if (result.type === "failure") {
                        form = result.data;
                        if (form.error && form.message) {
                            toast.push({ type: ToastType.warning, message: form.message, removeOnNavigate: true });
                        }
                        loading = false;                
                    }
                }
            }
        }>
            <h1 class="mb-5 font-bold">Sign up</h1>
            <div class="flex flex-col relative">
                <label class="text-sm mb-1" for="email">Name</label>
                <input type="text" name="name" placeholder="Name" required value={data.autofill_name}>
                {#if form.error && form.name} 
                    <p class="text-red-600 dark:text-red-500 text-xs ml-1 absolute -bottom-4">{form.name.message}</p>
                {/if}
            </div>

            <div class="flex flex-col relative">
                <label class="text-sm mt-6 mb-1" for="email">Email</label>
                <input type="email" name="email" placeholder="Email" required value={data.autofill_email}>
                {#if form.error && form.email} 
                    <p class="text-red-600 dark:text-red-500 text-xs ml-1 absolute -bottom-4">{form.email.message}</p>
                {/if}
            </div>

            <div class="flex flex-col relative">
                <label class="text-sm mt-6 mb-1" for="password">Password</label>
                <input type={passHidden ? 'password' : 'text'} name="password" placeholder="Password" required value={data.autofill_password}>
                <div class="show-pass">
                    <button type="button" on:click|preventDefault={() => passHidden = !passHidden}>
                        {#if passHidden}<FaEye/>{:else}<FaEyeSlash/>{/if}
                    </button>
                </div>
                {#if form.error && form.password} 
                    <p class="text-red-600 dark:text-red-500 text-xs ml-1 absolute -bottom-4">{form.password.message}</p>
                {/if}
            </div>

            <div class="flex flex-col relative">
                <label class="text-sm mt-6 mb-1" for="re-password">Repeat Password</label>
                <input type={rePassHidden ? 'password' : 'text'} name="re_password" placeholder="Repeast password" required value={data.autofill_re_password}>
                <div class="show-pass">
                    <button type="button" disabled={loading} on:click|preventDefault={() => rePassHidden = !rePassHidden}>
                        {#if rePassHidden}<FaEye/>{:else}<FaEyeSlash/>{/if}
                    </button>
                </div>
                {#if form.error && form.re_password} 
                    <p class="text-red-600 dark:text-red-500 text-xs ml-1 absolute -bottom-4">{form.re_password.message}</p>
                {/if}
            </div>
            
            <!-- Submit Button -->
            <button disabled={loading} type="submit" class="{loading ? 'login-disabled' : 'login-button'} rounded-md h-10 mt-8" >
                {#if loading}<div class="spinner"><LoadingSpinner/></div>{:else}Register{/if}
            </button>
        </form>
        <div class="flex justify-center mt-6">
            <a href='/login'>Sign in</a>
        </div>
    </div>
</div>