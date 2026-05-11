import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSlots, type Rule } from "./availability.js";

const TZ = "Asia/Kolkata";

function mondayAt(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`);
}

test("generates slots within availability window", () => {
  const future = new Date();
  future.setUTCDate(future.getUTCDate() + 1);
  future.setUTCHours(0, 0, 0, 0);
  while (future.getUTCDay() !== 1) future.setUTCDate(future.getUTCDate() + 1);

  const rangeEnd = new Date(future);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

  const rules: Rule[] = [{ dayOfWeek: 1, startMin: 9 * 60, endMin: 11 * 60 }];
  const slots = generateSlots({
    rules,
    bookings: [],
    timezone: TZ,
    durationMin: 30,
    rangeStart: future,
    rangeEnd,
    granularityMin: 30,
  });

  assert.ok(slots.length > 0, "expected at least one slot");
  assert.ok(slots.length <= 4, "expected at most 4 slots in 2-hour window");
});

test("excludes slots that overlap with bookings", () => {
  const future = new Date();
  future.setUTCDate(future.getUTCDate() + 7);
  future.setUTCHours(0, 0, 0, 0);
  while (future.getUTCDay() !== 1) future.setUTCDate(future.getUTCDate() + 1);

  const rangeEnd = new Date(future);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

  const rules: Rule[] = [{ dayOfWeek: 1, startMin: 9 * 60, endMin: 11 * 60 }];
  const slotsBefore = generateSlots({
    rules, bookings: [], timezone: TZ, durationMin: 30,
    rangeStart: future, rangeEnd, granularityMin: 30,
  });

  const conflictStart = slotsBefore[0];
  const conflictEnd = new Date(conflictStart.getTime() + 30 * 60_000);
  const slotsAfter = generateSlots({
    rules,
    bookings: [{ startUtc: conflictStart, endUtc: conflictEnd }],
    timezone: TZ, durationMin: 30, rangeStart: future, rangeEnd, granularityMin: 30,
  });
  assert.equal(slotsAfter.length, slotsBefore.length - 1);
  assert.ok(!slotsAfter.some((s) => s.getTime() === conflictStart.getTime()));
});

test("respects buffer between bookings", () => {
  const future = new Date();
  future.setUTCDate(future.getUTCDate() + 14);
  future.setUTCHours(0, 0, 0, 0);
  while (future.getUTCDay() !== 1) future.setUTCDate(future.getUTCDate() + 1);

  const rangeEnd = new Date(future);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

  const rules: Rule[] = [{ dayOfWeek: 1, startMin: 9 * 60, endMin: 12 * 60 }];
  const slotsBefore = generateSlots({
    rules, bookings: [], timezone: TZ, durationMin: 30,
    rangeStart: future, rangeEnd, granularityMin: 30,
  });
  const bookedStart = slotsBefore[1];
  const bookedEnd = new Date(bookedStart.getTime() + 30 * 60_000);
  const slotsWithBuffer = generateSlots({
    rules,
    bookings: [{ startUtc: bookedStart, endUtc: bookedEnd }],
    timezone: TZ, durationMin: 30, bufferMin: 15,
    rangeStart: future, rangeEnd, granularityMin: 30,
  });
  assert.ok(slotsWithBuffer.length < slotsBefore.length - 1, "buffer should remove neighboring slots too");
});

test("skips past slots", () => {
  const past = new Date();
  past.setUTCDate(past.getUTCDate() - 7);
  const pastEnd = new Date();
  const rules: Rule[] = [
    { dayOfWeek: 0, startMin: 0, endMin: 24 * 60 },
    { dayOfWeek: 1, startMin: 0, endMin: 24 * 60 },
    { dayOfWeek: 2, startMin: 0, endMin: 24 * 60 },
    { dayOfWeek: 3, startMin: 0, endMin: 24 * 60 },
    { dayOfWeek: 4, startMin: 0, endMin: 24 * 60 },
    { dayOfWeek: 5, startMin: 0, endMin: 24 * 60 },
    { dayOfWeek: 6, startMin: 0, endMin: 24 * 60 },
  ];
  const slots = generateSlots({
    rules, bookings: [], timezone: TZ, durationMin: 30,
    rangeStart: past, rangeEnd: pastEnd, granularityMin: 30,
  });
  assert.equal(slots.length, 0);
});
