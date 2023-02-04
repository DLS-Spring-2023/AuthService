<script>
    import { page } from '$app/stores';
	import MenuItem from '$lib/components/MenuItem.svelte';
</script>

<div class="relative w-full h-40 bg-dark brightness-110 border-bottom">
    
    <div class="pt-6 pl-10">
        <h2>Welcome {$page.data.consoleUser.name}</h2>
    </div>

    <!-- Options Menu -->
    <div class="absolute flex w-full justify-center bottom-0">
        <MenuItem href='/console/dashboard'>Projects</MenuItem>
        <MenuItem href='/console/dashboard/profile'>Settings</MenuItem>
    </div>
</div>

<slot/>