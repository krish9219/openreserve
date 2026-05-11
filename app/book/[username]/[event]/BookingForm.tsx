"use client";

import { useMemo, useState } from "react";
import { createBooking } from "@/lib/actions";

export function BookingForm({
  hostUsername,
  eventSlug,
  slotsIso,
}: {
  hostUsername: string;
  eventSlug: string;
  slotsIso: string[];
}) {
  const slots = useMemo(() => slotsIso.map((s) => new Date(s)), [slotsIso]);
  const groups = useMemo(() => {
    const out = new Map<string, Date[]>();
    for (const s of slots) {
      const key = s.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      const arr = out.get(key) ?? [];
      arr.push(s);
      out.set(key, arr);
    }
    return Array.from(out.entries());
  }, [slots]);

  const [selected, setSelected] = useState<Date | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (confirmedAt) {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-5">
        <h2 className="font-semibold">You're booked.</h2>
        <p className="text-sm text-black/70 mt-1">
          {confirmedAt.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })} &middot; with {hostUsername}
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    const res = await createBooking({
      hostUsername,
      eventSlug,
      startUtc: selected.toISOString(),
      inviteeName: name,
      inviteeEmail: email,
      notes,
    });
    setSubmitting(false);
    if (res.ok) setConfirmedAt(selected);
    else setError(res.error);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr,1fr]">
      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-black/55">Pick a time</h2>
        {groups.length === 0 ? (
          <p className="text-sm text-black/65">No availability in the next two weeks.</p>
        ) : (
          <div className="space-y-4">
            {groups.map(([day, daySlots]) => (
              <div key={day}>
                <div className="text-xs font-medium uppercase text-black/55">{day}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {daySlots.map((s) => {
                    const active = selected?.getTime() === s.getTime();
                    return (
                      <button
                        key={s.toISOString()}
                        type="button"
                        onClick={() => setSelected(s)}
                        className={
                          "rounded-md border px-3 py-1.5 text-sm transition " +
                          (active
                            ? "border-ink bg-ink text-white"
                            : "border-black/15 bg-white hover:border-black/40")
                        }
                      >
                        {s.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="space-y-3">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-black/55">Your details</h2>
        <Field label="Name">
          <input required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm" />
        </Field>
        <Field label="Email">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm" />
        </Field>
        <Field label="Notes (optional)">
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm" />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={!selected || submitting}
          className="w-full rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {submitting ? "Confirming…" : selected ? "Confirm booking" : "Pick a time first"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-black/65">{label}</span>
      {children}
    </label>
  );
}
