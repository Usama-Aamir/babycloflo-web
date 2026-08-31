"use client";

import { useState } from "react";

export function PasswordInput() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        autoComplete="current-password"
        className="min-h-14 w-full rounded-xl border border-zinc-300 bg-white px-4 pr-14 text-lg outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
        id="password"
        name="password"
        required
        type={isVisible ? "text" : "password"}
      />
      <button
        aria-label={isVisible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-14 items-center justify-center rounded-r-xl text-zinc-600 hover:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-900"
        onClick={() => setIsVisible((visible) => !visible)}
        type="button"
      >
        {isVisible ? (
          <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
            <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.5 10.5 0 0 1 12 4c5.5 0 9 5 9 5a15.7 15.7 0 0 1-2.1 2.5M6.6 6.6C4.4 8 3 10 3 10s3.5 5 9 5c1 0 2-.2 2.8-.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
        ) : (
          <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
            <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        )}
      </button>
    </div>
  );
}
