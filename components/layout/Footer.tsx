export function Footer() {
  return (
    <footer className="bg-brand-red text-white/70">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs sm:px-6">
        <p>
          Trainer Cave is a non-commercial portfolio project. No real
          products are sold and no real payments are processed.
        </p>
        <p>
          Pokémon and Pokémon character names are trademarks of Nintendo,
          Game Freak, and The Pokémon Company. This is an unofficial fan
          project, not affiliated with or endorsed by them. Pokémon data
          courtesy of{" "}
          <a
            href="https://pokeapi.co/"
            target="_blank"
            rel="noreferrer"
            className="text-brand-yellow underline"
          >
            PokéAPI
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
