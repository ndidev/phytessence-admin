<script lang="ts">
  import { nanoid } from "$lib/utils";

  export let label = "";
  export let name: string;
  export let id = nanoid();
  export let value: string | null;
  export let required = false;

  let input: HTMLInputElement;

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case "Backspace":
      case "Delete":
        event.preventDefault();
        input.value = "";
        break;

      default:
        break;
    }
  }
</script>

<div>
  <label for={id} class="label" class:required>{label}</label>
  <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
    <div class="input-group-shim">
      <button
        type="button"
        class="button"
        title="Aujourd'hui"
        on:click={() =>
          (input.value = new Date()
            .toLocaleDateString("fr-FR")
            .split("/")
            .reverse()
            .join("-"))}
        ><span class="material-symbols-outlined">today</span></button
      >
    </div>
    <input
      bind:this={input}
      type="date"
      {name}
      {id}
      {value}
      {required}
      on:keydown={handleKeydown}
    />
    <div class="input-group-shim">
      <button
        type="button"
        class="button"
        title="Effacer"
        on:click={() => (input.value = "")}
        ><span class="material-symbols-outlined">backspace</span></button
      >
    </div>
  </div>
</div>

<style>
  .button {
    padding-left: 0;
    padding-right: 0;
  }
</style>
