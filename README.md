# Search Helper Extension

Search Helper is a browser extension designed to improve how you search online by generating smarter, more targeted queries automatically.

It helps users refine their searches for different contexts such as academic research, technical documentation, reports, or specific file types — without needing to learn advanced search operators.

---

## Features

- Generate improved search queries from a simple input
- Multiple modes: General, Academic, Technical
- Quick filters: PDFs, Academic sources, Reports, GitHub, Documentation
- Open refined searches instantly
- Copy generated queries
- Custom presets (create and reuse your own query templates)
- Multi-search support (open multiple queries at once)
- Works with Google, DuckDuckGo, and Qwant

---

## How It Works

1. Enter a basic search query
2. The extension generates multiple refined versions of that query
3. Choose the version that best fits your intent
4. Open it directly in your preferred search engine

---

## Installation (Development Mode)

This extension is not yet published on the Chrome Web Store. You can install it manually:

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/search-helper-extension.git
cd search-helper-extension
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the extension

```bash
npm run build
```

This generates a `dist/` folder containing the production build.

### 4. Load the extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right corner)
3. Click **Load unpacked**
4. Select the `dist/` folder

The extension should now appear in your browser toolbar.

---

## Usage

### Extension Popup

1. Click the extension icon in the toolbar
2. Enter your query
3. Select a mode or quick filter
4. Open or copy refined queries

### Keyboard Shortcut

Configure a shortcut at `chrome://extensions/shortcuts` to open the extension quickly.

### Omnibox

Type `sh` followed by your query in the address bar and select a suggestion from the dropdown.

---

## Project Structure

```
src/
├── background.ts        # Background service worker
├── content.ts           # Page integration (optional UI injection)
├── popup.ts             # Main UI logic
├── query-generator.ts   # Query generation logic
├── search-engines/      # Search engine adapters
├── storage.ts           # Local storage (presets, settings)
└── presets.ts           # Custom preset logic

public/
└── manifest.json        # Extension configuration
```

---

## Roadmap

- [ ] Side panel integration for persistent usage
- [ ] Better query ranking and prioritization
- [ ] Smarter suggestions based on intent
- [ ] Improved UI integration with search engines
- [ ] Sharing and importing presets
- [ ] Analytics-free usage tracking (local only)

---

## Contributing

Contributions, ideas, and feedback are welcome. If you have suggestions or want to improve the extension, open an issue or submit a pull request.

---

## License

MIT License
