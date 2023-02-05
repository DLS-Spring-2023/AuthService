<script lang="ts">
    import LoadingSpinner from "svelte-icons/fa/FaSpinner.svelte";

    export let type: "reset" | "button" | "submit" = "submit";
    export let href: string | undefined = undefined;
    export let onClick: () => void = () => {};
    export let _class = "p-2";
    export let loading = false;
    export let disabled = false;
</script>

{#if href}
    <a href={href} class={_class}>
        <slot/>
    </a>
{:else}
    <button disabled={disabled} type="{type}" class="{_class} rounded-md flex justify-center" on:click={onClick}>
        {#if loading}
            <div class="spinner h-full"><LoadingSpinner/></div>

        {:else}
            <slot/>
        {/if}
    </button>
{/if}

