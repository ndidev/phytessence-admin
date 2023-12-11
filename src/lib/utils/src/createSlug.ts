import { normalize } from "$lib/utils";

/**
 * Créer un slug à partir d'un nom.
 *
 * @param name
 */
export function createSlug(name: string): string {
  return normalize(name)
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s']/g, "-")
    .replace(/[\(\)"]/g, "");
}
