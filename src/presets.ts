import type { QuerySuggestion, SearchMode } from "./query-generator";
import type { CustomPreset } from "./storage";

function applyTemplate(template: string, query: string): string {
  return template.replaceAll("{query}", query);
}

function prettifyTemplateLabel(template: string): string {
  if (template.length <= 40) {
    return template;
  }

  return `${template.slice(0, 37)}...`;
}

export function buildSuggestionsFromPreset(
  query: string,
  preset: CustomPreset
): QuerySuggestion[] {
  return preset.templates
    .map((template) => template.trim())
    .filter(Boolean)
    .map((template) => ({
      label: `${preset.name} · ${prettifyTemplateLabel(template)}`,
      query: applyTemplate(template, query),
      explanation: `Generated from your custom preset "${preset.name}".`
    }));
}

export function makePresetId(): string {
  return crypto.randomUUID();
}

export function isSearchMode(value: string): value is SearchMode {
  return value === "general" || value === "academic" || value === "technical";
}