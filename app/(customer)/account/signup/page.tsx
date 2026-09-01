"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/validation";

function plainError(message: string) {
  const lowered = message.toLowerCase();
  if (lowered.includes("already registered") || lowered.includes("already exists")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (lowered.includes("password")) {
    return "Please choose a stronger password (at least 6 characters).";
  }
  if (lowered.includes("email")) {
    return "Please enter a valid email address.";
  }
  return "Something went wrong. Please try again.";
}

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });

    setIsLoading(false);

    if (signUpError) {
      setError(plainError(signUpError.message));
      return;
    }

    if (data.session) {
      router.push("/account/orders");
      router.refresh();
    } else {
      setError("Account created. Please check your email and confirm it before logging in.");
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-12">
      <div className="w-full">
        <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-2 text-zinc-600">
          Optional — you can also check out as a guest.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-base font-medium" htmlFor="email">
              Email
            </label>
            <input
              autoComplete="email"
              className="min-h-14 w-full rounded-xl border border-zinc-300 bg-white px-4 text-lg outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
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
            <label className="mb-2 block text-base font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                autoComplete="new-password"
                className="min-h-14 w-full rounded-xl border border-zinc-300 bg-white px-4 pr-14 text-lg outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                id="password"
                minLength={6}
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
            className="min-h-14 w-full rounded-xl bg-rose-600 px-5 text-lg font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-600">
          Already have an account?{" "}
          <Link className="font-semibold text-rose-700 hover:underline" href="/account/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
