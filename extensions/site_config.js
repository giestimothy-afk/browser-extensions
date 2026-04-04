/**
 * Site configuration for session capture.
 * To add a new site:
 *   1. Add an entry keyed by the hostname (or partial hostname match)
 *   2. Set cache_file (relative to ~/.claude_session_cache/)
 *   3. Add host_permissions in manifest.json
 */
const SITE_CONFIG = {
  "familysearch.org": {
    name: "FamilySearch",
    cache_file: "familysearch.json",
    cookie_domain: ".familysearch.org",
    notes: "Genealogy records — used for census, vital records, and tree access"
  }
  // Future sites, e.g.:
  // "ancestry.com": {
  //   name: "Ancestry",
  //   cache_file: "ancestry.json",
  //   cookie_domain: ".ancestry.com",
  //   notes: "Genealogy records"
  // },
  // "myheritage.com": {
  //   name: "MyHeritage",
  //   cache_file: "myheritage.json",
  //   cookie_domain: ".myheritage.com",
  //   notes: "MyHeritage tree and records"
  // }
};

/**
 * Match a hostname against config keys (suffix match so subdomains work).
 * Returns the config entry or null.
 */
function matchSite(hostname) {
  for (const [key, config] of Object.entries(SITE_CONFIG)) {
    if (hostname === key || hostname.endsWith("." + key)) {
      return { key, ...config };
    }
  }
  return null;
}
