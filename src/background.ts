import { generateQueries, normalizeSearchQuery } from "./query-generator";
import {
  getSearchEngineByName,
  type SearchEngineName
} from "./search-engines";
import { getDefaultEngine } from "./storage";

type OpenSearchMessage = {
  action: "openSearch";
  url: string;
};

type OpenMultipleSearchesMessage = {
  action: "openMultipleSearches";
  urls: string[];
};

type ExtensionMessage = OpenSearchMessage | OpenMultipleSearchesMessage;

function getEngineLabel(name: SearchEngineName): string {
  switch (name) {
    case "google":
      return "Google";
    case "duckduckgo":
      return "DuckDuckGo";
    case "qwant":
      return "Qwant";
  }
}

function escapeDescription(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildSuggestionContent(
  engine: SearchEngineName,
  query: string
): string {
  return JSON.stringify({ engine, query });
}

function parseSuggestionContent(
  content: string
): { engine: SearchEngineName; query: string } | null {
  try {
    const parsed = JSON.parse(content) as {
      engine?: string;
      query?: string;
    };

    if (
      (parsed.engine === "google" ||
        parsed.engine === "duckduckgo" ||
        parsed.engine === "qwant") &&
      typeof parsed.query === "string"
    ) {
      return {
        engine: parsed.engine,
        query: parsed.query
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function openQueryOnEngine(
  engineName: SearchEngineName,
  query: string,
  disposition?: string
) {
  const adapter = getSearchEngineByName(engineName);
  if (!adapter) {
    return;
  }

  const url = adapter.getSearchUrl(query);

  if (disposition === "newForegroundTab") {
    await chrome.tabs.create({ url, active: true });
    return;
  }

  if (disposition === "newBackgroundTab") {
    await chrome.tabs.create({ url, active: false });
    return;
  }

  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (currentTab?.id) {
    await chrome.tabs.update(currentTab.id, { url });
  } else {
    await chrome.tabs.create({ url, active: true });
  }
}

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, _sendResponse): undefined => {
    if (message.action === "openSearch") {
      chrome.tabs.create({ url: message.url });
    }

    if (message.action === "openMultipleSearches") {
      for (const url of message.urls) {
        chrome.tabs.create({ url });
      }
    }

    return undefined;
  }
);

chrome.omnibox.setDefaultSuggestion({
  description:
    "Search Helper: type a query to get smarter search suggestions"
});

chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const rawQuery = normalizeSearchQuery(text);

  if (!rawQuery) {
    suggest([]);
    return;
  }

  const defaultEngine = await getDefaultEngine();
  const engineLabel = getEngineLabel(defaultEngine);

  chrome.omnibox.setDefaultSuggestion({
    description: `Search Helper on <match>${escapeDescription(
      engineLabel
    )}</match>: search for <match>${escapeDescription(rawQuery)}</match>`
  });

  const suggestions = [
    ...generateQueries(rawQuery, "general").slice(0, 2),
    ...generateQueries(rawQuery, "academic").slice(0, 2),
    ...generateQueries(rawQuery, "technical").slice(0, 2)
  ];

  suggest(
    suggestions.map((item) => ({
      content: buildSuggestionContent(defaultEngine, item.query),
      description: `<match>${escapeDescription(item.label)}</match> — ${escapeDescription(
        item.query
      )}`
    }))
  );
});

chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const parsed = parseSuggestionContent(text);

  if (parsed) {
    await openQueryOnEngine(parsed.engine, parsed.query, disposition);
    return;
  }

  const fallbackQuery = normalizeSearchQuery(text);
  if (!fallbackQuery) {
    return;
  }

  const defaultEngine = await getDefaultEngine();
  await openQueryOnEngine(defaultEngine, fallbackQuery, disposition);
});

chrome.omnibox.onInputStarted.addListener(async () => {
  const defaultEngine = await getDefaultEngine();
  const engineLabel = getEngineLabel(defaultEngine);

  chrome.omnibox.setDefaultSuggestion({
    description: `Search Helper on <match>${escapeDescription(
      engineLabel
    )}</match>: type a query to get suggestions`
  });
});