"use client";

import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import api from "@/lib/axios";

const SESSION_KEY = "currentSessionId";
const SEARCH_HISTORY_KEY = "faqSearchHistory";
const MAX_SEARCH_HISTORY = 5;

const toMessages = (conversations = []) =>
  conversations.flatMap((conv) => {
    const baseId = conv._id || uuidv4();
    const createdAt = conv.createdAt || new Date().toISOString();
    return [
      {
        _id: `${baseId}-user`,
        role: "user",
        content: conv.question || "",
        createdAt,
      },
      {
        _id: `${baseId}-ai`,
        role: "ai",
        content: conv.answer || "",
        createdAt,
      },
    ];
  });

export default function useChat() {
  const [sessionId, setSessionId] = useState("");
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);

  // Init session on mount
  useEffect(() => {
    const saved = window.localStorage.getItem(SESSION_KEY);
    const savedSearches = window.localStorage.getItem(SEARCH_HISTORY_KEY);

    if (savedSearches) {
      try {
        const parsed = JSON.parse(savedSearches);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.filter((item) => typeof item === "string"));
        }
      } catch {
        // ignore malformed search history
      }
    }

    if (saved) {
      setSessionId(saved);
    } else {
      const newId = uuidv4();
      window.localStorage.setItem(SESSION_KEY, newId);
      setSessionId(newId);
    }
    setIsSessionReady(true);
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const res = await api.get("/api/sessions");
      setSessions(res.data?.sessions || []);
    } catch {
      // sidebar failing silently is fine
    }
  }, []);

  const loadMessages = useCallback(async (sid) => {
    if (!sid) return;
    try {
      setError(null);
      const res = await api.get("/api/conversations", {
        params: { sessionId: sid, page: 1, limit: 50 },
      });
      setMessages(toMessages(res.data?.conversations || []));
      setSearchResults([]);
      setIsSearchMode(false);
    } catch (err) {
      setError(
        err?.response?.data?.error || "Unable to load conversation history.",
      );
    }
  }, []);

  // Load messages + sessions once session is ready
  useEffect(() => {
    if (!isSessionReady || !sessionId) return;
    loadMessages(sessionId);
    loadSessions();
  }, [isSessionReady, sessionId, loadMessages, loadSessions]);

  const sendMessage = useCallback(
    async (question) => {
      const trimmed = question.trim();
      if (!trimmed || isLoading || !sessionId) return;

      setError(null);
      setIsSearchMode(false);
      setSearchResults([]);

      const userMsg = {
        _id: `temp-${uuidv4()}`,
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await api.post("/api/chat", {
          question: trimmed,
          sessionId,
        });
        const conv = res.data || {};
        const aiMsg = {
          _id: `${conv._id || uuidv4()}-ai`,
          role: "ai",
          content: conv.answer || "",
          createdAt: conv.createdAt || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        loadSessions(); // refresh sidebar
      } catch (err) {
        setError(
          err?.response?.data?.error || "Unable to send message right now.",
        );
        // remove optimistic user message on error
        setMessages((prev) => prev.filter((m) => m._id !== userMsg._id));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, loadSessions],
  );

  const startNewChat = useCallback(() => {
    const newId = uuidv4();
    window.localStorage.setItem(SESSION_KEY, newId);
    setSessionId(newId);
    setMessages([]);
    setSearchResults([]);
    setIsSearchMode(false);
    setError(null);
  }, []);

  const switchSession = useCallback(
    (sid) => {
      window.localStorage.setItem(SESSION_KEY, sid);
      setSessionId(sid);
      setMessages([]);
      setSearchResults([]);
      setIsSearchMode(false);
      setError(null);
      loadMessages(sid);
    },
    [loadMessages],
  );

  const deleteSession = useCallback(
    async (sid) => {
      try {
        await api.delete(`/api/conversations/${encodeURIComponent(sid)}`);
        await loadSessions();
        if (sid === sessionId) {
          startNewChat();
        }
      } catch (err) {
        setError(err?.response?.data?.error || "Unable to delete session.");
      }
    },
    [sessionId, loadSessions, startNewChat],
  );

  const searchChat = useCallback(async (query) => {
    const trimmed = query.trim();
    setSearchQuery(trimmed);
    if (!trimmed) {
      setSearchResults([]);
      setIsSearchMode(false);
      return;
    }
    try {
      setError(null);
      const res = await api.get("/api/conversations/search", {
        params: { q: trimmed },
      });
      setSearchResults(res.data?.conversations || []);
      setIsSearchMode(true);

      setRecentSearches((prev) => {
        const next = [
          trimmed,
          ...prev.filter(
            (item) => item.toLowerCase() !== trimmed.toLowerCase(),
          ),
        ].slice(0, MAX_SEARCH_HISTORY);
        window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to search conversations.");
    }
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    window.localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  return {
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
  };
}
