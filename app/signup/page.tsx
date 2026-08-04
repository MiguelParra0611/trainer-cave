import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">
        Crear cuenta
      </h1>
      <div className="mt-6">
        <SignupForm />
      </div>
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-brand-red underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
