import { Nunito } from "next/font/google";
import Link from "next/link";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700"],
});

export function Wordmark({
  className = "",
  href,
}: {
  className?: string;
  href?: string;
}) {
  const inner = (
    <span
      className={`${nunito.className} inline-flex items-baseline text-2xl font-bold tracking-tight ${className}`}
    >
      <span className="text-zinc-900">baby</span>
      <span className="text-brand-accent">cloflo</span>
    </span>
  );

  if (href) {
    return (
      <Link className="inline-block" href={href}>
        {inner}
      </Link>
    );
  }

  return inner;
}
