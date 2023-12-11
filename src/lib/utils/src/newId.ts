import { nanoid } from "$lib/utils";

export function createNewId() {
  return "new_" + nanoid();
  // return 999000 + Math.floor(Math.random() * 1e3);
}

export function isNewId(id: string | number) {
  return String(id).startsWith("new_");
  // return /999\d{3}/.test(String(id));
}
