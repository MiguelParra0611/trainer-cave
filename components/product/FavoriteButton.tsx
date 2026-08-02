"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function FavoriteButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      setUserId(user?.id ?? null);
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (!cancelled) {
        setIsFavorite(Boolean(data));
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function toggle() {
    if (!userId) {
      router.push("/login");
      return;
    }

    const supabase = createClient();
    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
      setIsFavorite(false);
    } else {
      await supabase.from("favorites").insert({ user_id: userId, product_id: productId });
      setIsFavorite(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:border-brand-red disabled:opacity-60 dark:border-zinc-700"
    >
      <span className={isFavorite ? "text-brand-red" : "text-zinc-400"}>
        {isFavorite ? "♥" : "♡"}
      </span>
      {isFavorite ? "Favorited" : "Favorite"}
    </button>
  );
}
