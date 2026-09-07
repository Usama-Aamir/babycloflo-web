import { CartProvider } from "./_components/cart-context";
import { CustomerBackground } from "./_components/page-background";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <div className="relative z-10 flex min-h-screen flex-col text-zinc-950">
        <CustomerBackground />
        <div className="relative z-10 flex flex-1 flex-col">
          <SiteHeader />
          <main className="flex-1 px-4 pb-safe sm:px-6">{children}</main>
          <SiteFooter />
        </div>
      </div>
    </CartProvider>
  );
}
