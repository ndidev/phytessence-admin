<script lang="ts">
  import type { ActionData } from "./$types";

  export let form: ActionData;

  import { PageHeader, TextInput, PasswordInput } from "$lib/components";
</script>

<PageHeader
  title="Phyt'Essence Admin"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Identification", link: "/login" },
  ]}
/>

<main>
  <form
    class="card mt-4 mx-auto p-4 w-full max-w-md"
    method="POST"
    action="?/login"
  >
    <TextInput
      label="Identifiant"
      name="login"
      value=""
      autocomplete="username"
      required
    />

    <PasswordInput
      label="Mot de passe"
      name="password"
      autocomplete="current-password"
      required
    />

    <button type="submit" class="btn variant-filled-primary w-full mt-4"
      >Se connecter</button
    >
  </form>

  {#if form?.error}
    <div class="card mx-4 p-2 bg-error-500 text-on-primary-token text-center">
      {form.error.message}
    </div>
  {/if}
</main>
