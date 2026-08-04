"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Header category links and search push `#catalogo` — smooth-scroll
 * past the hero to the results whenever that happens, since Next's
 * built-in hash scrolling doesn't reliably fire on same-route
 * searchParams-only navigations. */
export function ScrollToCatalog() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (window.location.hash !== "#catalogo") return;
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchParams]);

  return null;
}
