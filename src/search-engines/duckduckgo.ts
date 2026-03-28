import type { SearchEngineAdapter } from "./types";

export const duckDuckGoAdapter: SearchEngineAdapter = {
  name: "duckduckgo",

  matches(url: URL) {
    return (
      url.hostname === "duckduckgo.com" ||
      url.hostname === "www.duckduckgo.com"
    );
  },

  getQuery(url: URL) {
    return url.searchParams.get("q")?.trim() ?? "";
  },

  getSearchUrl(query: string) {
    return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  },

  getInjectionTarget(doc: Document) {
    return (
      doc.querySelector("[data-testid='mainline']") ??
      doc.querySelector("main") ??
      doc.body
    );
  },

  getSearchInput(doc: Document) {
    return (
      doc.querySelector<HTMLInputElement>('input[name="q"]') ??
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