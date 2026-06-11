"use client";

import { useEffect, useState } from "react";

export default function SearchBar({ onSearch, isSearchMode, darkMode }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onSearch(query);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [onSearch, query]);

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div
      className={`border-b px-5 py-4 backdrop-blur-xl transition-colors duration-200 sm:px-6 ${
        darkMode
          ? "border-slate-800/80 bg-slate-950/60"
          : "border-slate-200/80 bg-white"
      }`}
    >
      <div
        className={`flex items-center gap-3 rounded-[1.25rem] border px-4 py-3 shadow-sm transition-colors duration-200 ${
          darkMode
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 shrink-0 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="11" cy="11" r="7" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m20 20-3.5-3.5"
          />
        </svg>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="text"
          placeholder="Search past conversations..."
          className={`w-full bg-transparent text-sm outline-none placeholder:text-slate-400 ${
            darkMode ? "text-slate-100" : "text-slate-900"
          }`}
        />
        {isSearchMode ? (
          <button
            type="button"
            onClick={clearSearch}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-700 ${
              darkMode
                ? "hover:bg-slate-800 hover:text-slate-200"
                : "hover:bg-slate-100"
            }`}
            aria-label="Clear search"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6 6 18"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
