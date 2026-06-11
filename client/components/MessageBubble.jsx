"use client";

import ReactMarkdown from "react-markdown";

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const markdownComponents = {
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-7">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-4 border-slate-300 pl-4 italic text-slate-600 dark:border-slate-600 dark:text-slate-300">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      className="text-blue-600 underline decoration-blue-300 underline-offset-2 dark:text-blue-400"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-900 dark:bg-slate-800 dark:text-slate-100">
        {children}
      </code>
    ) : (
      <code className="font-mono text-sm text-slate-100">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100 shadow-inner">
      {children}
    </pre>
  ),
};

export default function MessageBubble({ message, darkMode }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-[1.6rem] px-4 py-3 shadow-sm ring-1 transition-all duration-200 hover:-translate-y-0.5 ${
          isUser
            ? "rounded-tr-md bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-blue-500/20"
            : darkMode
              ? "rounded-tl-md bg-slate-900 text-slate-100 ring-slate-800"
              : "rounded-tl-md bg-white text-slate-900 ring-slate-200"
        }`}
      >
        {!isUser ? (
          <div
            className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] ${darkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${darkMode ? "bg-blue-500/15 text-blue-300" : "bg-blue-100 text-blue-700"}`}
            >
              AI
            </span>
            <span>Assistant</span>
          </div>
        ) : null}

        {isUser ? (
          <p className="whitespace-pre-wrap text-[15px] leading-7">
            {message.content}
          </p>
        ) : (
          <ReactMarkdown components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}

        <p
          className={`mt-3 text-[11px] ${isUser ? "text-blue-100/90" : darkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
