/**
 * Slot computation. Given a host's recurring availability rules, the requested
 * date range, and the existing bookings, return the bookable start times.
 *
 * Times in AvailabilityRule are minutes-after-midnight in the host's local
 * timezone. We compute candidate slots in host-local time, then convert to UTC
 * to compare against bookings.
 */

import { addDays, addMinutes, isBefore, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export interface Rule {
  dayOfWeek: number;
  startMin: number;
  endMin: number;
}

export interface Booking {
  startUtc: Date;
  endUtc: Date;
}

export interface SlotsInput {
  rules: Rule[];
  bookings: Booking[];
  timezone: string;
  durationMin: number;
  bufferMin?: number;
  rangeStart: Date;
  rangeEnd: Date;
  granularityMin?: number;
}

export function generateSlots(input: SlotsInput): Date[] {
  const {
    rules,
    bookings,
    timezone,
    durationMin,
    bufferMin = 0,
    rangeStart,
    rangeEnd,
    granularityMin = 15,
  } = input;

  if (durationMin <= 0) throw new Error("durationMin must be > 0");

  const slots: Date[] = [];
  const rulesByDay = new Map<number, Rule[]>();
  for (const r of rules) {
    const arr = rulesByDay.get(r.dayOfWeek) ?? [];
    arr.push(r);
    rulesByDay.set(r.dayOfWeek, arr);
  }

  let cursor = startOfDay(toZonedTime(rangeStart, timezone));
  const end = toZonedTime(rangeEnd, timezone);

  while (isBefore(cursor, end)) {
    const dow = cursor.getDay();
    const dayRules = rulesByDay.get(dow) ?? [];
    for (const rule of dayRules) {
      const dayStart = startOfDay(cursor);
      let slotStartLocal = addMinutes(dayStart, rule.startMin);
      const dayEndLocal = addMinutes(dayStart, rule.endMin);
      while (true) {
        const slotEndLocal = addMinutes(slotStartLocal, durationMin);
        if (slotEndLocal > dayEndLocal) break;
        const slotStartUtc = fromZonedTime(slotStartLocal, timezone);
        const slotEndUtc = fromZonedTime(slotEndLocal, timezone);
        const overlaps = bookings.some(
          (b) =>
            slotStartUtc < new Date(b.endUtc.getTime() + bufferMin * 60_000) &&
            slotEndUtc > new Date(b.startUtc.getTime() - bufferMin * 60_000),
        );
        const now = new Date();
        if (!overlaps && slotStartUtc > now && slotStartUtc < rangeEnd) {
          slots.push(slotStartUtc);
        }
        slotStartLocal = addMinutes(slotStartLocal, granularityMin);
      }
    }
    cursor = addDays(cursor, 1);
  }
  return slots;
}
