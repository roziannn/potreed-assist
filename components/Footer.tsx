import Link from "next/link";
import { supabase } from "@/lib/supabase";

type SettingsData = {
  instagram_username?: string | null;
  tiktok_username?: string | null;
};

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.6 5.82c-.87-.96-1.36-2.2-1.36-3.5h-3.06v13.4c0 1.53-1.24 2.77-2.77 2.77a2.77 2.77 0 0 1-2.77-2.77 2.77 2.77 0 0 1 2.77-2.77c.28 0 .55.04.8.12v-3.12a5.93 5.93 0 0 0-.8-.06A5.9 5.9 0 0 0 3.5 15.9a5.9 5.9 0 0 0 5.91 5.9 5.9 5.9 0 0 0 5.91-5.9V9.05a8.6 8.6 0 0 0 5.03 1.62V7.6a5.6 5.6 0 0 1-3.75-1.78Z" />
    </svg>
  );
}

export async function Footer() {
  const { data: settings } = await supabase
    .from("settings")
    .select("instagram_username, tiktok_username")
    .eq("id", 1)
    .single<SettingsData>();

  const instagramHandle = settings?.instagram_username?.replace(/^@/, "");
  const tiktokHandle = settings?.tiktok_username?.replace(/^@/, "");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-slate-500">
          © {year} <span className="font-semibold text-slate-700">potreed.id</span>. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          {instagramHandle ? (
            <Link
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-sky-600"
            >
              <InstagramIcon className="size-4" />
              @{instagramHandle}
            </Link>
          ) : null}

          {tiktokHandle ? (
            <Link
              href={`https://tiktok.com/@${tiktokHandle}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-sky-600"
            >
              <TikTokIcon className="size-4" />
              @{tiktokHandle}
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
}