"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/app/_components/wordmark";
import { useCart } from "./cart-context";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      ) : (
        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      )}
    </svg>
  );
}

function CartIcon({ count }: { count: number }) {
  const [popping, setPopping] = useState(false);
  const previousCount = useRef(count);

  useEffect(() => {
    if (count > previousCount.current) {
      setPopping(true);
      const timeout = window.setTimeout(() => setPopping(false), 220);
      return () => window.clearTimeout(timeout);
    }
    previousCount.current = count;
  }, [count]);

  return (
    <Link aria-label={`Cart ${count > 0 ? `(${count} item${count === 1 ? "" : "s"})` : ""}`} className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/10 active:scale-95" href="/cart">
      <svg aria-hidden="true" fill="none" height="23" viewBox="0 0 24 24" width="23">
        <path d="M3 4h2l2 11h11l2-8H6m3 12h.01M17 19h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
      {count > 0 ? (
        <span
          className={`absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-white transition-transform duration-200 ${popping ? "scale-150" : "scale-100"}`}
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { totalItems } = useCart();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
  }

  const menuLinks = [
    { href: "/", label: "Home" },
    { href: "/cart", label: "Cart", badge: totalItems },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#2E7FA3] shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Wordmark href="/" firstClassName="text-[#F5F5F0]" secondClassName="text-[#F7B6CE]" />

        <div className="flex items-center gap-1">
          <div className="sm:hidden">
            <CartIcon count={totalItems} />
          </div>

          <button
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/10 sm:hidden"
            onClick={() => setMenuOpen((s) => !s)}
            type="button"
          >
            <MenuIcon open={menuOpen} />
          </button>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Store navigation">
            <Link className="rounded-lg px-3 py-2 text-sm font-medium text-[#CFE8F2] transition hover:bg-white/10 hover:text-white" href="/">
              Home
            </Link>
            <Link className="rounded-lg px-3 py-2 text-sm font-medium text-[#CFE8F2] transition hover:bg-white/10 hover:text-white" href="/cart">
              Cart
            </Link>
          </nav>

          <div className="hidden sm:flex sm:items-center sm:gap-1">
            {!loading ? (
              user ? (
                <>
                  <Link className="rounded-lg px-3 py-2 text-sm font-medium text-[#CFE8F2] transition hover:bg-white/10 hover:text-white" href="/account/orders">
                    My Orders
                  </Link>
                  <button
                    className="rounded-lg px-3 py-2 text-sm font-medium text-[#CFE8F2] transition hover:bg-white/10 hover:text-white"
                    onClick={handleLogout}
                    type="button"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link className="rounded-lg px-3 py-2 text-sm font-medium text-[#CFE8F2] transition hover:bg-white/10 hover:text-white" href="/account/login">
                    Log in
                  </Link>
                  <Link
                    className="rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/25 active:scale-95"
                    href="/account/signup"
                  >
                    Sign up
                  </Link>
                </>
              )
            ) : null}
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div
          className="fixed inset-0 top-16 z-20 bg-black/40 sm:hidden"
          id="mobile-menu"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-[calc(100dvh-4rem)] w-72 max-w-[80vw] overflow-y-auto border-l border-white/10 bg-[#2E7FA3] px-5 py-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-1" aria-label="Mobile navigation">
              {menuLinks.map((link) => (
                <Link
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium text-[#CFE8F2] transition hover:bg-white/10 hover:text-white"
                  href={link.href}
                  key={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  {link.badge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1.5 text-xs font-bold text-white">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>

            <div className="mt-6 border-t border-zinc-100 pt-6">
              {!loading ? (
                user ? (
                  <div className="space-y-1">
                    <Link
                      className="block rounded-xl px-3 py-3 text-base font-medium text-[#CFE8F2] transition hover:bg-white/10 hover:text-white"
                      href="/account/orders"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      className="block w-full rounded-xl px-3 py-3 text-left text-base font-medium text-[#CFE8F2] transition hover:bg-white/10 hover:text-white"
                      onClick={handleLogout}
                      type="button"
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      className="block rounded-xl bg-white/15 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-white/25 active:scale-95"
                      href="/account/signup"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                    <Link
                      className="block rounded-xl px-4 py-3 text-center text-base font-medium text-[#CFE8F2] transition hover:bg-white/10 hover:text-white"
                      href="/account/login"
                      onClick={() => setMenuOpen(false)}
                    >
                      Log in
                    </Link>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
