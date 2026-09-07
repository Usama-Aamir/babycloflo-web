import { Nunito } from "next/font/google";
import Link from "next/link";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700"],
});

export function Wordmark({
  className = "",
  href,
  firstClassName = "text-zinc-900",
  secondClassName = "text-brand-accent",
}: {
  className?: string;
  href?: string;
  firstClassName?: string;
  secondClassName?: string;
}) {
  const inner = (
    <span
      className={`${nunito.className} inline-flex items-baseline text-2xl font-bold tracking-tight ${className}`}
    >
      <span className={firstClassName}>baby</span>
      <span className={secondClassName}>cloflo</span>
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
