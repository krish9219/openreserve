import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function HostPage({ params }: { params: { username: string } }) {
  const host = await db.host.findUnique({
    where: { username: params.username },
    include: { eventTypes: { where: { active: true }, orderBy: { durationMin: "asc" } } },
  });
  if (!host) notFound();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{host.name}</h1>
        {host.bio && <p className="text-black/65">{host.bio}</p>}
        <p className="text-xs text-black/50">All times shown in your local timezone.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {host.eventTypes.map((et) => (
          <a
            key={et.id}
            href={`/book/${host.username}/${et.slug}`}
            className="rounded-lg border border-black/10 bg-white p-5 transition hover:border-black/30"
          >
            <div className="flex items-baseline justify-between">
              <div className="font-medium">{et.title}</div>
              <div className="text-xs text-black/55">{et.durationMin} min</div>
            </div>
            {et.description && <p className="mt-2 text-sm text-black/65">{et.description}</p>}
          </a>
        ))}
      </div>

      {host.eventTypes.length === 0 && (
        <p className="text-black/55">No event types yet. The host can add them under <code>/availability</code>.</p>
      )}
    </div>
  );
}
