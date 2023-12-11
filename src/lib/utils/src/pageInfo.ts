import { writable } from "svelte/store";

export const pageInfo = writable<PageInfo>({
  title: "",
  breadcrumbs: [{ label: "Accueil", link: "/" }],
});
