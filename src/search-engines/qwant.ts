import type { SearchEngineAdapter } from "./types";

export const qwantAdapter: SearchEngineAdapter = {
  name: "qwant",

  matches(url: URL) {
    return (
      url.hostname === "www.qwant.com" ||
      url.hostname === "qwant.com"
    );
  },

  getQuery(url: URL) {
    return url.searchParams.get("q")?.trim() ?? "";
  },

  getSearchUrl(query: string) {
    return `https://www.qwant.com/?q=${encodeURIComponent(query)}`;
  },

  getInjectionTarget(doc: Document) {
    return doc.querySelector("main") ?? doc.body;
  },

  getSearchInput(doc: Document) {
    return (
      doc.querySelector<HTMLInputElement>('input[name="q"]') ??
      doc.querySelector<HTMLInputElement>('input[type="search"]') ??
      doc.querySelector<HTMLInputElement>('input[type="text"]')
    );
  },

  getSearchForm(doc: Document) {
    return (
      doc.querySelector<HTMLElement>("form") ??
      doc.querySelector<HTMLElement>("header")
    );
  }
};