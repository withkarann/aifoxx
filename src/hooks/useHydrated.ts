import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False while the pre-rendered page is being brought to life, true afterwards.
 *
 * Pages are pre-rendered without any query string, so state read from the URL
 * (search, filters, page number) must not change the first render or the
 * static markup and the live page disagree. Read URL state once this is true.
 * On in-app navigation it is true from the start, so there is no flash.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
