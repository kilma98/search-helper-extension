import "./style.css";
import {
  generateQueries,
  normalizeSearchQuery,
  uniqueSuggestions,
  type QuerySuggestion,
  type SearchMode
} from "./query-generator";
import { adapters } from "./search-engines";
import type { SearchEngineName } from "./search-engines";
import {
  addCustomPreset,
  deleteCustomPreset,
  getCustomPresets,
  getDefaultEngine,
  saveDefaultEngine,
  type CustomPreset
} from "./storage";
import {
  buildSuggestionsFromPreset,
  isSearchMode,
  makePresetId
} from "./presets";

type QuickFilter =
  | "all"
  | "pdfs"
  | "academic"
  | "reports"
  | "github"
  | "docs";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = `
  <main class="container">
    <div class="topbar">
      <h1>Search Helper</h1>
      <span class="shortcut-hint">Ctrl/⌘ + Shift + K</span>
    </div>

    <label class="label" for="query">Search query</label>
    <input
      id="query"
      class="input"
      type="text"
      placeholder="e.g. hydroponics africa"
    />

    <label class="label" for="mode">Built-in mode</label>
    <select id="mode" class="select">
      <option value="general">General</option>
      <option value="academic">Academic</option>
      <option value="technical">Technical</option>
    </select>

    <label class="label" for="preset">Custom preset</label>
    <select id="preset" class="select">
      <option value="">None</option>
    </select>

    <label class="label" for="engine">Search engine</label>
    <select id="engine" class="select">
      ${adapters
        .map(
          (adapter) =>
            `<option value="${adapter.name}">${adapter.name}</option>`
        )
        .join("")}
    </select>

    <div class="quick-filters" id="quick-filters">
      <button class="filter-chip active" data-filter="all">All</button>
      <button class="filter-chip" data-filter="pdfs">PDFs</button>
      <button class="filter-chip" data-filter="academic">Academic</button>
      <button class="filter-chip" data-filter="reports">Reports</button>
      <button class="filter-chip" data-filter="github">GitHub</button>
      <button class="filter-chip" data-filter="docs">Docs</button>
    </div>

    <div class="actions">
      <button id="generate" class="button primary">Generate</button>
      <button id="open-all" class="button secondary">Open all</button>
      <button id="copy-all" class="button secondary">Copy all</button>
    </div>

    <details class="preset-builder">
      <summary>Create custom preset</summary>

      <label class="label" for="preset-name">Preset name</label>
      <input id="preset-name" class="input" type="text" placeholder="e.g. NGO research" />

      <label class="label" for="preset-mode">Preset mode</label>
      <select id="preset-mode" class="select">
        <option value="general">General</option>
        <option value="academic">Academic</option>
        <option value="technical">Technical</option>
      </select>

      <label class="label" for="preset-templates">Templates (one per line)</label>
      <textarea
        id="preset-templates"
        class="textarea"
        placeholder='Examples:
"{query}" filetype:pdf
site:.org {query}
{query} report OR study'
      ></textarea>

      <button id="save-preset" class="button primary">Save preset</button>
      <p id="preset-feedback" class="feedback"></p>

      <div>
        <h2 class="section-title">Saved presets</h2>
        <div id="saved-presets" class="saved-presets"></div>
      </div>
    </details>

    <section id="results" class="results"></section>
  </main>
`;

const queryInputEl = document.querySelector<HTMLInputElement>("#query");
const modeSelectEl = document.querySelector<HTMLSelectElement>("#mode");
const presetSelectEl = document.querySelector<HTMLSelectElement>("#preset");
const engineSelectEl = document.querySelector<HTMLSelectElement>("#engine");
const generateButtonEl = document.querySelector<HTMLButtonElement>("#generate");
const openAllButtonEl = document.querySelector<HTMLButtonElement>("#open-all");
const copyAllButtonEl = document.querySelector<HTMLButtonElement>("#copy-all");
const resultsContainerEl = document.querySelector<HTMLElement>("#results");
const quickFiltersEl = document.querySelector<HTMLElement>("#quick-filters");

