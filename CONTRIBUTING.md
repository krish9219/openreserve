# Contributing

Thanks for your interest in `openreserve`. The repo has a deliberate constraint: **one host, one URL, ~600 lines.** PRs that grow scope (multi-host, OAuth, team mode) are unlikely to land here — fork it.

## Setup

```bash
git clone https://github.com/krish9219/openreserve
cd openreserve
cp .env.example .env
npm install
npm run setup
npm run dev
```

## Likely to be accepted

- Bug fixes in the slot generator (`lib/availability.ts`).
- Better timezone handling.
- Buffer logic edge cases.
- New offline tests in `lib/availability.test.ts`.
- UX improvements that don't grow the file count.
- Email / Stripe / webhook hooks, **as separate files** that the user opts into.
- CI improvements.

## Unlikely to be accepted

- Multi-host support. That's Cal.com.
- Auth on the admin pages. The README says "reverse-proxy basic auth"; that's the recommendation.
- Calendar sync (Google, Outlook, iCloud). Too much maintenance burden.
- Switching the database default away from SQLite.

## PR checklist

- [ ] `npm test` passes.
- [ ] `npm run build` produces no type errors.
- [ ] README is updated if behavior changed.
- [ ] No new top-level dependency without justification in the PR description.
