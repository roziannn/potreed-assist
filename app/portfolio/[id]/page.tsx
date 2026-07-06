import { Navbar } from "@/components/Navbar";
import { FloatingChat } from "@/components/FloatingChat";
import { supabase } from "@/lib/supabase";
import PortfolioGallery from "@/components/PortfolioGallery";
import { Camera } from "lucide-react";

type Props = { params: { id: string } };

export default async function PortfolioDetailPage({ params }: Props) {
  const resolvedParams = await params as any;
  const id = resolvedParams.id as string | undefined;

  const { data: portfolioData, error: pErr } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", id)
    .single();

  if (pErr) console.error("DEBUG SUPABASE portfolio fetch:", pErr);

  const { data: imagesData, error: iErr } = await supabase
    .from("portfolio_images")
    .select("*")
    .eq("portfolio_id", id)
    .order("created_at", { ascending: false });

  if (iErr) console.error("DEBUG SUPABASE images fetch:", iErr);

  const portfolio = portfolioData || null;
  const images = imagesData || [];

  const heroImage = portfolio?.thumbnail_url || images[0]?.image_url || null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(186,230,253,0.65),_transparent_28%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_55%,_#eff6ff_100%)] pb-24">
      <Navbar />
      <FloatingChat />

      <section className="relative mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="relative rounded-[1.5rem] overflow-hidden">
          <div
            className="h-64 sm:h-96 bg-cover bg-center"
            style={{
              backgroundImage: heroImage
                ? `url('${heroImage}')`
                : "linear-gradient(160deg, rgba(14,165,233,0.15), rgba(255,255,255,0.2), rgba(251,191,36,0.3))",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />

          <div className="absolute inset-0 flex items-end p-8">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 max-w-3xl">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase text-sky-700">
                    {portfolio?.kategori ?? "Portfolio"}
                  </div>
                  <Camera className="size-4 text-slate-400" />
                </div>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900">{portfolio?.judul ?? "Portfolio"}</h1>
              <p className="mt-3 text-lg text-slate-700">{portfolio?.deskripsi ?? ""}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Galeri Foto</h2>
        <PortfolioGallery images={images} />
      </section>
    </main>
  );
}
