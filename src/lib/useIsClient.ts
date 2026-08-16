import { useSyncExternalStore } from "react";

export function subscribeNoop(): () => void {
  return () => {};
}

function getTrue() {
  return true;
}

function getFalse() {
  return false;
}

export function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNoop, getTrue, getFalse);
}
