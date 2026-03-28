import { generateQueries } from "./query-generator";
import { getSearchEngineAdapter } from "./search-engines";

const PANEL_ID = "search-helper-panel";
const CHIPS_ID = "search-helper-chips";
const CHIPS_WRAPPER_ID = "search-helper-chips-wrapper";

function createButton(label: string, primary = false): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = label;
  button.type = "button";
  button.style.padding = "8px 10px";
  button.style.borderRadius = "999px";
  button.style.cursor = "pointer";
  button.style.fontSize = "12px";
  button.style.fontFamily = "Arial, sans-serif";
  button.style.lineHeight = "1.2";
  button.style.whiteSpace = "nowrap";

  if (primary) {
    button.style.border = "1px solid #111827";
    button.style.background = "#111827";
    button.style.color = "#ffffff";
  } else {
    button.style.border = "1px solid #d0d7de";
    button.style.background = "#ffffff";
    button.style.color = "#111827";
  }

  return button;
}

function removeExistingPanel() {
  document.getElementById(PANEL_ID)?.remove();
}

function removeExistingChips() {
  document.getElementById(CHIPS_WRAPPER_ID)?.remove();
}

function getLiveQuery(): string {
  const adapter = getSearchEngineAdapter(window.location.href);
  if (!adapter) {
    return "";
  }

  return (
    adapter.getSearchInput(document)?.value.trim() ||
    adapter.getQuery(new URL(window.location.href), document)
  );
}

function openQuery(query: string) {
  const adapter = getSearchEngineAdapter(window.location.href);
  if (!adapter || !query) {
    return;
  }

  window.open(adapter.getSearchUrl(query), "_blank");
}

function createPanel(query: string, engineName: string): HTMLElement {
  const panel = document.createElement("section");
  panel.id = PANEL_ID;
  panel.style.margin = "16px 0";
  panel.style.padding = "16px";
  panel.style.background = "#ffffff";
  panel.style.border = "1px solid #dbe3ea";
  panel.style.borderRadius = "12px";
  panel.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
  panel.style.fontFamily = "Arial, sans-serif";
  panel.style.color = "#202124";

  const title = document.createElement("h2");
  title.textContent = "Search Helper";
  title.style.margin = "0 0 6px";
  title.style.fontSize = "18px";

  const displayEngineName =
    engineName.charAt(0).toUpperCase() + engineName.slice(1);

  const subtitle = document.createElement("p");
  subtitle.textContent = `Suggestions for "${query}" on ${displayEngineName}`;
  subtitle.style.margin = "0 0 12px";
  subtitle.style.color = "#5f6368";
  subtitle.style.fontSize = "13px";

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.gap = "8px";
  controls.style.marginBottom = "12px";
  controls.style.flexWrap = "wrap";

  const modeSelect = document.createElement("select");
  modeSelect.style.padding = "8px";
  modeSelect.style.border = "1px solid #cbd5e1";
  modeSelect.style.borderRadius = "8px";
  modeSelect.style.background = "#ffffff";

  const modes = [
    { value: "general", label: "General" },
    { value: "academic", label: "Academic" },
    { value: "technical", label: "Technical" }
  ] as const;

  for (const mode of modes) {
    const option = document.createElement("option");
    option.value = mode.value;
    option.textContent = mode.label;
    modeSelect.appendChild(option);
  }

  const refreshButton = createButton("Refresh");
  const closeButton = createButton("Close");

  const list = document.createElement("div");
  list.style.display = "grid";
  list.style.gap = "10px";

  function renderSuggestions(
    selectedMode: "general" | "academic" | "technical",
    currentQuery: string
  ) {
    const adapter = getSearchEngineAdapter(window.location.href);
    if (!adapter || !currentQuery) {
      list.innerHTML = "";
      return;
    }

    list.innerHTML = "";
    subtitle.textContent = `Suggestions for "${currentQuery}" on ${displayEngineName}`;

    const suggestions = generateQueries(currentQuery, selectedMode);

    for (const suggestion of suggestions) {
      const card = document.createElement("article");
      card.style.padding = "12px";
      card.style.border = "1px solid #e2e8f0";
      card.style.borderRadius = "10px";
      card.style.background = "#f8fafc";

      const heading = document.createElement("div");
      heading.textContent = suggestion.label;
      heading.style.fontWeight = "700";
      heading.style.marginBottom = "6px";

      const explanation = document.createElement("div");
      explanation.textContent = suggestion.explanation;
      explanation.style.fontSize = "13px";
      explanation.style.color = "#475569";
      explanation.style.marginBottom = "8px";

      const code = document.createElement("code");
      code.textContent = suggestion.query;
      code.style.display = "block";
      code.style.whiteSpace = "pre-wrap";
      code.style.wordBreak = "break-word";
      code.style.padding = "8px";
      code.style.background = "#e2e8f0";
      code.style.borderRadius = "8px";
      code.style.marginBottom = "8px";

      const buttonRow = document.createElement("div");
      buttonRow.style.display = "flex";
      buttonRow.style.gap = "8px";

      const searchButton = createButton("Search", true);
      searchButton.addEventListener("click", () => {
        openQuery(suggestion.query);
      });

      const copyButton = createButton("Copy");
      copyButton.addEventListener("click", async () => {
        await navigator.clipboard.writeText(suggestion.query);
        copyButton.textContent = "Copied";
        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1000);
      });

      buttonRow.append(searchButton, copyButton);
      card.append(heading, explanation, code, buttonRow);
      list.appendChild(card);
    }
  }

  modeSelect.addEventListener("change", () => {
    const liveQuery = getLiveQuery();
    if (!liveQuery) {
      return;
    }

    renderSuggestions(
      modeSelect.value as "general" | "academic" | "technical",
      liveQuery
    );
  });

  refreshButton.addEventListener("click", () => {
    const liveQuery = getLiveQuery();
    if (!liveQuery) {
      return;
    }

    renderSuggestions(
      modeSelect.value as "general" | "academic" | "technical",
      liveQuery
    );
  });

  closeButton.addEventListener("click", () => {
    removeExistingPanel();
  });

  controls.append(modeSelect, refreshButton, closeButton);
  panel.append(title, subtitle, controls, list);

  renderSuggestions("general", query);

  return panel;
}

