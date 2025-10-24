import { routeSpotlights } from "../data/sampleData";

export default function Routes() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 pt-32 pb-16">
      <section className="mx-auto max-w-5xl px-6">
        <h1 className="text-4xl font-semibold text-slate-900">Route spotlights</h1>
        <p className="mt-4 text-lg text-slate-600">
          Feature signature blocs from your setting team. Replace the static data to personalise the gallery.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {routeSpotlights.map((route) => (
            <article
              key={route.id}
              className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-500">{route.grade}</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">{route.name}</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">Set by {route.setter}</p>
                <p className="mt-4 text-slate-600">{route.description}</p>
              </div>
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 p-4 text-sm text-blue-800">
                <p>Starter idea</p>
                <p className="mt-1 text-xs text-blue-600">
                  Swap this block with route images, setting beta, or training notes.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-6">
        <div className="rounded-3xl border border-blue-100 bg-blue-600/10 p-10 text-blue-900">
          <h2 className="text-2xl font-semibold">Show the process behind the problems</h2>
          <p className="mt-4 text-blue-800">
            Use this static page to walk through your setting pipeline: concept sketches, forerunning clips, or iteration notes. It is a great prompt for case studies.
          </p>
        </div>
      </section>
    </div>
  );
}
