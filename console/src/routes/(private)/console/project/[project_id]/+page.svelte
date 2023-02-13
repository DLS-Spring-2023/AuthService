<script lang="ts">
    import { page } from '$app/stores';
    import Input from '$lib/components/Input.svelte';
    
    const { project } = $page.data
</script>

<div class="w-full p-8">
    <div class="w-full bg-dark brightness-125 rounded-xl border-full p-4 flex justify-between items-center">
        <label for="api_key" class="mr-4">API KEY</label>
        <div class="hover:cursor-text w-1/3">
            <Input type="password" id="api_key" disabled cursor="text" value={project.api_key} />
        </div>
    </div>
</div>