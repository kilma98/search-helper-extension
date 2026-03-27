type OpenSearchMessage = {
  action: "openSearch";
  query: string;
};

type OpenMultipleSearchesMessage = {
  action: "openMultipleSearches";
  queries: string[];
};

type ExtensionMessage = OpenSearchMessage | OpenMultipleSearchesMessage;

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender,
    _sendResponse
  ): undefined => {
    if (message.action === "openSearch") {
      const url = `https://www.google.com/search?q=${encodeURIComponent(message.query)}`;
      chrome.tabs.create({ url });
    }

    if (message.action === "openMultipleSearches") {
      for (const query of message.queries) {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        chrome.tabs.create({ url });
      }
    }

    return undefined;
  }
);