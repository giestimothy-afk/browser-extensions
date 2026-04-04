const siteLabel  = document.getElementById("site-label");
const statusDiv  = document.getElementById("status");
const captureBtn = document.getElementById("capture-btn");
const fileHint   = document.getElementById("file-hint");

let currentSite = null;

// ── Detect current tab ────────────────────────────────────────────────────────

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab || !tab.url) {
    siteLabel.textContent = "No active tab detected.";
    return;
  }

  let hostname;
  try {
    hostname = new URL(tab.url).hostname;
  } catch {
    siteLabel.textContent = "Cannot parse tab URL.";
    return;
  }

  currentSite = matchSite(hostname);

  if (!currentSite) {
    siteLabel.textContent = `Site not supported: ${hostname}`;
    statusDiv.textContent = "Add this site to site_config.js to enable capture.";
    return;
  }

  siteLabel.textContent = `Site: ${currentSite.name}  ·  ${hostname}`;
  captureBtn.disabled = false;

  fileHint.style.display = "block";
  fileHint.innerHTML =
    `Paste clipboard contents into:<br>` +
    `<code>~/.claude_session_cache/${currentSite.cache_file}</code>`;
});

// ── Capture ───────────────────────────────────────────────────────────────────

captureBtn.addEventListener("click", async () => {
  if (!currentSite) return;

  captureBtn.disabled = true;
  statusDiv.className = "";
  statusDiv.textContent = "Fetching cookies…";

  try {
    const cookies = await chrome.cookies.getAll({ domain: currentSite.cookie_domain });

    if (cookies.length === 0) {
      throw new Error("No cookies found — are you logged in?");
    }

    // Build Cookie header string (name=value pairs, semicolon-separated)
    const cookieHeader = cookies
      .map(c => `${c.name}=${c.value}`)
      .join("; ");

    // Payload Claude will read
    const payload = {
      site: currentSite.name,
      hostname: currentSite.key,
      cache_file: currentSite.cache_file,
      captured_at: new Date().toISOString(),
      cookie_header: cookieHeader,
      cookies: cookies.map(c => ({
        name:     c.name,
        value:    c.value,
        domain:   c.domain,
        path:     c.path,
        secure:   c.secure,
        httpOnly: c.httpOnly,
        sameSite: c.sameSite,
        session:  c.session,
        expirationDate: c.expirationDate ?? null
      }))
    };

    const json = JSON.stringify(payload, null, 2);
    await navigator.clipboard.writeText(json);

    statusDiv.className = "success";
    statusDiv.textContent = `✓ ${cookies.length} cookies copied to clipboard.`;
  } catch (err) {
    statusDiv.className = "error";
    statusDiv.textContent = `Error: ${err.message}`;
    captureBtn.disabled = false;
  }
});
