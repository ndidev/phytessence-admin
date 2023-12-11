import { writable } from "svelte/store";
import type { ToastStore } from "@skeletonlabs/skeleton";

/**
 * Initialiser le toastStore dans le root layout,
 * pour le rendre disponible dans toute l'application.
 */
export const toastStore = writable<ToastStore>();
