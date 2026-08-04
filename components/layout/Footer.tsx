export function Footer() {
  return (
    <footer className="bg-brand-red text-white/70">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs sm:px-6">
        <p>
          Trainer Cave es un proyecto de portafolio sin fines comerciales. No
          se vende ningún producto real ni se procesa ningún pago real.
        </p>
        <p>
          Pokémon y los nombres de los personajes de Pokémon son marcas
          registradas de Nintendo, Game Freak y The Pokémon Company. Este es
          un proyecto de fans no oficial, no afiliado ni respaldado por
          ellos. Datos de Pokémon cortesía de{" "}
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
