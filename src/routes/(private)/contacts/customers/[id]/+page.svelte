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

  let { customer, numberOfOrders } = data;

  const isNew = !customer.id;
  let submitting = false;
</script>

<PageHeader
  title={customer.name || "Nouveau client"}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Contacts", link: "/contacts" },
    { label: "Clients", link: "/contacts/customers" },
    {
      label: customer.name || "Nouveau client",
      link: `/contacts/customers/${$page.params.id || "new"}`,
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
      showToastActionResult(result, "/contacts/customers");
    };
  }}
>
  <!-- Nom -->
  <TextInput
    label="Nom"
    name="name"
    value={customer.name}
    placeholder="Nom du client"
    required
  />

  <!-- Pro -->
  <ToggleInput label="Professionnel" name="pro" checked={customer.pro} />

  <!-- Commentaires -->
  <Textarea label="Commentaires" name="comments" value={customer.comments} />

  <!-- Active -->
  <ToggleInput label="Actif" name="active" checked={customer.active} />

  <!-- Boutons -->
  <div class="mt-4">
    <button
      type="submit"
      class="btn variant-filled-success"
      disabled={submitting}
      >{isNew ? "Créer le client" : "Valider les modifications"}</button
    >
    {#if !isNew}
      <button
        formaction="?/delete"
        class="btn variant-ghost-error"
        disabled={submitting || numberOfOrders > 0}>Supprimer le client</button
      >
    {/if}
  </div>
</form>
