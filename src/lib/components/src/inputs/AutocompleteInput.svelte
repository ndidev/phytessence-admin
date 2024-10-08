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
<script lang="ts" generics="IDType extends string | number">
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
  export let name = "";
  let inputId = nanoid();
  export { inputId as id };
  export let placeholder = "";
  export let data: {
    name: string;
    // id: string | number | null;
    id: IDType;
    [key: string]: any;
  }[];
  export let value: (typeof data)[number]["id"] | null;
  export let required = false;
  export let disabled: boolean | null | undefined = false;
  export let onInput: (e: Event) => void = () => {};
  export let afterSelection: (
    selectedId: (typeof data)[number]["id"],
    ...rest: any
  ) => void = () => {};

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
    const selectedId = event.detail.value as (typeof data)[number]["id"];
    value = selectedId;
    searchTerm = data.find(({ id }) => selectedId === id)?.name || "";
    afterSelection(selectedId);
  }

  export function reset() {
    searchTerm = "";
    value = null;
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
      value = null;
      onInput(e);
    }}
    on:blur={() => {
      value = data.find(({ name }) => name == nameInput.value)?.id || null;
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
    emptyState="Aucun résultat trouvé"
  />
</div>
