import type { ActionResult } from "@sveltejs/kit";
import { get } from "svelte/store";
import { toastStore } from "$lib/utils";
import { goto } from "$app/navigation";

/**
 * Afficher un Toast après la soumission d'un formulaire.
 *
 * Permet également de rediriger après la réponse du serveur.
 *
 * @param result
 * @param redirectOnSuccess Adresse cible de redirection en cas de succès.
 */
export function showToastActionResult(
  result: ActionResult,
  redirectOnSuccess?: string
) {
  if (result.type === "success") {
    get(toastStore).trigger({
      message: String(result.data?.message),
      timeout: 3 * 1000,
      background: "variant-filled-success",
    });

    if (redirectOnSuccess) {
      goto(redirectOnSuccess);
    }
  }

  if (result.type === "failure") {
    get(toastStore).trigger({
      message: String(result.data?.message || "Erreur"),
      timeout: 5 * 1000,
      background: "variant-filled-error",
    });
  }
}
