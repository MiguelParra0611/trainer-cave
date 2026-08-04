import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">
        Iniciar sesión
      </h1>
      <div className="mt-6">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-600">
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="text-brand-red underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
