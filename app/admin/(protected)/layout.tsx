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

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="sticky top-0 z-10 flex min-h-16 items-center justify-end border-b border-zinc-200 bg-white px-5">
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