const presetNameInputEl =
  document.querySelector<HTMLInputElement>("#preset-name");
const presetModeSelectEl =
  document.querySelector<HTMLSelectElement>("#preset-mode");
const presetTemplatesEl =
  document.querySelector<HTMLTextAreaElement>("#preset-templates");
const savePresetButtonEl =
  document.querySelector<HTMLButtonElement>("#save-preset");
const presetFeedbackEl =
  document.querySelector<HTMLElement>("#preset-feedback");
const savedPresetsEl =
  document.querySelector<HTMLElement>("#saved-presets");

if (
  !queryInputEl ||
  !modeSelectEl ||
  !presetSelectEl ||
  !engineSelectEl ||
  !generateButtonEl ||
  !openAllButtonEl ||
  !copyAllButtonEl ||
  !resultsContainerEl ||
  !quickFiltersEl ||
  !presetNameInputEl ||
  !presetModeSelectEl ||
  !presetTemplatesEl ||
  !savePresetButtonEl ||
  !presetFeedbackEl ||
  !savedPresetsEl
) {
  throw new Error("Popup elements not found");
}

const queryInput = queryInputEl;
const modeSelect = modeSelectEl;
const presetSelect = presetSelectEl;
const engineSelect = engineSelectEl;
const generateButton = generateButtonEl;
const openAllButton = openAllButtonEl;
const copyAllButton = copyAllButtonEl;
const resultsContainer = resultsContainerEl;
const quickFilters = quickFiltersEl;

const presetNameInput = presetNameInputEl;
const presetModeSelect = presetModeSelectEl;
const presetTemplates = presetTemplatesEl;
const savePresetButton = savePresetButtonEl;
const presetFeedback = presetFeedbackEl;
const savedPresets = savedPresetsEl;

let currentSuggestions: QuerySuggestion[] = [];
let customPresets: CustomPreset[] = [];
let activeQuickFilter: QuickFilter = "all";

function getEngineUrl(query: string, engineName: SearchEngineName): string {
  const adapter = adapters.find((item) => item.name === engineName);

  if (!adapter) {
    throw new Error(`Unknown search engine: ${engineName}`);
  }

  return adapter.getSearchUrl(query);
}

function getSelectedPreset(): CustomPreset | null {
  const presetId = presetSelect.value;
  if (!presetId) {
    return null;
  }

  return customPresets.find((preset) => preset.id === presetId) ?? null;
}

function buildQuickFilteredSuggestions(
  query: string,
  filter: QuickFilter
): QuerySuggestion[] {
  const general = generateQueries(query, "general");
  const academic = generateQueries(query, "academic");
  const technical = generateQueries(query, "technical");

  switch (filter) {
    case "pdfs":
      return uniqueSuggestions([
        ...academic.filter((item) => item.query.includes("filetype:pdf")),
        ...general.filter((item) => item.query.includes("filetype:pdf"))
      ]);

    case "academic":
      return academic;

    case "reports":
      return uniqueSuggestions([
        ...academic.filter(
          (item) =>
            item.label.toLowerCase().includes("report") ||
            item.query.toLowerCase().includes("report")
        ),
        {
          label: "Reports",
          query: `"${query}" report OR assessment OR white paper`,
          explanation: "Focuses on reports, assessments, and white papers."
        }
      ]);

    case "github":
      return uniqueSuggestions([
        ...technical.filter(
          (item) =>
            item.label.toLowerCase().includes("github") ||
            item.query.includes("site:github.com")
        ),
        {
          label: "GitHub results",
          query: `${query} site:github.com`,
          explanation: "Finds repositories and code discussions."
        }
      ]);

    case "docs":
      return uniqueSuggestions([
        ...technical.filter(
          (item) =>
            item.label.toLowerCase().includes("documentation") ||
            item.query.toLowerCase().includes("documentation") ||
            item.query.toLowerCase().includes("inurl:docs")
        ),
        {
          label: "Official documentation",
          query: `"${query}" documentation`,
          explanation: "Pushes results toward official docs and manuals."
        }
      ]);

    case "all":
    default:
      return [];
  }
}

