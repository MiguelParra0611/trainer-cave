import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">
        Log in
      </h1>
      <div className="mt-6">
        <LoginForm />
      </div>
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-600">
        No account?{" "}
        <Link href="/signup" className="text-brand-red underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
