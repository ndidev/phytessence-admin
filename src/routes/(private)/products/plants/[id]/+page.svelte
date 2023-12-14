<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { SlideToggle, RadioGroup, RadioItem } from "@skeletonlabs/skeleton";

  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import { PageHeader, TextInput, QuantityInput } from "$lib/components";
  import { showToastActionResult } from "$lib/utils";

  let plant = data.plant;

  const isNew = !plant.id;
  let submitting = false;
</script>

<PageHeader
  title={plant.name || "Nouvelle plante"}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Produits", link: "/products" },
    { label: "Plantes", link: "/products/plants" },
    {
      label: plant.name || "Nouvelle plante",
      link: `/products/plants/${$page.params.id || "new"}`,
    },
  ]}
/>

<form
  method="POST"
  action={isNew ? "?/create" : "?/update"}
  use:enhance={() => {
    submitting = true;

    return async ({ result }) => {
      submitting = false;
      showToastActionResult(result, "/products/plants");
    };
  }}
>
  <!-- Nom -->
  <TextInput
    label="Nom"
    name="name"
    value={plant.name}
    placeholder="Nom de la plante"
    required
  />

  <!-- Unité -->
  <div class="label">Unité</div>
  <RadioGroup
    active="variant-filled-primary"
    hover="hover:variant-soft-primary"
  >
    <RadioItem bind:group={plant.unit} name="unit" value={"g"}>g</RadioItem>
    <RadioItem bind:group={plant.unit} name="unit" value={"L"}>L</RadioItem>
    <RadioItem bind:group={plant.unit} name="unit" value={"unit"}
      >unité</RadioItem
    >
  </RadioGroup>

  <!-- Niveaux d'alerte -->
  <fieldset
    class="p-4 mt-2 border-2 rounded-container-token border-primary-800-100-token"
  >
    <legend class="px-2">Niveaux d'alerte</legend>

    <!-- Warning low -->
    <QuantityInput
      label="Niveau d'alerte bas"
      name="warningLow"
      bind:value={plant.warningLow}
      unit={plant.unit}
    />

    <!-- Warning critical -->
    <QuantityInput
      label="Niveau d'alerte critique"
      name="warningCritical"
      bind:value={plant.warningCritical}
      unit={plant.unit}
    />
  </fieldset>

  <!-- Active -->
  <label class="label">
    <span>Active</span>
    <SlideToggle name="active" bind:checked={plant.active} size="sm" />
  </label>

  <!-- Boutons -->
  <div class="mt-4">
    <button
      type="submit"
      class="btn variant-filled-success"
      disabled={submitting}
      >{isNew ? "Créer la plante" : "Valider les modifications"}</button
    >
    {#if !isNew}
      <button
        formaction="?/delete"
        class="btn variant-ghost-error"
        disabled={submitting}>Supprimer la plante</button
      >
    {/if}
  </div>
</form>
