<script>
    import { page } from '$app/stores';
</script>

<div class="relative w-full h-40 bg-dark brightness-110 border-bottom">
    
    <div class="pt-6 pl-10">
        <h2>Welcome {$page.data.consoleUser.name}</h2>
    </div>

    <!-- Options Menu -->
    <div class="absolute flex w-full justify-center bottom-0">
        <div class="flex flex-col items-center">
            <a href="/" class="hover:!text-indigo-700 p-2 rounded-md hover:bg-gray-800">My Projects</a>
            <div class="w-11/12 h-1 mt-1 rounded-sm bg-indigo-700"></div>
        </div>
    </div>
</div>

<slot/>