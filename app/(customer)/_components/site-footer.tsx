import Link from "next/link";
import { MapPin, Truck } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

const WHATSAPP_NUMBER = "923045016861";
const WHATSAPP_DISPLAY = "+92 304 5016861";

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export async function SiteFooter() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");

  return (
    <footer className="mt-auto bg-[#2E7FA3] text-[#CFE8F2]">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-[1.3fr_1fr_1fr]">
          {/* Column 1: Wordmark + tagline */}
          <div>
            <span className="inline-flex items-baseline text-2xl font-bold tracking-tight">
              <span className="text-white">baby</span>
              <span className="text-[#F7B6CE]">cloflo</span>
            </span>
            <p className="mt-3 max-w-xs text-sm leading-6 text-[#CFE8F2]">
              Quality baby essentials, delivered across Pakistan. Cash on delivery, always.
            </p>
          </div>

          {/* Column 2: Shop links */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-white">Shop</h2>
            <ul className="mt-4 space-y-2.5">
              {(categories ?? []).map((category) => (
                <li key={category.id}>
                  <Link
                    className="text-sm text-[#CFE8F2] transition hover:text-white"
                    href={`/category/${category.slug}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Get in touch */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-white">Get in touch</h2>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  className="inline-flex items-center gap-2.5 text-sm text-[#CFE8F2] transition hover:text-white"
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <WhatsAppIcon size={18} />
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-2.5 text-sm text-[#CFE8F2]">
                  <MapPin size={18} strokeWidth={1.8} />
                  Lahore, Pakistan
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#CFE8F2]">
            &copy; 2026 babycloflo. All rights reserved. Built by{" "}
            <span className="text-white">edecode</span>
            <span className="text-[#4FA9D1]">.</span>
          </p>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white">
            <Truck size={16} strokeWidth={1.8} />
            Cash on delivery available nationwide
          </span>
        </div>
      </div>
    </footer>
  );
}
