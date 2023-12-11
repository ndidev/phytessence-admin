<script lang="ts">
  import { nanoid } from "$lib/utils";

  export let label = "";
  export let name: string;
  export let id: string = nanoid();
  export let value: string | null;
  export let placeholder = "E-mail";
  export let autocomplete:
    | AutoFillBase
    | AutoFillAddressKind
    | AutoFillContactField
    | AutoFillContactKind
    | AutoFillCredentialField
    | AutoFillNormalField = "off";
  export let disabled: boolean | null | undefined = false;
  export let required = false;
</script>

<div>
  <label for={id} class="label" class:required>{label}</label>
  <input
    type="email"
    class="input"
    {name}
    {id}
    bind:value
    {placeholder}
    {autocomplete}
    {disabled}
    {required}
  />
</div>
