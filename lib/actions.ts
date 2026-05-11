"use server";

import { z } from "zod";
import { db } from "./db";

const BookingInput = z.object({
  hostUsername: z.string().min(1),
  eventSlug: z.string().min(1),
  startUtc: z.string().datetime(),
  inviteeName: z.string().min(1).max(120),
  inviteeEmail: z.string().email(),
  notes: z.string().max(2000).optional(),
});

export type BookingResult = { ok: true; bookingId: string } | { ok: false; error: string };

export async function createBooking(input: unknown): Promise<BookingResult> {
  const parsed = BookingInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const data = parsed.data;

  const host = await db.host.findUnique({
    where: { username: data.hostUsername },
    include: { eventTypes: { where: { slug: data.eventSlug } } },
  });
  if (!host || host.eventTypes.length === 0) return { ok: false, error: "Host or event not found" };
  const eventType = host.eventTypes[0];

  const start = new Date(data.startUtc);
  if (Number.isNaN(start.getTime())) return { ok: false, error: "Invalid start time" };
  if (start.getTime() <= Date.now()) return { ok: false, error: "That time is in the past" };
  const end = new Date(start.getTime() + eventType.durationMin * 60_000);

  const conflict = await db.booking.findFirst({
    where: {
      hostId: host.id,
      status: "confirmed",
      AND: [{ startUtc: { lt: end } }, { endUtc: { gt: start } }],
    },
    select: { id: true },
  });
  if (conflict) return { ok: false, error: "Someone just booked that slot. Pick another." };

  const booking = await db.booking.create({
    data: {
      hostId: host.id,
      eventTypeId: eventType.id,
      inviteeName: data.inviteeName,
      inviteeEmail: data.inviteeEmail,
      notes: data.notes,
      startUtc: start,
      endUtc: end,
    },
  });
  return { ok: true, bookingId: booking.id };
}

const RuleInput = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startMin: z.number().int().min(0).max(24 * 60),
  endMin: z.number().int().min(0).max(24 * 60),
});

export async function saveAvailability(rules: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = z.array(RuleInput).safeParse(rules);
  if (!parsed.success) return { ok: false, error: "Invalid rules" };
  for (const r of parsed.data) {
    if (r.startMin >= r.endMin) return { ok: false, error: `Row for day ${r.dayOfWeek}: start must be before end` };
  }
  const username = process.env.HOST_USERNAME ?? "demo";
  const host = await db.host.findUnique({ where: { username } });
  if (!host) return { ok: false, error: `No host with username ${username}` };

  await db.$transaction([
    db.availabilityRule.deleteMany({ where: { hostId: host.id } }),
    db.availabilityRule.createMany({
      data: parsed.data.map((r) => ({ ...r, hostId: host.id })),
    }),
  ]);
  return { ok: true };
}
