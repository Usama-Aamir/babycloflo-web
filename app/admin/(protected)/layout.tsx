import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function logout() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/admin/login?error=unauthorized");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-2">
        <div className="flex min-h-11 items-center gap-4 overflow-x-auto">
          <Link className="relative inline-block h-8 w-32 shrink-0" href="/admin">
            <span className="sr-only">BabyCloFlo Admin</span>
            <Image
              alt="BabyCloFlo"
              className="object-contain object-left"
              fill
              priority
              src="/babycloflo-logo-horizontal.png"
              unoptimized
            />
          </Link>
          <nav className="flex min-h-11 items-center gap-1" aria-label="Admin navigation">
          <Link className="rounded-lg px-3 py-3 font-medium hover:bg-zinc-100" href="/admin">
            Dashboard
          </Link>
          <Link className="rounded-lg px-3 py-3 font-medium hover:bg-zinc-100" href="/admin/products">
            Products
          </Link>
          <Link className="rounded-lg px-3 py-3 font-medium hover:bg-zinc-100" href="/admin/orders">
            Orders
          </Link>
          <Link className="rounded-lg px-3 py-3 font-medium hover:bg-zinc-100" href="/admin/settings">
            Settings
          </Link>
        </nav>
        </div>
        <form action={logout}>
          <button
            className="min-h-11 rounded-lg border border-zinc-300 bg-white px-5 text-base font-medium hover:bg-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-300"
            type="submit"
          >
            Log out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