function getSuggestionsForCurrentSelection(): QuerySuggestion[] {
  const query = normalizeSearchQuery(queryInput.value);

  if (!query) {
    return [];
  }

  if (activeQuickFilter !== "all") {
    return buildQuickFilteredSuggestions(query, activeQuickFilter);
  }

  const selectedPreset = getSelectedPreset();

  if (selectedPreset) {
    const presetSuggestions = buildSuggestionsFromPreset(query, selectedPreset);
    return uniqueSuggestions(presetSuggestions);
  }

  const mode = modeSelect.value as SearchMode;
  return generateQueries(query, mode);
}

function renderSuggestions(suggestions: QuerySuggestion[]) {
  resultsContainer.innerHTML = "";

  if (suggestions.length === 0) {
    resultsContainer.innerHTML =
      `<p class="empty">Enter a query to get suggestions.</p>`;
    return;
  }

  for (const suggestion of suggestions) {
    const card = document.createElement("article");
    card.className = "card";

    const title = document.createElement("h2");
    title.className = "card-title";
    title.textContent = suggestion.label;

    const explanation = document.createElement("p");
    explanation.className = "card-explanation";
    explanation.textContent = suggestion.explanation;

    const query = document.createElement("code");
    query.className = "card-query";
    query.textContent = suggestion.query;

    const buttonRow = document.createElement("div");
    buttonRow.className = "card-actions";

    const openButton = document.createElement("button");
    openButton.className = "button primary";
    openButton.textContent = "Open";
    openButton.addEventListener("click", () => {
      const engine = engineSelect.value as SearchEngineName;
      chrome.runtime.sendMessage({
        action: "openSearch",
        url: getEngineUrl(suggestion.query, engine)
      });
    });

    const copyButton = document.createElement("button");
    copyButton.className = "button secondary";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", async () => {
      await navigator.clipboard.writeText(suggestion.query);
      copyButton.textContent = "Copied";
      setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 1000);
    });

    buttonRow.append(openButton, copyButton);
    card.append(title, explanation, query, buttonRow);
    resultsContainer.appendChild(card);
  }
}

function setActiveQuickFilter(filter: QuickFilter) {
  activeQuickFilter = filter;

  const chips = Array.from(
    quickFilters.querySelectorAll<HTMLButtonElement>(".filter-chip")
  );

  for (const chip of chips) {
    chip.classList.toggle("active", chip.dataset.filter === filter);
  }
}

function generateAndRender() {
  currentSuggestions = getSuggestionsForCurrentSelection();
  renderSuggestions(currentSuggestions);
}

function renderPresetOptions() {
  const selectedValue = presetSelect.value;
  presetSelect.innerHTML = `<option value="">None</option>`;

  for (const preset of customPresets) {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = `${preset.name} (${preset.mode})`;
    presetSelect.appendChild(option);
  }

  if (customPresets.some((preset) => preset.id === selectedValue)) {
    presetSelect.value = selectedValue;
  }
}

