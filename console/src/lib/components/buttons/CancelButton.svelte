<script lang="ts">
	import ButtonBase from "./ButtonBase.svelte";
    
    export let onClick: () => void;
    export let disabled = false;
    export let w: number | undefined = undefined;
    export let p = 2;
</script>

<ButtonBase 
    type="button" 
    disabled={disabled}
    onClick={onClick}
    _class="
        bg-slate-600 
        {!disabled ? 'hover:brightness-150' : ''}
        {w ? `w-${w}` : ''}
        {`p-${p}`}
    "
>
    <slot/>
</ButtonBase>