<script lang="ts">
    import Check from 'svelte-icons/fa/FaCheck.svelte';
    import Exclamation from 'svelte-icons/fa/FaExclamation.svelte';
    import Times from 'svelte-icons/fa/FaTimes.svelte'
    import Close from 'svelte-icons/md/MdClose.svelte';
    import { fly, crossfade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { flip } from 'svelte/animate';
    import store, { ToastType, type ToastProps } from '$lib/store/toast';
	import { beforeNavigate } from '$app/navigation';

    let toasts: ToastProps[] = [];

    store.store.subscribe(value => toasts = value);

    const [send, receive] = crossfade({
        fallback(node, params) {
            const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
        }   
    })

    const getBackground = (type: ToastType) => {
        return type === ToastType.success 
            ? 'bg-green-600' 
            : type === ToastType.warning 
            ? 'bg-orange-600' 
            : 'bg-red-600';
    }

    const closeAfter = (_: HTMLDivElement, {delay, id}: {delay: number | undefined, id: number | undefined}) => {
        if (delay) {
            setTimeout(() => {
                store.pop(id)
                
            }, delay)
        }
    }

    beforeNavigate(store.onNavigate);
</script>

<!-- Toast Messages -->
<div class="fixed top-20 right-10 max-w-sm flex flex-col items-end drop-shadow-md z-50">
    {#each toasts as toast, index (toast.id)}
        <div 
            class="flex bg-slate-200 h-20 w-fit rounded-md items-center mb-3"
            in:fly={{x: 300, duration: 300}}
            out:fly={{x: 300, duration: 300}}
            animate:flip|local={{ duration: 300, delay: 300 }}
            use:closeAfter|local={{delay: toast.closeAfter, id: toast.id}}
        >
            <div class="h-full w-20 rounded-l-md p-4 flex items-center text-white {getBackground(toast.type)}">
                {#if toast.type === ToastType.success}<Check/>{/if}
                {#if toast.type === ToastType.warning}<Exclamation/>{/if}
                {#if toast.type === ToastType.error  }<Times/>{/if}
            </div>
            <div class="text-slate-800 flex justify-center items-center p-2 font-medium text-center">
                {toast.message}
            </div>
            <button on:click={() => store.pop(toast.id)} type="button" class="w-6 mr-2 h-fit bg-slate-200 text-black rounded-r-md">
                <Close/>
            </button>
        </div>
    {/each}
</div>

