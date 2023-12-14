<script lang="ts">
  import type { PageData, ActionData } from "./$types";

  export let data: PageData;
  export let form: ActionData;

  const { user } = data;

  import {
    PageHeader,
    TextInput,
    EmailInput,
    PasswordInput,
  } from "$lib/components";

  let newPassword = "";
</script>

<PageHeader
  title="Paramètres du compte"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Paramètres du compte", link: "/user" },
  ]}
/>

{#if form?.success}
  <div class="card mb-4 p-4 bg-success-100 text-success-800 text-center">
    Les changements ont été appliqués.
  </div>
{/if}

{#if form?.errors.general}
  <div class="card mb-4 p-4 bg-error-100 text-error-800 text-center">
    Une erreur non gérée est survenue.
  </div>
{/if}

<form method="POST" class="grid gap-4">
  <div>
    <TextInput
      label="Nom"
      value={form?.name || user.name}
      name="name"
      maxlength={255}
      required
    />

    {#if form?.errors.nameMissing}
      <div class="card my-2 p-2 bg-error-100 text-error-800">
        Le nom est obligatoire.
      </div>
    {/if}
  </div>

  <div>
    <TextInput
      label="Identifiant"
      value={form?.login || user.login}
      name="login"
      maxlength={255}
      required
    />

    {#if form?.errors.loginMissing}
      <div class="card my-2 p-2 bg-error-100 text-error-800">
        L'identifiant' est obligatoire.
      </div>
    {/if}
  </div>

  <div>
    <EmailInput
      label="E-mail"
      value={form?.email || user.email}
      name="email"
      required
    />

    {#if form?.errors.emailMissing}
      <div class="card my-2 p-2 bg-error-100 text-error-800">
        L'adresse e-mail est obligatoire.
      </div>
    {/if}
  </div>

  <details
    class=" p-2 ring-2 ring-primary-100 rounded-container-token hover:cursor-pointer"
    open={form?.errors.currentPasswordMissing ||
      form?.errors.currentPasswordIncorrect ||
      form?.errors.passwordMismatch}
  >
    <summary class="h5">Changement de mot de passe</summary>
    <fieldset class="grid gap-2">
      <div>
        <PasswordInput
          label="Mot de passe actuel"
          name="currentPassword"
          autocomplete="current-password"
          required={newPassword !== ""}
        />

        {#if form?.errors.currentPasswordMissing}
          <div class="card my-2 p-2 bg-error-100 text-error-800">
            Le mot de passe actuel doit être renseigné pour pouvoir le modifier.
          </div>
        {/if}

        {#if form?.errors.currentPasswordIncorrect}
          <div class="card my-2 p-2 bg-error-100 text-error-800">
            Le mot de passe actuel est erroné.
          </div>
        {/if}
      </div>

      <div>
        <PasswordInput
          label="Nouveau mot de passe"
          bind:value={newPassword}
          name="newPassword"
          autocomplete="new-password"
        />
      </div>

      <div>
        <PasswordInput
          label="Retaper le nouveau mot de passe"
          name="confirmPassword"
          autocomplete="new-password"
          required={newPassword !== ""}
        />

        {#if form?.errors.passwordMismatch}
          <div class="card my-2 p-2 bg-error-100 text-error-800">
            Le nouveau mot de passe n'a pas été correctement retapé.
          </div>
        {/if}
      </div>
    </fieldset>
  </details>

  <button type="submit" class="btn variant-filled-primary"
    >Enregistrer les modifications</button
  >
</form>
