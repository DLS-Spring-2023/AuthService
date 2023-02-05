<script lang="ts">
	import ButtonBase from "./ButtonBase.svelte";
    
    export let disabled = false;
    export let w: number | undefined = undefined;
    export let p = 2;
</script>

<ButtonBase  
    disabled={disabled}
    loading={disabled}
    _class="
        bg-indigo-600 
        {!disabled ? 'hover:brightness-150' : ''}
        {w ? `w-${w}` : ''}
        {`p-${p}`}
        h-10
    "
>
    <slot/>
</ButtonBase>