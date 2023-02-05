<script lang="ts">
    import { page } from '$app/stores';

    export let href: string;
    
    $: active = $page.url.pathname === href;
</script>

<div class="flex flex-col items-center mx-4">
    <a href={href} class="!text-slate-100 pt-2 rounded-m group">
        <slot/>
        <div class="
            w-full h-1 mt-2 rounded-sm 
            bg-indigo-700
            {active ? 'scale-x-110' : 'scale-x-0'}
            
            transition linear duration-300
        "></div>
    </a>
</div>