"use client";

import { Search } from "lucide-react";

export function LibraryFilters({ query, onQuery }: { query: string; onQuery: (value: string) => void }) {
  return <label className="library-search"><Search size={16} /><span className="sr-only">搜索书库</span><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="书名或作者" /></label>;
}
