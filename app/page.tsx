export default function Home() {
  const username = process.env.HOST_USERNAME ?? "demo";
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Open-source scheduling, self-hosted in 60 seconds.</h1>
        <p className="max-w-2xl text-lg text-black/70">
          openreserve is a single-host, single-binary alternative to Calendly. SQLite for storage, Next.js for everything else,
          deploy to Vercel / Fly / a Raspberry Pi. No SaaS account, no per-seat fees, no email lock-in.
        </p>
        <div className="flex gap-3 pt-2">
          <a href={`/book/${username}`} className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            See the demo booking page
          </a>
          <a href="https://github.com/krish9219/openreserve" className="rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5">
            View on GitHub
          </a>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        <Feature title="60-second setup" body="One env file, one prisma push, one seed. SQLite means no Postgres to run." />
        <Feature title="No bloat" body="Two admin pages, one public flow. ~600 lines of TypeScript total, all readable." />
        <Feature title="Timezone-correct" body="All slots stored in UTC, rendered in the visitor's local timezone." />
        <Feature title="Buffer between meetings" body="Per-event-type buffer minutes so you're not running between back-to-back calls." />
        <Feature title="Conflict-free by design" body="Slot generator excludes overlaps; double-booking is structurally impossible." />
        <Feature title="MIT licensed" body="Fork it, ship it, sell it. No copyleft, no contributor agreement." />
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5">
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-sm text-black/65">{body}</div>
    </div>
  );
}
