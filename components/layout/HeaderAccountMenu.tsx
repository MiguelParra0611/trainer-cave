"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "@/components/layout/LogoutButton";

function AccountIcon() {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}

const itemClassName = "block px-4 py-2.5 text-sm font-medium text-brand-navy hover:bg-zinc-100";

export function HeaderAccountMenu({ user }: { user: { isAdmin: boolean } | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Cuenta"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center hover:text-brand-yellow"
      >
        <AccountIcon />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={close}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg bg-white shadow-lg">
            {user ? (
              <>
                <Link href="/favorites" onClick={close} className={itemClassName}>
                  Favoritos
                </Link>
                {user.isAdmin && (
                  <Link href="/admin/products" onClick={close} className={itemClassName}>
                    Admin
                  </Link>
                )}
                <LogoutButton
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium text-brand-red hover:bg-zinc-100"
                  onLoggedOut={close}
                />
              </>
            ) : (
              <Link
                href="/login"
                onClick={close}
                className="block px-4 py-2.5 text-sm font-medium text-brand-red hover:bg-zinc-100"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
