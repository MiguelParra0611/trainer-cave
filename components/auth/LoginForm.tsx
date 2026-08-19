"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Turnstile } from "@/components/auth/Turnstile";

/** Only allow same-site relative paths — blocks `next=https://evil.com` and
 * protocol-relative `next=//evil.com` open-redirect payloads. */
function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const captchaRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: rateLimitError } = await supabase.rpc("check_login_rate_limit", {
      p_email: email,
    });
    if (rateLimitError) {
      setError("Demasiados intentos, prueba de nuevo en unos minutos.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });
    setCaptchaToken(null);
    setTurnstileKey((k) => k + 1);

    if (signInError) {
      await supabase.rpc("record_login_failure", { p_email: email });
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    await supabase.rpc("record_login_success", { p_email: email });

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium" htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <Turnstile key={turnstileKey} onVerify={setCaptchaToken} resetKey={turnstileKey} />
      {error && <p className="text-sm text-brand-red">{error}</p>}
      <button
        type="submit"
        disabled={loading || (captchaRequired && !captchaToken)}
        className="w-full rounded-full bg-brand-red px-4 py-2.5 font-medium text-white hover:bg-brand-red/90 disabled:opacity-70"
      >
        {loading ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
