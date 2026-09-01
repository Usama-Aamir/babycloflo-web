"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/validation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/account/orders";
  const supabase = createClient();

  function validateEmail(value = email) {
    if (!value.trim() || isValidEmail(value)) {
      setEmailError(null);
      return true;
    }
    setEmailError("Please enter a valid email address");
    return false;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!validateEmail()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError("That email or password isn’t right");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center py-12">
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Log in</h1>
        <p className="mt-2 text-sm text-zinc-600 sm:text-base">
          Access your order history, or check out as a guest.
        </p>

        <form className="mt-7 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-800 sm:text-base" htmlFor="email">
              Email
            </label>
            <input
              autoComplete="email"
              className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:h-14 sm:text-lg"
              id="email"
              name="email"
              onBlur={() => validateEmail()}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              value={email}
            />
            {emailError ? (
              <p className="mt-2 text-sm text-red-600">{emailError}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-800 sm:text-base" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                autoComplete="current-password"
                className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 pr-14 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:h-14 sm:text-lg"
                id="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                onClick={() => setShowPassword((s) => !s)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-base text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <button
            className="h-12 w-full rounded-xl bg-brand-primary px-5 text-base font-semibold text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:text-lg"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 sm:text-base">
          Don’t have an account?{" "}
          <Link className="font-semibold text-brand-primary-dark hover:underline" href="/account/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-md items-center py-12">
          <p className="w-full text-center text-zinc-500">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
