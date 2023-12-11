<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import {
    PageHeader,
    TextInput,
    Textarea,
    ToggleInput,
  } from "$lib/components";
  import { showToastActionResult } from "$lib/utils";

  let { supplier, numberOfOrders } = data;

  const isNew = !supplier.id;
  let submitting = false;
</script>

<PageHeader
  title={supplier.name || "Nouveau fournisseur"}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Contacts", link: "/contacts" },
    { label: "Fournisseurs", link: "/contacts/suppliers" },
    {
      label: supplier.name || "Nouveau fournisseur",
      link: `/contacts/suppliers/${$page.params.id || "new"}`,
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
      showToastActionResult(result, "/contacts/suppliers");
    };
  }}
>
  <!-- Nom -->
  <TextInput
    label="Nom"
    name="name"
    value={supplier.name}
    placeholder="Nom du fournisseur"
    required
  />

  <!-- Commentaires -->
  <Textarea label="Commentaires" name="comments" value={supplier.comments} />

  <!-- Active -->
  <ToggleInput label="Actif" name="active" checked={supplier.active} />

  <!-- Boutons -->
  <div class="mt-4">
    <button
      type="submit"
      class="btn variant-filled-success"
      disabled={submitting}
      >{isNew ? "Créer le fournisseur" : "Valider les modifications"}</button
    >
    {#if !isNew}
      <button
        formaction="?/delete"
        class="btn variant-ghost-error"
        disabled={submitting || numberOfOrders > 0}
        >Supprimer le fournisseur</button
      >
    {/if}
  </div>
</form>
