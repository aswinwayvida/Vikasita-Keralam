import { useEffect, useState } from "react";

let currentTopSearchQuery = "";
const listeners = new Set<(query: string) => void>();

export function setAdminTopSearchQuery(query: string) {
  currentTopSearchQuery = query;
  listeners.forEach((listener) => listener(query));
}

export function getAdminTopSearchQuery() {
  return currentTopSearchQuery;
}

export function useAdminTopSearch() {
  const [query, setQuery] = useState(currentTopSearchQuery);

  useEffect(() => {
    const handler = (next: string) => setQuery(next);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return query;
}
