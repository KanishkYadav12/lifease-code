"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "@/components/MessageBubble";

export default function MessageList({ messages, isLoading, darkMode }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-y-auto no-scrollbar px-4 py-5 sm:px-6 ${
        darkMode ? "bg-slate-950/20" : "bg-white"
      }`}
    >
      {messages.length === 0 ? (
        <div
          className={`flex min-h-[22rem] items-center justify-center rounded-[1.75rem] border border-dashed px-6 text-center shadow-sm ${
            darkMode
              ? "border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900"
              : "border-slate-200 bg-gradient-to-br from-white to-blue-50/40"
          }`}
        >
          <div className="max-w-md space-y-4">
            <p
              className={`text-sm font-semibold uppercase tracking-[0.22em] ${darkMode ? "text-blue-400" : "text-blue-600"}`}
            >
              Ready to chat
            </p>
            <h2
              className={`text-2xl font-semibold tracking-tight ${darkMode ? "text-slate-50" : "text-slate-900"}`}
            >
              Ask a question to start the conversation.
            </h2>
            <p
              className={`text-sm leading-7 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Your chat history will load automatically for this session.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pb-2">
          {messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="mt-4 flex justify-start">
          <div
            className={`rounded-3xl rounded-tl-lg border px-4 py-3 shadow-sm ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
          >
            <div
              className={`mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${darkMode ? "bg-blue-500/15 text-blue-300" : "bg-blue-100 text-blue-700"}`}
              >
                AI
              </span>
              <span>Typing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.2s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.1s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" />
            </div>
          </div>
        </div>
      ) : null}

      <div ref={bottomRef} />
    </div>
  );
}
