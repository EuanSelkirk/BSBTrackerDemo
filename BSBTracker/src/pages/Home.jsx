import { heroStats, features, testimonials } from "../data/sampleData";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 text-white">
      <section className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center gap-10 px-6 pt-32 pb-24 md:flex-row md:items-center">
        <div className="flex-1 space-y-6">
          <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-indigo-200">
            Static portfolio build
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Showcase your climbing competitions with a polished, fully static experience.
          </h1>
          <p className="max-w-xl text-lg text-indigo-100">
            This version of BSBTracker removes live Supabase integrations while preserving the storytelling and design of the production app. Perfect for portfolios, case studies, and client previews.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#features"
              className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-400"
            >
              Explore features
            </a>
            <a
              href="/leaderboard"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View leaderboard demo
            </a>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Highlights</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center shadow-inner">
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs uppercase tracking-widest text-indigo-200">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-indigo-100">
            Populate these figures with metrics from your own gym, event series, or case study write-up.
          </p>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-semibold text-white md:text-4xl">Everything you need for a compelling showcase</h2>
          <p className="mt-4 text-indigo-100">
            Crafted to mirror the real BSBTracker experience—just swap the data source when you are ready to go live again.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 text-indigo-100 shadow-lg shadow-blue-900/20"
            >
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-xl shadow-blue-900/30">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Portfolio friendly</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">Designed to ship as a static build</h2>
          <p className="mt-6 text-lg text-indigo-100">
            Every screen runs off curated sample data. Swap in markdown, JSON, or CMS exports—no Supabase client or authentication required.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <h2 className="text-3xl font-semibold text-white md:text-4xl">What collaborators say</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.author}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 text-left text-indigo-100 shadow-lg shadow-blue-900/20"
            >
              <p className="text-lg leading-relaxed">“{testimonial.quote}”</p>
              <footer className="mt-4 text-sm font-semibold text-white">{testimonial.author}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  );
}
