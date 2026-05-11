import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const username = process.env.HOST_USERNAME ?? "demo";
  const host = await db.host.findUnique({ where: { username } });
  if (!host) return <p className="text-sm">No host configured.</p>;

  const upcoming = await db.booking.findMany({
    where: { hostId: host.id, startUtc: { gte: new Date() }, status: "confirmed" },
    include: { eventType: true },
    orderBy: { startUtc: "asc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Upcoming bookings</h1>
        <p className="text-sm text-black/65">All times shown in host timezone <code>{host.timezone}</code>.</p>
      </header>
      {upcoming.length === 0 ? (
        <p className="text-sm text-black/65">Nothing on the calendar.</p>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
          {upcoming.map((b) => (
            <li key={b.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{b.inviteeName} &middot; {b.eventType.title}</div>
                <div className="text-xs text-black/55">{b.inviteeEmail}</div>
                {b.notes && <div className="mt-1 text-sm text-black/70">{b.notes}</div>}
              </div>
              <time className="text-sm tabular-nums">
                {b.startUtc.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: host.timezone })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
