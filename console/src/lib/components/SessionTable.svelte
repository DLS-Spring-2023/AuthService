<script lang="ts">
    import { page } from '$app/stores';
    import { enhance, type SubmitFunction } from '$app/forms';
    import Revoke from 'svelte-icons/io/IoIosClose.svelte';
    import Question from 'svelte-icons/fa/FaRegQuestionCircle.svelte'
	import { invalidateAll } from '$app/navigation';

    interface Session {
        id: string,
        browser: string,
        os: string,
        location: string,
        ip: string,
        created_at: string
    }

    export let sessions: Session[] = [];

    const submit: SubmitFunction = () => {
        return () => {
            invalidateAll();
        }
    }
</script>

<div class="border-full rounded-xl text-left">
    <div class="grid grid-cols-6 pt-2 items-center">  
        <p class="pl-6 py-2 font-bold">Browser</p>
        <p class="py-2 font-bold">OS</p>
        <p class="py-2 font-bold">Location</p>
        <p class="py-2 font-bold">IP</p>
        <p class="py-2 font-bold col-span-2">Login Date</p>
        
        {#each sessions as session, i}
            <p class="grid-item text-gray-400 pl-6 {i % 2 === 0 ? 'bg-slate-800' : ''} {i === sessions.length-1 ? 'rounded-bl-xl' : ''}">{#if session.browser}{session.browser}{:else}<span class="w-6"><Question/></span>{/if}</p>
            <p class="grid-item text-gray-400 {i % 2 === 0 ? 'bg-slate-800' : ''}">{#if session.os}{session.os}{:else}<span class="w-6"><Question/></span>{/if}</p>
            <p class="grid-item text-gray-400 {i % 2 === 0 ? 'bg-slate-800' : ''}">{#if session.location}{session.location}{:else}<span class="w-6 ml-1"><Question/></span>{/if}</p>
            <p class="grid-item text-gray-400 {i % 2 === 0 ? 'bg-slate-800' : ''}">{#if session.ip}{session.ip}{:else}<span class="w-6"><Question/></span>{/if}</p>
            <p class="grid-item text-gray-400 {i % 2 === 0 ? 'bg-slate-800' : ''}">{new Date(session.created_at).toLocaleDateString()}</p>
            <div class="grid-item {i % 2 === 0 ? 'bg-slate-800' : ''} {i === sessions.length-1 ? 'rounded-br-xl' : ''}">
                <form action="/killsession" method="POST" use:enhance={submit}>
                    <input type="hidden" name="session_id" value="{session.id}" />
                    <input type="hidden" name="type" value="{$page.route.id === '/(private)/console/dashboard/sessions' ? 'account' : 'user'}"/>
                    <button class="text-gray-400 hover:text-red-600 font-bold p-1 my-1 mx-3 rounded-2xl">
                        <Revoke/>
                    </button>
                </form>
            </div>
        {/each}
    </div> 
</div>

<style>
    .grid {
        display: grid;
        grid-template-columns: auto auto auto auto auto 4rem;
    }

    .grid-item {
        display: flex;
        align-items: center;
        height: 3rem;
    }
</style>