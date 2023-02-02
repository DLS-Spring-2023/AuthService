<script lang="ts">
    import Plus from 'svelte-icons/fa/FaPlus.svelte';

    export let data: any | undefined = undefined;

    export let onClick: (() => void) | undefined = undefined;
</script>

<div class="project-container group">
    {#if data}
        <div>
            {data.name}
        </div>
    {:else}
        <button type="button" on:click={onClick} class="w-full h-full flex flex-col justify-center items-center text-slate-100">
            <div class="new-project">
                <Plus/>
            </div>
            <p>New project</p>
        </button>
    {/if}
</div>