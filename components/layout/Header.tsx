import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/layout/LogoutButton";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-brand-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Trainer <span className="text-brand-yellow">Cave</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-brand-blue">
            Catalog
          </Link>
          <Link href="/favorites" className="hover:text-brand-blue">
            Favorites
          </Link>
          <Link href="/cart" className="hover:text-brand-blue">
            Cart
          </Link>
          {user?.isAdmin && (
            <Link href="/admin/products" className="hover:text-brand-blue">
              Admin
            </Link>
          )}
          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-brand-blue px-3 py-1.5 text-brand-navy hover:bg-brand-yellow"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
