import Link from "next/link";

export function Header() {
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
          <Link
            href="/login"
            className="rounded-full bg-brand-blue px-3 py-1.5 text-brand-navy hover:bg-brand-yellow"
          >
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
