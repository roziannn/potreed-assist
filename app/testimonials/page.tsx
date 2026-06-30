import { Quote, Star } from "lucide-react";
import { FloatingChat } from "@/components/FloatingChat";
import { Navbar } from "@/components/Navbar";
import { testimonials } from "@/lib/site-data";

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,207,232,0.45),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(186,230,253,0.65),_transparent_28%),linear-gradient(180deg,_#fffafc_0%,_#f8fafc_48%,_#eff6ff_100%)] pb-24">
      <Navbar />
      <FloatingChat />

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-rose-500">
            Testimonial
          </p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Cerita client setelah
            <span className="block text-rose-500">booking dan sesi selesai.</span>
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Halaman ini dipisah dari jasa dan biaya supaya calon client bisa fokus melihat social proof tanpa tercampur daftar paket.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-56px_rgba(244,114,182,0.26)] backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center gap-2 text-amber-500">
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <Star
                    key={`${testimonial.name}-${index}`}
                    className="size-4 fill-current"
                  />
                ))}
              </div>
              <Quote className="size-8 text-rose-300" />
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {testimonial.quote}
              </p>
              <div className="mt-6">
                <p className="font-semibold text-slate-900">{testimonial.name}</p>
                <p className="text-sm text-slate-500">{testimonial.event}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
