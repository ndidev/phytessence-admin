<script lang="ts">
  import { afterUpdate } from "svelte";
  import { nanoid } from "$lib/utils";

  export let label = "Quantité";
  export let name: string;
  export let id = nanoid();
  export let value: number | null;
  export let unit: string = "";
  export let min: number | null = 0;
  export let max: number | null = null;
  export let step: number = 0.001;
  export let required = false;
  export let disabled: boolean | null | undefined = false;
  export let datalistId = "";

  afterUpdate(() => {
    switch (unit) {
      case "€":
      case "%":
        step = 0.01;
        break;

      case "unit":
        step = 1;
        break;

      default:
        step ||= 0.001;
        break;
    }
  });
</script>

<div>
  <label for={id} class="label" class:required
    >{label} {unit ? "(" + unit + ")" : ""}</label
  >
  <div class="input-group input-group-divider grid-cols-[1fr_auto]">
    <input
      type="number"
      {name}
      {id}
      class="text-right"
      {value}
      {step}
      {min}
      {max}
      {disabled}
      {required}
      list={datalistId}
    />
    {#if unit}
      <div class="input-group-shim">
        <span>{unit}</span>
      </div>
    {/if}
  </div>
</div>

<style></style>
