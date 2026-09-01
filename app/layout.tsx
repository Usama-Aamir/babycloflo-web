import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "BabyCloFlo — Baby Feeders, Nipples & More",
    template: "%s — BabyCloFlo",
  },
  description:
    "Shop baby feeders, nipples, bottles, and essentials at BabyCloFlo. Quality products for your little ones, delivered across Pakistan.",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/babycloflo-icon-192.png",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#4FA9D1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
