<script lang="ts">
    import logo from '$lib/assets/logo.png';
    import { page } from '$app/stores';
</script>

<div class="flex min-h-screen">
    <div class="front w-1/2 flex justify-center">
        <div class="flex items-center">
            <a href="/"><img class="rounded-md w-24" src={logo} alt="logo"></a>
            <h1 class="ml-8 font-bold text-5xl">{$page.data.platformName}</h1>
        </div>
    </div>
    <slot/>
</div>