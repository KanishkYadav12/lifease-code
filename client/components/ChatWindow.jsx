"use client";

import { useEffect, useState } from "react";
import useChat from "@/hooks/useChat";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import MessageList from "@/components/MessageList";
import InputBar from "@/components/InputBar";

const DARK_MODE_KEY = "darkMode";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightText = (text, query, darkMode) => {
  if (!text) return null;

  const normalizedQuery = query.trim();
  if (!normalizedQuery) return text;

  const terms = [...new Set(normalizedQuery.split(/\s+/).filter(Boolean))];
  const pattern = terms.map(escapeRegex).join("|");

  if (!pattern) return text;

  const parts = String(text).split(new RegExp(`(${pattern})`, "ig"));

  return parts.map((part, index) =>
    terms.some((term) => part.toLowerCase() === term.toLowerCase()) ? (
      <mark
        key={`${part}-${index}`}
        className={`rounded px-0.5 ${darkMode ? "bg-amber-400/20 text-amber-200" : "bg-amber-200 text-amber-900"}`}
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
};

export default function ChatWindow() {
  const {
    sessionId,
    isSessionReady,
    messages,
    sessions,
    isLoading,
    error,
    searchResults,
    isSearchMode,
    searchQuery,
    recentSearches,
    clearRecentSearches,
    sendMessage,
    startNewChat,
    switchSession,
    deleteSession,
    searchChat,
  } = useChat();

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(DARK_MODE_KEY);
    setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DARK_MODE_KEY, String(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const activeMessages = isSearchMode ? [] : messages;

  const rootBg = darkMode
    ? "bg-gray-950 text-gray-100"
    : "bg-gray-100 text-gray-900";

  const panelBg = darkMode
    ? "bg-gray-900 border-gray-800"
    : "bg-white border-gray-200";

  return (
    <div
      className={`flex h-screen w-full overflow-hidden ${rootBg} transition-colors duration-200`}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile as overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          sessions={sessions}
          currentSessionId={sessionId}
          onNewChat={() => {
            startNewChat();
            setSidebarOpen(false);
          }}
          onSwitchSession={(sid) => {
            switchSession(sid);
            setSidebarOpen(false);
          }}
          onDeleteSession={deleteSession}
          onSearch={searchChat}
          onClearRecentSearches={clearRecentSearches}
          isSearchMode={isSearchMode}
          searchResults={searchResults}
          searchQuery={searchQuery}
          recentSearches={recentSearches}
          darkMode={darkMode}
        />
      </div>

      {/* Main chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header
          className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${panelBg}`}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-semibold tracking-tight">
                FAQ Assistant
              </h1>
              {sessionId && (
                <p
                  className={`text-[11px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                >
                  Session {sessionId.slice(0, 8)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`hidden rounded-full px-3 py-1 text-[11px] font-semibold sm:inline-flex ${
                isLoading
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              }`}
            >
              {isLoading ? "Thinking..." : "Ready"}
            </span>
            <ThemeToggle
              darkMode={darkMode}
              onToggle={() => setDarkMode((d) => !d)}
            />
          </div>
        </header>

        {/* Search bar */}
        <SearchBar
          onSearch={searchChat}
          isSearchMode={isSearchMode}
          darkMode={darkMode}
        />

        {/* Search results banner */}
        {isSearchMode && (
          <div
            className={`shrink-0 border-b px-5 py-2 text-sm ${darkMode ? "border-gray-800 bg-gray-900 text-gray-400" : "border-gray-200 bg-gray-50 text-gray-500"}`}
          >
            Showing {searchResults.length} result
            {searchResults.length !== 1 ? "s" : ""} —{" "}
            <button
              onClick={() => searchChat("")}
              className="text-blue-500 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-hidden">
          {isSearchMode ? (
            <div className="h-full overflow-y-auto px-4 py-4 no-scrollbar">
              {searchResults.length === 0 ? (
                <p
                  className={`text-center text-sm ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                >
                  No conversations found.
                </p>
              ) : (
                <div className="space-y-3 mx-auto max-w-3xl">
                  {searchResults.map((conv) => (
                    <button
                      key={conv._id}
                      onClick={() => switchSession(conv.sessionId)}
                      className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                        darkMode
                          ? "border-gray-800 bg-gray-900 hover:border-gray-700"
                          : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm"
                      }`}
                    >
                      <p
                        className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}
                      >
                        {highlightText(conv.question, searchQuery, darkMode)}
                      </p>
                      <p
                        className={`mt-1 text-[11px] uppercase tracking-[0.2em] ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        {conv.matchType === "text"
                          ? "Exact match"
                          : "Fuzzy match"}
                      </p>
                      <p
                        className={`mt-1 text-sm line-clamp-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        {highlightText(
                          conv.matchSnippet || conv.answer,
                          searchQuery,
                          darkMode,
                        )}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <MessageList
              messages={activeMessages}
              isLoading={isLoading}
              darkMode={darkMode}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Input bar */}
        <div className={`shrink-0 border-t p-4 ${panelBg}`}>
          <div className="mx-auto max-w-3xl">
            <InputBar
              onSend={sendMessage}
              isLoading={isLoading}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
