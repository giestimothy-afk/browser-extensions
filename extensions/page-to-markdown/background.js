chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Inject Turndown into the page context
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['turndown.js']
    });

    // Run conversion inside the page context (has access to TurndownService global)
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const service = new TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced',
          bulletListMarker: '-'
        });

        // Strip non-content elements before conversion
        service.remove(['script', 'style', 'noscript', 'iframe', 'nav', 'footer']);

        // Prefer semantic content containers over full body
        const content =
          document.querySelector('main, article, [role="main"]') ||
          document.body;

        const title = document.title;
        const url = location.href;
        const date = new Date().toISOString().split('T')[0];

        const body = service.turndown(content.innerHTML);

        const markdown = `# ${title}\n\nSource: ${url}  \nDate: ${date}\n\n---\n\n${body}`;

        return { markdown, title };
      }
    });

    const { markdown, title } = results[0].result;

    // Build a safe filename from the page title
    const filename = title
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100) || 'page';

    const dataUrl = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(markdown);

    await chrome.downloads.download({
      url: dataUrl,
      filename: filename + '.md',
      saveAs: false
    });
  } catch (err) {
    console.error('[Page to Markdown]', err);
  }
});
