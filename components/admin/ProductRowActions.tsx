"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ProductRowActions({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleActive() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("products").update({ is_active: !isActive }).eq("id", productId);
    setBusy(false);
    router.refresh();
  }

  async function deleteProduct() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", productId);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        type="button"
        onClick={toggleActive}
        disabled={busy}
        className="text-brand-navy hover:underline disabled:opacity-60 dark:text-brand-blue"
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>
      <button
        type="button"
        onClick={deleteProduct}
        disabled={busy}
        className="text-brand-red hover:underline disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}
