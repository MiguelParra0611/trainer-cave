import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/layout/LogoutButton";
import logo from "@/public/logo.png";
import logoIcon from "@/public/logo-icon.png";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-brand-red text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src={logoIcon}
            alt="Trainer Cave"
            priority
            className="h-9 w-auto shrink-0 sm:hidden"
          />
          <Image
            src={logo}
            alt="Trainer Cave"
            priority
            className="hidden h-10 w-auto shrink-0 sm:block"
          />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-brand-yellow">
            Catalog
          </Link>
          <Link href="/favorites" className="hover:text-brand-yellow">
            Favorites
          </Link>
          <Link href="/cart" aria-label="Cart" className="hover:text-brand-yellow">
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
          </Link>
          {user?.isAdmin && (
            <Link href="/admin/products" className="hover:text-brand-yellow">
              Admin
            </Link>
          )}
          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-white px-3 py-1.5 text-brand-red hover:bg-brand-yellow"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
