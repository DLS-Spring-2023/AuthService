<script lang="ts">
    import { slide } from 'svelte/transition'
    
    export let onRequestClose: () => void;

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

    const clickOutside = (node: any ) => {
        const handleClick = (event: any) => {
            if (!node.contains(event.target)) {
                // Timeout ensure event happens on open/close button before outside click event
                setTimeout(() => node.dispatchEvent(new CustomEvent("outclick")));
            }
	    };

        document.addEventListener("click", handleClick, true);

        return {
            destroy() {
                document.removeEventListener("click", handleClick, true);
            }
        };
    }

</script>

<div class="nav-dropdown" 
    transition:slide={{duration: 150}} 
    use:clickOutside
    on:outclick={onRequestClose}
>

    <!-- Projects -->
    <a href="/console/dashboard" on:click={onRequestClose}
        class="flex justify-center items-center w-full py-3 
        border-bottom bg-slate-900 hover:brightness-150"
    >
        <h4 class="font-medium">Projects</h4>
    </a>
                
    <!-- Logout -->
    <div>
        <form 
            class="flex items-center justify-center w-full h-full"
            action="/logout" method="post"
        >
            <button type="submit" class="logout-button py-3">
                <h4 class="font-medium">Logout</h4>
            </button>
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