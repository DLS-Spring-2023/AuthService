<script lang="ts">
    import { page } from '$app/stores';
    import ChartBar from 'svelte-icons/fa/FaRegChartBar.svelte';
    import Users from 'svelte-icons/fa/FaUserFriends.svelte';
    import Settings from 'svelte-icons/md/MdSettings.svelte';
	import NavButton from '$lib/components/buttons/NavButton.svelte';

    $: project = $page.data.project;
     
    let title: string;

    $: switch($page.url.pathname.replace(`/console/project/${project.id}`, '')) {
        case project.id: 
            title = project.name;
            break;
        case '/settings':
            title = 'Settings';
            break;
        default: 
            title = project.name;
    }
</script>

<div class="relative w-full min-h-full flex">

    <!-- Side bar -->
    <div class="sidebar">
        <div class="h-full flex flex-col justify-between">
            <div class="flex flex-col">
                <NavButton href="/console/project/{project.id}"><div class="w-5 mr-2"><ChartBar/></div>Overview</NavButton>
                <NavButton href="/console/project/{project.id}/auth"><div class="w-5 mr-2"><Users/></div>Auth</NavButton>
            </div>
            <div>
                <NavButton href="/console/project/{project.id}/settings"><div class="w-5 mr-2"><Settings/></div>Settings</NavButton>
            </div>
        </div>
    </div>

    <div class="w-full h-full" style="padding-left: 200px">
        <div class="bg-dark brightness-110 h-44 border-bottom pt-16 pl-20">
            <h2 class="font-medium">{title}</h2>
        </div>
        <slot/>
    </div>
</div>