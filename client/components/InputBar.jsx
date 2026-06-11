"use client";

import { useEffect, useRef, useState } from "react";

export default function InputBar({ onSend, isLoading, darkMode }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, 160);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 160 ? "auto" : "hidden";
  };

  useEffect(() => {
    resizeTextarea();
  }, [value]);

  const submit = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue || isLoading) {
      return;
    }

    onSend(trimmedValue);
    setValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div
      className={`rounded-[1.75rem] border p-4 shadow-[0_12px_35px_rgba(15,23,42,0.08)] transition-colors duration-200 ${
        darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          placeholder="Type your question..."
          className={`max-h-40 min-h-12 flex-1 resize-none rounded-[1.25rem] border px-4 py-3 text-[15px] outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
            darkMode
              ? "border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-400 focus:ring-blue-500/15"
              : "border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500/10"
          }`}
        />
        <button
          type="button"
          onClick={submit}
          disabled={isLoading || !value.trim()}
          className="inline-flex h-12 min-w-24 items-center justify-center rounded-[1.25rem] bg-gradient-to-r from-blue-600 to-cyan-600 px-5 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Sending
            </span>
          ) : (
            "Send"
          )}
        </button>
      </div>
    </div>
  );
}
