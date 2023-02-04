<script lang="ts">
    import { page } from '$app/stores';

    const { consoleUser } = $page.data;

    let editName = false;
    let editEmail = false;

    const setEditName = () => {
        editName = !editName;
        editEmail = false;
    }

    const focus = (e: HTMLInputElement) => e.focus();
    
</script>

<div class="w-full flex flex-col items-center mt-16">

    <div class="grid grid-cols-2 gap-2">
        <form class="contents">
            <label for="name" class="h-11 w-full flex items-center pr-8">Name</label>
            <div class="w-64 flex items-center">
                <input id="name" type="text" value="{consoleUser.name}">
            </div>
        </form>

        <form class="contents">
            <label for="name" class="h-11 w-full flex items-center pr-8">Email</label>
            <div class="w-64 flex items-center">
                <input id="email" type="text" value="{consoleUser.email}">
            </div>
        </form>

        <form class="contents">
            <label for="name" class="h-11 w-full flex items-center pr-8">Old password</label>
            <div class="w-64 flex items-center">
                <input id="old_password" type="password" placeholder="******">
            </div>

            <label for="name" class="h-11 w-full flex items-center pr-8">New password</label>
            <div class="w-64 flex items-center">
                <input id="new_password" type="password" placeholder="******">
            </div>

            <label for="name" class="h-11 w-full flex items-center pr-8 ">Repeat new password</label>
            <div class="w-64 flex items-center">
                <input id="re_new_password" type="password" placeholder="******">
            </div>

            <button class="login-button col-span-2 mx-32 mt-4 h-10 rounded-md">Save</button>
        </form>

        <form class="mt-8 col-span-2 flex justify-center">
            <button class="bg-red-700 p-1 rounded-md">Delete Account</button>
        </form>
    </div>

</div>