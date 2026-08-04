import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { HeaderAccountMenu } from "@/components/layout/HeaderAccountMenu";
import { HeaderCartLink } from "@/components/layout/HeaderCartLink";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { MobileNav } from "@/components/layout/MobileNav";
import logo from "@/public/logo.png";
import logoIcon from "@/public/logo-icon.png";

const CATEGORY_LINKS = [
  { slug: "action-figure", label: "Figuras" },
  { slug: "crochet-plush", label: "Peluches" },
  { slug: "t-shirt", label: "Camisetas" },
  { slug: "hoodie", label: "Hoodies" },
  { slug: "cap", label: "Gorras" },
];

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-brand-red text-white">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        {/* Mobile: hamburger menu, logo centered in the bar. */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center sm:hidden">
          <div />
          <Link href="/" className="flex justify-self-center">
            <Image src={logoIcon} alt="Trainer Cave" priority className="h-9 w-auto" />
          </Link>
          <div className="justify-self-end">
            <MobileNav user={user} />
          </div>
        </div>

        {/* Desktop: logo, inline category nav, search/account/cart icons. */}
        <div className="hidden items-center justify-between gap-6 sm:flex">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex shrink-0 items-center">
              <Image src={logo} alt="Trainer Cave" priority className="h-10 w-auto shrink-0" />
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="hover:text-brand-yellow">
                Catálogo
              </Link>
              {CATEGORY_LINKS.map((category) => (
                <Link
                  key={category.slug}
                  href={`/?article=${category.slug}#catalogo`}
                  className="hover:text-brand-yellow"
                >
                  {category.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <HeaderSearch />
            <HeaderAccountMenu user={user} />
            <HeaderCartLink />
          </div>
        </div>
      </div>
    </header>
  );
}
