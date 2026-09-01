import Link from "next/link";

import { AccountNav } from "./_components/account-nav";
import { CartProvider } from "./_components/cart-context";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#fffaf7] text-zinc-950">
        <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/95 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4">
            <Link className="text-xl font-bold tracking-tight text-rose-700" href="/">
              Baby Clo Flo
            </Link>
            <nav className="flex items-center gap-1" aria-label="Store navigation">
              <Link className="flex min-h-12 min-w-14 flex-col items-center justify-center rounded-xl px-2 text-xs font-medium hover:bg-rose-50" href="/">
                <svg aria-hidden="true" fill="none" height="23" viewBox="0 0 24 24" width="23">
                  <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
                Home
              </Link>
              <Link className="flex min-h-12 min-w-14 flex-col items-center justify-center rounded-xl px-2 text-xs font-medium hover:bg-rose-50" href="/gift-box">
                <svg aria-hidden="true" fill="none" height="23" viewBox="0 0 24 24" width="23">
                  <path d="M4 9h16v12H4V9Zm-1-4h18v4H3V5Zm9 0v16M12 5c-1-3-5-3-5-1 0 1 2 1 5 1Zm0 0c1-3 5-3 5-1 0 1-2 1-5 1Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
                </svg>
                Gifts
              </Link>
              <Link className="flex min-h-12 min-w-14 flex-col items-center justify-center rounded-xl px-2 text-xs font-medium hover:bg-rose-50" href="/cart">
                <svg aria-hidden="true" fill="none" height="23" viewBox="0 0 24 24" width="23">
                  <path d="M3 4h2l2 11h11l2-8H6m3 12h.01M17 19h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
                Cart
              </Link>
            </nav>
            <AccountNav />
          </div>
        </header>
        {children}
      </div>
    </CartProvider>
  );
}
