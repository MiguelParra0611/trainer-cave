"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "@/components/layout/LogoutButton";

function CatalogIcon() {
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
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function HeartIcon() {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function CartIcon() {
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
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const itemClassName =
  "flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-zinc-100";

export function MobileNav({ user }: { user: { isAdmin: boolean } | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center"
      >
        {open ? <CloseIcon /> : <HamburgerIcon />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg bg-white text-brand-navy shadow-lg">
            <Link href="/" onClick={close} className={itemClassName}>
              <CatalogIcon />
              Catalog
            </Link>
            <Link href="/favorites" onClick={close} className={itemClassName}>
              <HeartIcon />
              Favorites
            </Link>
            <Link href="/cart" onClick={close} className={itemClassName}>
              <CartIcon />
              Cart
            </Link>
            {user?.isAdmin && (
              <Link href="/admin/products" onClick={close} className={itemClassName}>
                Admin
              </Link>
            )}
            <div className="border-t border-zinc-200">
              {user ? (
                <LogoutButton
                  className="block w-full px-4 py-3 text-left text-sm font-medium text-brand-red hover:bg-zinc-100"
                  onLoggedOut={close}
                />
              ) : (
                <Link
                  href="/login"
                  onClick={close}
                  className="block px-4 py-3 text-sm font-medium text-brand-red hover:bg-zinc-100"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
