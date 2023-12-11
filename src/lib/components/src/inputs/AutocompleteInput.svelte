<!-- 
  @component
  
  Usage:
  ```tsx
  <AutocompleteInput
    label: string
    data: TypeAutocomplete
    value: ID
    name: string
    placeholder: string = {name} + "..."
    id?: string = nanoid()
    required?: boolean = false
  />
  ```
 -->
<script lang="ts">
  import {
    Autocomplete,
    type AutocompleteOption,
    popup,
    type PopupSettings,
  } from "@skeletonlabs/skeleton";

  import { nanoid } from "$lib/utils";

  let nameInput: HTMLInputElement;
  let idInput: HTMLInputElement;

  export let label = "";
  export let name: string;
  let inputId = nanoid();
  export { inputId as id };
  export let placeholder = "";
  export let data: { name: string; id: ID; [key: string]: any }[];
  export let value: ID;
  export let required = false;
  export let disabled: boolean | null | undefined = false;
  export let onInput: (e: Event) => void = () => {};

  let searchTerm = data.find(({ id }) => value === id)?.name || "";

  $: autocompleteOptions = data.map((item) => ({
    label: item.name,
    value: item.id,
  })) as AutocompleteOption[];

  const popupSettings = {
    event: "focus-click",
    target: "autocomplete-" + inputId,
    placement: "bottom-start",
  } satisfies PopupSettings;

  function onSelection(event: CustomEvent<AutocompleteOption>): void {
    const selectedId = event.detail.value as (typeof data)[0]["id"];
    value = selectedId;
    searchTerm = data.find(({ id }) => selectedId === id)?.name || "";
  }

  export function reset() {
    searchTerm = "";
    value = "";
  }
</script>

<div>
  <label for={inputId} class="label" class:required>{label}</label>
  <input
    bind:this={nameInput}
    class="input autocomplete"
    type="search"
    id={inputId}
    autocomplete="off"
    bind:value={searchTerm}
    placeholder={placeholder || label + "..."}
    use:popup={popupSettings}
    on:input={(e) => {
      value = "";
      onInput(e);
    }}
    on:blur={() => {
      value = String(
        data.find(({ name }) => name == nameInput.value)?.id || ""
      );
    }}
    {required}
    {disabled}
  />
</div>
<input
  bind:this={idInput}
  type="hidden"
  {name}
  bind:value
  {required}
  readonly
/>

<div
  class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto"
  data-popup="autocomplete-{inputId}"
  tabindex="-1"
>
  <Autocomplete
    bind:input={searchTerm}
    options={autocompleteOptions}
    on:selection={onSelection}
  />
</div>
