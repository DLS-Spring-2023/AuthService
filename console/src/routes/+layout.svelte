<script lang="ts">
    import "../app.css";
	import Toasts from "$lib/components/Toasts.svelte";
</script>

<svelte:head>
    <script>
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.theme = 'light';
        }
    </script>
</svelte:head>

<main>
    <slot />
    <Toasts/>
</main>