import type { SearchEngineAdapter } from "./types";

export const googleAdapter: SearchEngineAdapter = {
  name: "google",

  matches(url: URL) {
    return (
      url.hostname === "www.google.com" ||
      url.hostname === "google.com" ||
      url.hostname.endsWith(".google.com") ||
      url.hostname === "www.google.tn" ||
      url.hostname === "google.tn" ||
      url.hostname === "www.google.fr" ||
      url.hostname === "google.fr"
    );
  },

  getQuery(url: URL) {
    return url.searchParams.get("q")?.trim() ?? "";
  },

  getSearchUrl(query: string) {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  },

  getInjectionTarget(doc: Document) {
    return (
      doc.querySelector("#search") ??
      doc.querySelector("#rcnt") ??
      doc.querySelector("main") ??
      doc.body
    );
  },

  getSearchInput(doc: Document) {
    return (
      doc.querySelector<HTMLInputElement>('textarea[name="q"]') ??
      doc.querySelector<HTMLInputElement>('input[name="q"]')
    );
  },

  getSearchForm(doc: Document) {
    return (
      doc.querySelector<HTMLElement>("form[role='search']") ??
      doc.querySelector<HTMLElement>("form")
    );
  }
};