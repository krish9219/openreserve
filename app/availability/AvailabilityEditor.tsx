"use client";

import { useState } from "react";
import { saveAvailability } from "@/lib/actions";

interface Rule {
  dayOfWeek: number;
  startMin: number;
  endMin: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toHHMM(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

function fromHHMM(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function AvailabilityEditor({ initial }: { initial: Rule[] }) {
  const [rules, setRules] = useState<Rule[]>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string>("");

  function update(i: number, patch: Partial<Rule>) {
    setRules((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function add() {
    setRules((rs) => [...rs, { dayOfWeek: 1, startMin: 9 * 60, endMin: 17 * 60 }]);
  }

  function remove(i: number) {
    setRules((rs) => rs.filter((_, idx) => idx !== i));
  }

  async function save() {
    setStatus("saving");
    const res = await saveAvailability(rules);
    if (res.ok) {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      setStatus("error");
      setError(res.error ?? "Unknown error");
    }
  }

  return (
    <div className="space-y-3">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-black/55">
          <tr><th className="py-2 text-left">Day</th><th className="text-left">Start</th><th className="text-left">End</th><th></th></tr>
        </thead>
        <tbody>
          {rules.map((r, i) => (
            <tr key={i} className="border-t border-black/5">
              <td className="py-2">
                <select value={r.dayOfWeek} onChange={(e) => update(i, { dayOfWeek: Number(e.target.value) })}
                  className="rounded-md border border-black/15 bg-white px-2 py-1">
                  {DAYS.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
                </select>
              </td>
              <td className="py-2">
                <input type="time" value={toHHMM(r.startMin)} onChange={(e) => update(i, { startMin: fromHHMM(e.target.value) })}
                  className="rounded-md border border-black/15 bg-white px-2 py-1" />
              </td>
              <td className="py-2">
                <input type="time" value={toHHMM(r.endMin)} onChange={(e) => update(i, { endMin: fromHHMM(e.target.value) })}
                  className="rounded-md border border-black/15 bg-white px-2 py-1" />
              </td>
              <td className="py-2 text-right">
                <button onClick={() => remove(i)} className="text-xs text-red-600 hover:underline">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-3">
        <button onClick={add} className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-sm hover:bg-black/5">
          + Add window
        </button>
        <button onClick={save} disabled={status === "saving"}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40">
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {status === "saved" && <span className="text-sm text-emerald-600">Saved</span>}
        {status === "error" && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
