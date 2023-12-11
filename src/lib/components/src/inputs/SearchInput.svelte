<script lang="ts">
  import { nanoid } from "$lib/utils";

  export let name = "";
  export let id = nanoid();
  export let placeholder = "";
  export let value = "";
  export let disabled: boolean | null | undefined = false;
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] mb-4">
  <div class="input-group-shim">
    <span class="material-symbols-outlined">search</span>
  </div>
  <input
    type="search"
    {name}
    {id}
    {placeholder}
    {disabled}
    bind:value
    on:input
  />
</div>