function injectOrUpdatePanel(query: string) {
  const adapter = getSearchEngineAdapter(window.location.href);
  if (!adapter || !query) {
    return;
  }

  removeExistingPanel();

  const target = adapter.getInjectionTarget(document);
  if (!target) {
    return;
  }

  const panel = createPanel(query, adapter.name);
  target.prepend(panel);
}

function buildQuickSuggestions(query: string) {
  const general = generateQueries(query, "general");
  const academic = generateQueries(query, "academic");
  const technical = generateQueries(query, "technical");

  return [
    {
      label: "PDFs",
      query:
        academic.find((item) => item.label === "PDF papers")?.query ||
        general.find((item) => item.label === "PDF sources")?.query ||
        `"${query}" filetype:pdf`
    },
    {
      label: "Academic",
      query:
        academic.find((item) => item.label === "University sources")?.query ||
        `${query} site:.edu`
    },
    {
      label: "Reports",
      query:
        academic.find((item) => item.label === "Reports")?.query ||
        `"${query}" report OR assessment`
    },
    {
      label: "GitHub",
      query:
        technical.find((item) => item.label === "GitHub results")?.query ||
        `${query} site:github.com`
    },
    {
      label: "Docs",
      query:
        technical.find((item) => item.label === "Official documentation")?.query ||
        `"${query}" documentation`
    }
  ];
}

function injectSearchChips() {
  const adapter = getSearchEngineAdapter(window.location.href);
  if (!adapter) {
    return;
  }

  const input = adapter.getSearchInput(document);
  if (!input) {
    return;
  }

  const searchInput = input;

  removeExistingChips();

  const wrapper = document.createElement("div");
  wrapper.id = CHIPS_WRAPPER_ID;
  wrapper.style.marginTop = "8px";
  wrapper.style.display = "flex";
  wrapper.style.flexWrap = "wrap";
  wrapper.style.gap = "8px";
  wrapper.style.alignItems = "center";
  wrapper.style.fontFamily = "Arial, sans-serif";

  const chipsRow = document.createElement("div");
  chipsRow.id = CHIPS_ID;
  chipsRow.style.display = "flex";
  chipsRow.style.flexWrap = "wrap";
  chipsRow.style.gap = "8px";
  chipsRow.style.alignItems = "center";

  function renderChips() {
    const query = searchInput.value.trim() || getLiveQuery();
    chipsRow.innerHTML = "";

    if (!query) {
      return;
    }

    const quickSuggestions = buildQuickSuggestions(query);

    for (const item of quickSuggestions) {
      const chip = createButton(item.label);
      chip.style.padding = "6px 10px";
      chip.addEventListener("click", () => {
        openQuery(item.query);
      });
      chipsRow.appendChild(chip);
    }

    const moreChip = createButton("More", true);
    moreChip.style.padding = "6px 10px";
    moreChip.addEventListener("click", () => {
      const liveQuery = searchInput.value.trim() || getLiveQuery();
      if (!liveQuery) {
        return;
      }

      const existingPanel = document.getElementById(PANEL_ID);
      if (existingPanel) {
        existingPanel.remove();
        return;
      }

      injectOrUpdatePanel(liveQuery);
    });

    chipsRow.appendChild(moreChip);
  }

  searchInput.addEventListener("input", renderChips);
  searchInput.addEventListener("focus", renderChips);

  renderChips();

  const inputParent = searchInput.parentElement;
  if (!inputParent) {
    return;
  }

  const host =
    searchInput.closest("form") ||
    inputParent.parentElement ||
    inputParent;

  host.insertAdjacentElement("afterend", wrapper);
  wrapper.appendChild(chipsRow);
}

function injectPanelFromPageQuery() {
  const adapter = getSearchEngineAdapter(window.location.href);
  if (!adapter) {
    return;
  }

  const query = adapter.getQuery(new URL(window.location.href), document);
  if (!query) {
    return;
  }

  injectOrUpdatePanel(query);
}

function watchUrlChanges() {
  let lastUrl = window.location.href;

  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      removeExistingChips();
      removeExistingPanel();

      setTimeout(() => {
        injectSearchChips();
        injectPanelFromPageQuery();
      }, 300);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

function init() {
  setTimeout(() => {
    injectSearchChips();
    injectPanelFromPageQuery();
    watchUrlChanges();
  }, 300);
}

init();