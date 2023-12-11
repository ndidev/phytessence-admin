<script lang="ts">
  import { onMount } from "svelte";

  import autosize from "autosize";
  import { nanoid } from "$lib/utils";

  let input: HTMLTextAreaElement;

  export let label = "";
  export let name: string;
  export let id = nanoid();
  export let placeholder = "";
  export let value: string | null;
  export let cols = 30;
  export let rows = 3;
  export let required = false;
  export let disabled: boolean | null | undefined = false;

  onMount(() => {
    autosize(input);
  });
</script>

<div>
  <label for={id} class="label" class:required>{label}</label>
  <textarea
    bind:this={input}
    class="textarea"
    {name}
    {id}
    {cols}
    {rows}
    {placeholder}
    {value}
    {required}
    {disabled}
  />
</div>
