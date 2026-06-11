"use client";

import { useEffect, useState } from "react";

const groupByDate = (sessions) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups = { Today: [], Yesterday: [], "Last 7 Days": [], Older: [] };

  sessions.forEach((s) => {
    const d = new Date(s.lastUpdated || s.createdAt);
    if (d >= today) groups["Today"].push(s);
    else if (d >= yesterday) groups["Yesterday"].push(s);
    else if (d >= lastWeek) groups["Last 7 Days"].push(s);
    else groups["Older"].push(s);
  });

  return groups;
};

export default function Sidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSwitchSession,
  onDeleteSession,
  onSearch,
  onClearRecentSearches,
  isSearchMode,
  searchResults,
  searchQuery,
  recentSearches,
  darkMode,
}) {
  const [query, setQuery] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [debounceId, setDebounceId] = useState(null);

  useEffect(() => {
    return () => {
      if (debounceId) {
        window.clearTimeout(debounceId);
      }
    };
  }, [debounceId]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceId) {
      window.clearTimeout(debounceId);
    }

    const nextId = window.setTimeout(() => onSearch(val), 300);
    setDebounceId(nextId);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  const handleRecentSearch = (value) => {
    setQuery(value);
    onSearch(value);
  };

  const handleDelete = (e, sid) => {
    e.stopPropagation();
    setConfirmDelete(sid);
  };

  const confirmDel = (e) => {
    e.stopPropagation();
    onDeleteSession(confirmDelete);
    setConfirmDelete(null);
  };

  const grouped = groupByDate(sessions);

  const base = darkMode
    ? "bg-gray-900 border-gray-800 text-gray-100"
    : "bg-white border-gray-200 text-gray-900";

  return (
    <aside
      className={`flex h-full w-64 shrink-0 flex-col border-r ${base} transition-colors duration-200`}
    >
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
            darkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={handleSearchChange}
            placeholder="Search chats..."
            className={`w-full bg-transparent text-sm outline-none placeholder:text-gray-400 ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {recentSearches.length > 0 && !isSearchMode && (
        <div className="px-3 pb-2">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <p
              className={`text-[11px] font-semibold uppercase tracking-wider ${darkMode ? "text-gray-600" : "text-gray-400"}`}
            >
              Recent searches
            </p>
            <button
              type="button"
              onClick={onClearRecentSearches}
              className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition ${
                darkMode
                  ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleRecentSearch(item)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-gray-300 hover:border-blue-500 hover:text-white"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300 hover:text-gray-900"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`mx-3 mb-2 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}
      />

      {/* Session list or search results */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 no-scrollbar">
        {isSearchMode ? (
          <div>
            <p
              className={`px-2 py-2 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}
            >
              {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""}
            </p>
            {searchResults.length === 0 ? (
              <p
                className={`px-2 py-3 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}
              >
                No conversations found for {searchQuery || "that search"}.
              </p>
            ) : (
              searchResults.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => {
                    onSwitchSession(conv.sessionId);
                    clearSearch();
                  }}
                  className={`mb-1 w-full rounded-xl px-3 py-3 text-left transition ${
                    darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                  }`}
                >
                  <p
                    className={`truncate text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}
                  >
                    {conv.question}
                  </p>
                  <p
                    className={`mt-0.5 truncate text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {conv.matchSnippet || conv.answer?.slice(0, 60)}...
                  </p>
                </button>
              ))
            )}
          </div>
        ) : sessions.length === 0 ? (
          <p
            className={`px-2 py-4 text-center text-sm ${darkMode ? "text-gray-600" : "text-gray-400"}`}
          >
            No past chats yet.
          </p>
        ) : (
          Object.entries(grouped).map(([label, group]) =>
            group.length === 0 ? null : (
              <div key={label} className="mb-2">
                <p
                  className={`px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                >
                  {label}
                </p>
                {group.map((s) => {
                  const isActive = s._id === currentSessionId;
                  return (
                    <div
                      key={s._id}
                      onMouseEnter={() => setHoveredId(s._id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`group relative mb-0.5 flex cursor-pointer items-center rounded-xl px-3 py-2.5 transition ${
                        isActive
                          ? darkMode
                            ? "border-l-2 border-blue-500 bg-gray-800"
                            : "border-l-2 border-blue-500 bg-blue-50"
                          : darkMode
                            ? "hover:bg-gray-800"
                            : "hover:bg-gray-50"
                      }`}
                      onClick={() => onSwitchSession(s._id)}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}
                        >
                          {s.firstQuestion || "New conversation"}
                        </p>
                        <p
                          className={`mt-0.5 text-[11px] ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                        >
                          {s.messageCount} message
                          {s.messageCount !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {/* Delete button */}
                      {(hoveredId === s._id || confirmDelete === s._id) && (
                        <div className="ml-1 shrink-0">
                          {confirmDelete === s._id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={confirmDel}
                                className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600"
                              >
                                Yes
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDelete(null);
                                }}
                                className={`rounded-lg px-2 py-1 text-[10px] font-bold ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => handleDelete(e, s._id)}
                              className="rounded-lg p-1 text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/20"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ),
          )
        )}
      </div>
    </aside>
  );
}
