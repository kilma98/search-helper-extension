import "./style.css";
import {
  generateQueries,
  type QuerySuggestion,
  type SearchMode
} from "./query-generator";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = `
  <main class="container">
    <h1>Search Helper</h1>

    <label class="label" for="query">Search query</label>
    <input
      id="query"
      class="input"
      type="text"
      placeholder="e.g. hydroponics africa"
    />

    <label class="label" for="mode">Mode</label>
    <select id="mode" class="select">
      <option value="general">General</option>
      <option value="academic">Academic</option>
      <option value="technical">Technical</option>
    </select>

    <div class="actions">
      <button id="generate" class="button primary">Generate</button>
      <button id="open-all" class="button secondary">Open all</button>
      <button id="copy-all" class="button secondary">Copy all</button>
    </div>

    <section id="results" class="results"></section>
  </main>
`;

const queryInputEl = document.querySelector<HTMLInputElement>("#query");
const modeSelectEl = document.querySelector<HTMLSelectElement>("#mode");
const generateButtonEl = document.querySelector<HTMLButtonElement>("#generate");
const openAllButtonEl = document.querySelector<HTMLButtonElement>("#open-all");
const copyAllButtonEl = document.querySelector<HTMLButtonElement>("#copy-all");
const resultsContainerEl = document.querySelector<HTMLElement>("#results");

if (
  !queryInputEl ||
  !modeSelectEl ||
  !generateButtonEl ||
  !openAllButtonEl ||
  !copyAllButtonEl ||
  !resultsContainerEl
) {
  throw new Error("Popup elements not found");
}

const queryInput = queryInputEl;
const modeSelect = modeSelectEl;
const generateButton = generateButtonEl;
const openAllButton = openAllButtonEl;
const copyAllButton = copyAllButtonEl;
const resultsContainer = resultsContainerEl;

let currentSuggestions: QuerySuggestion[] = [];

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
      chrome.runtime.sendMessage({
        action: "openSearch",
        query: suggestion.query
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

function generateAndRender() {
  const query = queryInput.value;
  const mode = modeSelect.value as SearchMode;
  currentSuggestions = generateQueries(query, mode);
  renderSuggestions(currentSuggestions);
}

generateButton.addEventListener("click", generateAndRender);

queryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    generateAndRender();
  }
});

openAllButton.addEventListener("click", () => {
  if (currentSuggestions.length === 0) {
    generateAndRender();
  }

  const queries = currentSuggestions.map((item) => item.query);

  if (queries.length === 0) {
    return;
  }

  chrome.runtime.sendMessage({
    action: "openMultipleSearches",
    queries
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

renderSuggestions([]);