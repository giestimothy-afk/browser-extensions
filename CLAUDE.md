# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Monorepo containing multiple browser extensions. Each extension lives in its own subfolder (e.g., `extensions/my-extension/`). Extensions target **Chrome and Edge** using **Manifest V3**.

## Repository Structure

```
browser-extensions/
  extensions/
    <extension-name>/
      manifest.json       # MV3 manifest (required)
      background.js       # Service worker (MV3 background)
      content.js          # Content script(s)
      popup/              # Popup UI (HTML/CSS/JS or framework)
      icons/              # 16, 48, 128px PNGs
  CLAUDE.md
```

Each extension is self-contained. Stack (vanilla JS, React, Vue, Svelte) may vary per extension — check the individual extension's folder for a `package.json` or `README.md`.

## Manifest V3 Key Concepts

- **Background scripts** must be service workers (`"service_worker"` in manifest, not `"scripts"`)
- **No remote code** allowed — all JS must be bundled locally
- Use `chrome.action` (not `chrome.browserAction`), `chrome.scripting` (not `chrome.tabs.executeScript`)
- Permissions must be declared in `manifest.json`; use `"host_permissions"` for URL patterns
- `chrome.*` APIs work in Edge without modification

## Loading an Extension Locally

**Chrome/Edge:**
1. Go to `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode**
3. Click **Load unpacked** → select the extension's folder (where `manifest.json` lives)
4. After code changes, click the **refresh icon** on the extension card

If the extension uses a build step, load the `dist/` output folder, not the source folder.

## Extensions With a Build Step

If an extension has a `package.json`:

```bash
cd extensions/<extension-name>
npm install
npm run build    # produces dist/
npm run dev      # watch mode (if configured)
```

Load `extensions/<extension-name>/dist/` in the browser.

## Extensions

### page-to-markdown
Converts the current web page to Markdown and saves it as a `.md` file in the Downloads folder. No build step — load `extensions/page-to-markdown/` directly as an unpacked extension.

- **Entry point**: `background.js` — listens for toolbar icon click via `chrome.action.onClicked`
- **Conversion**: injects `turndown.js` into the active tab, then runs a function in the page context that calls `TurndownService` on the DOM
- **Content targeting**: prefers `<main>`, `<article>`, or `[role="main"]`; falls back to `<body>`
- **Output**: prepends page title, source URL, and date before the converted body; downloads via `chrome.downloads.download()` using a data URL
- **Known limitations**: won't work on browser internal pages (`chrome://`, `edge://`) or sites that block script injection

## GitHub

Repo: https://github.com/giestimothy-afk/browser-extensions
GitHub CLI (`gh`) is installed and authenticated as **giestimothy-afk**.

```bash
gh repo view --web        # open repo in browser
gh pr create              # create a pull request
gh issue create           # create an issue
```

## Debugging

- **Popup**: Right-click the extension icon → Inspect
- **Background service worker**: `chrome://extensions` → click "Service Worker" link under the extension
- **Content scripts**: DevTools on the target page → Console → filter by extension context
