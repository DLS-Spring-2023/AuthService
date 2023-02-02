<script lang="ts">
    import { page } from "$app/stores";
	import CreateProjectModal from "$lib/components/modals/CreateProjectModal.svelte";
	import Modal from "$lib/components/modals/ModalBase.svelte";
	import ProjectCon from "$lib/components/ProjectCon.svelte";
    import Close from 'svelte-icons/md/MdClose.svelte'

    const { projects } = $page.data;
    console.log(projects);
    

    let showModal = false;
    
</script>

<div class="w-full p-10 flex flex-wrap justify-between">
    <ProjectCon onClick={() => showModal = true}/>
    {#each projects as project}
        <ProjectCon data={project}/>
    {/each}
</div>

{#if showModal}
    <CreateProjectModal onRequestClose={() => showModal = false} />
{/if}