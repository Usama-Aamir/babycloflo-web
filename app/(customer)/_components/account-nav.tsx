"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function AccountNav() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  if (isLoading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-100" />;
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {user ? (
        <>
          <Link
            className="hidden rounded-lg px-2 py-1 font-medium text-zinc-700 hover:bg-zinc-100 sm:inline-block"
            href="/account/orders"
          >
            My Orders
          </Link>
          <button
            className="rounded-lg px-2 py-1 font-medium text-zinc-600 hover:bg-zinc-100"
            onClick={handleLogout}
            type="button"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link
            className="rounded-lg px-2 py-1 font-medium text-zinc-700 hover:bg-zinc-100"
            href="/account/login"
          >
            Log in
          </Link>
          <Link
            className="rounded-lg bg-brand-primary-light px-3 py-1.5 font-medium text-brand-primary-dark hover:bg-brand-primary/10"
            href="/account/signup"
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}
