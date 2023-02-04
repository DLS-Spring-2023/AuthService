<script lang="ts">
    import logo from "$lib/assets/logo.png";
    import { page } from '$app/stores';
    import { slide } from 'svelte/transition'
    import ChevronDown from 'svelte-icons/fa/FaChevronDown.svelte'
    import ChevronUp from 'svelte-icons/fa/FaChevronUp.svelte'
	import Avatar from "$lib/components/Avatar.svelte";
	import { onMount } from "svelte";
    import toast, { ToastType } from '$lib/store/toast';

    let showDropdown = false;

    let theme = '';
    if (typeof localStorage !== 'undefined') {
        theme = localStorage.theme;
    }
    
    const selectTheme = (t: string) => {
        theme = t;
        if (t === 'dark') {
            document.documentElement.classList.add('dark')
            localStorage.theme = t;
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.theme = t;
        }
    }

    // Display toasts
    onMount(() => {
        if (sessionStorage && sessionStorage.signinEvent) {
            setTimeout(() => {
                toast.push({ type: ToastType.success, message: 'Successfully logged in!', closeAfter: 2500 });
                delete sessionStorage.signinEvent;
            }, 500);
        }

        if (sessionStorage && sessionStorage.signupEvent) {
            setTimeout(() => {
                toast.push({ type: ToastType.success, message: 'Successfully created new account!', closeAfter: 2500 });
                delete sessionStorage.signupEvent;
            }, 500);
        }
    });
    
</script>

<nav>
    <div>
        <a href='/' class='flex items-center text-gray-900 dark:text-slate-100 ml-8'>
            <img src={logo} alt="logo" class="w-5 rounded-md"/>
            <h4 class="ml-2 font-medium text-sky-300" style="font-size: 1.3em">{$page.data.platformName}</h4>
        </a>
    </div>
    
    <div class="h-full relative max-w-sm">
        <button on:click={() => showDropdown = !showDropdown} class="border-left h-full flex items-center px-6">
            <Avatar><h3 class="font-medium">{$page.data.consoleUser.name[0]}</h3></Avatar>
            <p class="ml-3 text-sm dark:text-slate-600 truncate" style="max-width: 14rem">{$page.data.consoleUser.name.split(' ')[0]}</p>
            <div class="w-2 ml-12">
                {#if showDropdown}<ChevronUp/>{:else}<ChevronDown/>{/if}
            </div>
        </button>

        <!-- Dropdown -->
        {#if showDropdown}
            <div class="nav-dropdown" transition:slide={{duration: 150}}>
                
                <!-- Logout -->
                <div>
                    <form 
                        class="flex items-center justify-center w-full h-full"
                        action="/logout" method="post"
                    >
                        <input type="submit" class="logout-button" value="Logout">
                    </form>
                </div>

                <!-- Select Theme -->
                <div class="flex flex-col items-center py-6 border-top">
                    <h3>Theme</h3>
                    <div class="flex mt-2">
                        <div class="flex flex-col items-center mr-4">
                            <label for="light">Light</label>
                            <input 
                                on:change={() => selectTheme('light')} 
                                class="hover:cursor-pointer"
                                id="light" 
                                type="radio" 
                                name="theme" 
                                value="light" 
                                checked={theme === 'light'} 
                            >
                        </div>
                        <div class="flex flex-col items-center ml-4">
                            <label for="dark">Dark</label>
                            <input 
                                on:change={() => selectTheme('dark')} 
                                class="hover:cursor-pointer"
                                id="dark" 
                                type="radio" 
                                name="theme" 
                                value="dark" 
                                checked={theme === 'dark'} 
                            >
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>

</nav>

<slot/>

