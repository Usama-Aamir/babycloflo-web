import { CartProvider } from "./_components/cart-context";
import { SiteHeader } from "./_components/site-header";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-[#fffaf7] text-zinc-950">
        <SiteHeader />
        <main className="flex-1 px-4 pb-safe sm:px-6">{children}</main>
      </div>
    </CartProvider>
  );
}
