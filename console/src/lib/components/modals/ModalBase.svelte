<script lang="ts">
    import { fade } from 'svelte/transition';

    export let onRequestClose: () => void;
</script>

<div class="fixed top-0 flex justify-center items-center w-screen h-screen backdrop-blur-sm z-30"
    transition:fade={{ duration: 150 }}
>
    <button on:click={onRequestClose} type="button" class="fixed w-full h-full hover:cursor-default z-40"></button>
    <div class="w-fit h-fit bottom-0 border-full rounded-2xl drop-shadow-xl bg-dark z-50">
        <slot/>
    </div>
</div>