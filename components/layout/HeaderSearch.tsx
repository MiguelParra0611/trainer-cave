"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
    setOpen(false);
    setQuery("");
  }

  if (open) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => {
            if (!query) setOpen(false);
          }}
          placeholder="Buscar productos…"
          className="h-9 w-40 rounded-full bg-white/15 px-3 text-sm text-white placeholder:text-white/70 outline-none focus:bg-white/25 sm:w-56"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Buscar"
      className="flex h-9 w-9 items-center justify-center hover:text-brand-yellow"
    >
      <SearchIcon />
    </button>
  );
}
