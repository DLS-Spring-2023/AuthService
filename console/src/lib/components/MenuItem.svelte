<script lang="ts">

    export let href: string;
</script>

<div class="flex flex-col items-center mx-4">
    <a href={href} class="hover:!text-indigo-700 p-2 rounded-md hover:bg-gray-800"><slot/></a>
    <div class="w-11/12 h-1 mt-1 rounded-sm bg-indigo-700"></div>
</div>