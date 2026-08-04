import Image from "next/image";
import Link from "next/link";
import heroImage from "@/public/enteihero.png";

export function Hero() {
  return (
    <Link href="/?q=entei" aria-label="Explorar la colección de Entei" className="block">
      <Image
        src={heroImage}
        alt="Colección Legendaria — La Leyenda Despierta. Entei irrumpe con su poder: figuras de acción, peluches en crochet y camisetas premium de tu Pokémon legendario favorito."
        priority
        className="h-auto w-full"
        sizes="100vw"
      />
    </Link>
  );
}