function renderSavedPresetsList() {
  savedPresets.innerHTML = "";

  if (customPresets.length === 0) {
    savedPresets.innerHTML = `<p class="empty">No custom presets yet.</p>`;
    return;
  }

  for (const preset of customPresets) {
    const card = document.createElement("article");
    card.className = "preset-card";

    const title = document.createElement("h3");
    title.className = "preset-card-title";
    title.textContent = `${preset.name} (${preset.mode})`;

    const templateList = document.createElement("ul");
    templateList.className = "preset-template-list";

    for (const template of preset.templates) {
      const item = document.createElement("li");
      item.textContent = template;
      templateList.appendChild(item);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const useButton = document.createElement("button");
    useButton.className = "button secondary";
    useButton.textContent = "Use";
    useButton.addEventListener("click", () => {
      presetSelect.value = preset.id;
      activeQuickFilter = "all";
      setActiveQuickFilter("all");
      generateAndRender();
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "button secondary";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async () => {
      await deleteCustomPreset(preset.id);
      await loadCustomPresets();

      if (presetSelect.value === preset.id) {
        presetSelect.value = "";
      }

      generateAndRender();
    });

    actions.append(useButton, deleteButton);
    card.append(title, templateList, actions);
    savedPresets.appendChild(card);
  }
}

async function loadCustomPresets() {
  customPresets = await getCustomPresets();
  renderPresetOptions();
  renderSavedPresetsList();
}

function clearPresetForm() {
  presetNameInput.value = "";
  presetModeSelect.value = "general";
  presetTemplates.value = "";
}

function setPresetFeedback(message: string) {
  presetFeedback.textContent = message;
  setTimeout(() => {
    if (presetFeedback.textContent === message) {
      presetFeedback.textContent = "";
    }
  }, 2000);
}

savePresetButton.addEventListener("click", async () => {
  const name = presetNameInput.value.trim();
  const modeValue = presetModeSelect.value.trim();
  const templates = presetTemplates.value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!name) {
    setPresetFeedback("Preset name is required.");
    return;
  }

  if (!isSearchMode(modeValue)) {
    setPresetFeedback("Invalid preset mode.");
    return;
  }

  if (templates.length === 0) {
    setPresetFeedback("Add at least one template.");
    return;
  }

  const preset: CustomPreset = {
    id: makePresetId(),
    name,
    mode: modeValue,
    templates
  };

  await addCustomPreset(preset);
  await loadCustomPresets();

  presetSelect.value = preset.id;
  activeQuickFilter = "all";
  setActiveQuickFilter("all");
  clearPresetForm();
  setPresetFeedback("Preset saved.");
  generateAndRender();
});

generateButton.addEventListener("click", generateAndRender);

queryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    generateAndRender();
  }
});

queryInput.addEventListener("input", () => {
  if (queryInput.value.trim()) {
    generateAndRender();
  }
});

modeSelect.addEventListener("change", () => {
  if (presetSelect.value) {
    presetSelect.value = "";
  }

  activeQuickFilter = "all";
  setActiveQuickFilter("all");

  if (queryInput.value.trim()) {
    generateAndRender();
  }
});

presetSelect.addEventListener("change", () => {
  const selectedPreset = getSelectedPreset();

  if (selectedPreset) {
    modeSelect.value = selectedPreset.mode;
  }

  activeQuickFilter = "all";
  setActiveQuickFilter("all");

  if (queryInput.value.trim()) {
    generateAndRender();
  }
});

engineSelect.addEventListener("change", async () => {
  const engine = engineSelect.value as SearchEngineName;
  await saveDefaultEngine(engine);

  if (currentSuggestions.length > 0) {
    renderSuggestions(currentSuggestions);
  }
});

quickFilters.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  const button = target?.closest<HTMLButtonElement>(".filter-chip");

  if (!button?.dataset.filter) {
    return;
  }

  setActiveQuickFilter(button.dataset.filter as QuickFilter);

  if (queryInput.value.trim()) {
    generateAndRender();
  }
});

openAllButton.addEventListener("click", () => {
  if (currentSuggestions.length === 0) {
    generateAndRender();
  }

  const engine = engineSelect.value as SearchEngineName;
  const urls = currentSuggestions.map((item) => getEngineUrl(item.query, engine));

  if (urls.length === 0) {
    return;
  }

  chrome.runtime.sendMessage({
    action: "openMultipleSearches",
    urls
  });
});

copyAllButton.addEventListener("click", async () => {
  if (currentSuggestions.length === 0) {
    generateAndRender();
  }

  const text = currentSuggestions.map((item) => item.query).join("\n");

  if (!text) {
    return;
  }

  await navigator.clipboard.writeText(text);
  copyAllButton.textContent = "Copied";
  setTimeout(() => {
    copyAllButton.textContent = "Copy all";
  }, 1000);
});

async function init() {
  await loadCustomPresets();

  const defaultEngine = await getDefaultEngine();
  engineSelect.value = defaultEngine;

  setActiveQuickFilter("all");
  renderSuggestions([]);
}

void init();