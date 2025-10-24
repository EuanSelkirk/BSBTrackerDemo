import { events, faqs } from "../data/sampleData";

export default function Events() {
  return (
    <div className="min-h-screen bg-slate-100 pt-32 pb-16">
      <section className="mx-auto max-w-4xl px-6">
        <h1 className="text-4xl font-semibold text-slate-900">Event calendar</h1>
        <p className="mt-4 text-lg text-slate-600">
          Swap in your own schedule while keeping the layout intact. Each card pulls from the static data configuration.
        </p>
        <div className="mt-10 grid gap-6">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200 transition hover:shadow-xl"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-blue-500">{event.date}</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{event.name}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">{event.location}</p>
              <p className="mt-4 text-slate-600">{event.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-6">
        <div className="rounded-3xl border border-blue-100 bg-blue-50/80 p-10 shadow-inner">
          <h2 className="text-2xl font-semibold text-blue-900">Frequently asked questions</h2>
          <p className="mt-2 text-blue-800">
            Clear up expectations when presenting your static prototype to stakeholders or recruiters.
          </p>
          <div className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl bg-white/80 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-blue-800">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
