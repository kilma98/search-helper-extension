import type { SearchMode } from "./query-generator";
import type { SearchEngineName } from "./search-engines";

export interface CustomPreset {
  id: string;
  name: string;
  mode: SearchMode;
  templates: string[];
}

const PRESETS_STORAGE_KEY = "search-helper-custom-presets";
const DEFAULT_ENGINE_STORAGE_KEY = "search-helper-default-engine";

export async function getCustomPresets(): Promise<CustomPreset[]> {
  const result = await chrome.storage.local.get(PRESETS_STORAGE_KEY);
  return (result[PRESETS_STORAGE_KEY] as CustomPreset[] | undefined) ?? [];
}

export async function saveCustomPresets(
  presets: CustomPreset[]
): Promise<void> {
  await chrome.storage.local.set({
    [PRESETS_STORAGE_KEY]: presets
  });
}

export async function addCustomPreset(preset: CustomPreset): Promise<void> {
  const presets = await getCustomPresets();
  presets.push(preset);
  await saveCustomPresets(presets);
}

export async function deleteCustomPreset(id: string): Promise<void> {
  const presets = await getCustomPresets();
  const nextPresets = presets.filter((preset) => preset.id !== id);
  await saveCustomPresets(nextPresets);
}

export async function getDefaultEngine(): Promise<SearchEngineName> {
  const result = await chrome.storage.local.get(DEFAULT_ENGINE_STORAGE_KEY);
  const value = result[DEFAULT_ENGINE_STORAGE_KEY];

  if (
    value === "google" ||
    value === "duckduckgo" ||
    value === "qwant"
  ) {
    return value;
  }

  return "google";
}

export async function saveDefaultEngine(
  engine: SearchEngineName
): Promise<void> {
  await chrome.storage.local.set({
    [DEFAULT_ENGINE_STORAGE_KEY]: engine
  });
}