import { duckDuckGoAdapter } from "./duckduckgo";
import { googleAdapter } from "./google";
import { qwantAdapter } from "./qwant";
import type { SearchEngineAdapter, SearchEngineName } from "./types";

export const adapters: SearchEngineAdapter[] = [
  googleAdapter,
  duckDuckGoAdapter,
  qwantAdapter
];

export function getSearchEngineAdapter(
  currentUrl: string
): SearchEngineAdapter | null {
  const url = new URL(currentUrl);

  for (const adapter of adapters) {
    if (adapter.matches(url)) {
      return adapter;
    }
  }

  return null;
}

export function getSearchEngineByName(
  name: SearchEngineName
): SearchEngineAdapter | null {
  return adapters.find((adapter) => adapter.name === name) ?? null;
}

export type { SearchEngineAdapter, SearchEngineName };