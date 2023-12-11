import { writable } from "svelte/store";
import type { ModalStore } from "@skeletonlabs/skeleton";

/**
 * Initialiser le modalStore dans le root layout,
 * pour le rendre disponible dans toute l'application.
 */
export const modalStore = writable<ModalStore>();
