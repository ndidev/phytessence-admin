<script lang="ts">
  import { nanoid } from "$lib/utils";

  export let label = "";
  export let name: string;
  export let id: string = nanoid();
  export let value: string | null = null;
  export let placeholder = "";
  export let minlength: number | null | undefined = null;
  export let maxlength: number | null | undefined = null;
  export let pattern: string | null | undefined = null;
  export let autocomplete: AutoFillBase | AutoFillNormalField = "off";
  export let disabled: boolean | null | undefined = false;
  export let required = false;
  export let input: HTMLInputElement | undefined = undefined;
</script>

<div>
  <label for={id} class="label" class:required>{label}</label>
  <input
    bind:this={input}
    type="password"
    class="input"
    {name}
    {id}
    bind:value
    {placeholder}
    {minlength}
    {maxlength}
    {pattern}
    {autocomplete}
    {disabled}
    {required}
  />
</div>
