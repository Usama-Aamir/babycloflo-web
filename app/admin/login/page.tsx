import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { PasswordInput } from "./password-input";

export const metadata: Metadata = {
  title: "Admin Login",
};

async function login(formData: FormData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/admin/login?error=invalid");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/admin/login?error=invalid");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .single();

  if (!profile?.is_admin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 py-12 text-zinc-950">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">Admin login</h1>
        <p className="mt-2 text-base text-zinc-600">
          Log in to manage the store.
        </p>

        <form action={login} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-base font-medium" htmlFor="email">
              Email
            </label>
            <input
              autoComplete="email"
              className="min-h-14 w-full rounded-xl border border-zinc-300 bg-white px-4 text-lg outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              id="email"
              name="email"
              required
              type="email"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-base font-medium"
              htmlFor="password"
            >
              Password
            </label>
            <PasswordInput />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-base text-red-700" role="alert">
              {error === "unauthorized"
                ? "This account doesn’t have admin access"
                : "That email or password isn&apos;t right"}
            </p>
          ) : null}

          <button
            className="min-h-14 w-full rounded-xl bg-zinc-950 px-5 text-lg font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-400"
            type="submit"
          >
            Log in
          </button>
        </form>
      </div>
    </main>
  );
}
