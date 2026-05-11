import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { generateSlots } from "@/lib/availability";
import { BookingForm } from "./BookingForm";

export default async function EventPage({
  params,
}: {
  params: { username: string; event: string };
}) {
  const host = await db.host.findUnique({
    where: { username: params.username },
    include: {
      availability: true,
      eventTypes: { where: { slug: params.event } },
    },
  });
  if (!host || host.eventTypes.length === 0) notFound();
  const eventType = host.eventTypes[0];

  const rangeStart = new Date();
  const rangeEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const bookings = await db.booking.findMany({
    where: {
      hostId: host.id,
      status: "confirmed",
      startUtc: { gte: rangeStart, lte: rangeEnd },
    },
    select: { startUtc: true, endUtc: true },
  });

  const slots = generateSlots({
    rules: host.availability.map((r) => ({
      dayOfWeek: r.dayOfWeek,
      startMin: r.startMin,
      endMin: r.endMin,
    })),
    bookings,
    timezone: host.timezone,
    durationMin: eventType.durationMin,
    bufferMin: eventType.bufferMin,
    rangeStart,
    rangeEnd,
  });

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <a href={`/book/${host.username}`} className="text-xs text-black/55 hover:underline">
          &larr; back to {host.name}
        </a>
        <h1 className="text-2xl font-semibold">{eventType.title}</h1>
        <p className="text-sm text-black/65">{eventType.durationMin} minutes &middot; with {host.name}</p>
        {eventType.description && <p className="mt-2 text-sm text-black/65">{eventType.description}</p>}
      </header>

      <BookingForm
        hostUsername={host.username}
        eventSlug={eventType.slug}
        slotsIso={slots.map((s) => s.toISOString())}
      />
    </div>
  );
}
