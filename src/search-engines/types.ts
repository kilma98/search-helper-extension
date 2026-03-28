export type SearchEngineName = "google" | "duckduckgo" | "qwant";

export interface SearchEngineAdapter {
  name: SearchEngineName;
  matches(url: URL): boolean;
  getQuery(url: URL, doc: Document): string;
  getSearchUrl(query: string): string;
  getInjectionTarget(doc: Document): Element | null;
  getSearchInput(doc: Document): HTMLInputElement | null;
  getSearchForm(doc: Document): HTMLElement | null;
}