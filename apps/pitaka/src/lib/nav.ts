import type { Tab } from "./checklist";

/** Switch tab (and optionally scroll to a section). Kept in the URL hash so Back works. */
export function go(tab: Tab, anchor?: string) {
  window.location.hash = anchor ? `${tab}/${anchor}` : tab;
}
