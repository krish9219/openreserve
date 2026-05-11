import { db } from "@/lib/db";
import { AvailabilityEditor } from "./AvailabilityEditor";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const username = process.env.HOST_USERNAME ?? "demo";
  const host = await db.host.findUnique({
    where: { username },
    include: { availability: { orderBy: [{ dayOfWeek: "asc" }, { startMin: "asc" }] } },
  });
  if (!host) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm">
        No host found for username <code>{username}</code>. Run <code>npm run setup</code>.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Availability</h1>
        <p className="text-sm text-black/65">
          Recurring weekly hours in <code>{host.timezone}</code>. Visitors see times in their own timezone.
        </p>
      </header>
      <AvailabilityEditor
        initial={host.availability.map((r) => ({
          dayOfWeek: r.dayOfWeek,
          startMin: r.startMin,
          endMin: r.endMin,
        }))}
      />
    </div>
  );
}
