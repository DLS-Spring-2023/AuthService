<script lang="ts">
    import FaEye from 'svelte-icons/fa/FaEye.svelte';
    import FaEyeSlash from 'svelte-icons/fa/FaEyeSlash.svelte';
        
    export let type: "text" | "password" | "email" = "text";
    export let name = "";
    export let id = "";
    export let value = "";
    export let placeholder = "";
    export let required = false;
    export let disabled = false;
    export let focus = false;
    
    let hidePass = true;

    const typeAction = (node: HTMLInputElement, hide: boolean) => {
        node.type = type === 'password' ? hide ? 'password' : 'text' : type;
        
        return {
            update(hide: boolean) {        
                node.type = type === 'password' ? hide ? 'password' : 'text' : type;
            }
        }
	}

    const focusInput = (node: HTMLInputElement, focus: boolean) => {
        if (focus) node.focus();
    }
</script>

<div class="relative">
    <input 
        id={id}
        name={name}
        placeholder={placeholder} 
        required={required} 
        disabled={disabled}
        use:typeAction={hidePass}
        use:focusInput={focus}
        bind:value={value}
        class="
            w-full bg-light dark:bg-dark p-2
            border border-solid border-slate-500 rounded-md
            transition ease-linear duration-75
    ">
    {#if type === "password"}
        <div class="
            absolute right-2 bottom-1 w-6 text-gray-400
            hover:text-gray-50 hover:cursor-pointer
        ">
            <button type="button" on:click|preventDefault={() => hidePass = !hidePass}>
                {#if hidePass}<FaEye/>{:else}<FaEyeSlash/>{/if}
            </button>
        </div>
    {/if}
</div>