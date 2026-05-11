# Security policy

## Supported versions

Only the `main` branch is supported. There are no version releases yet.

## Reporting

Email the maintainer via the GitHub profile, or use GitHub's private vulnerability reporting. Please do not open public issues for security concerns.

## Known threat surface

- **Admin pages are unauthenticated by design.** `/availability` and `/bookings` are reachable to anyone who can reach the deployment. Before deploying publicly, put them behind reverse-proxy basic auth, Cloudflare Access, or add NextAuth. This is documented in the README.
- **Server actions** (`createBooking`, `saveAvailability`) validate input with Zod. The booking flow re-checks slot availability inside the same database transaction.
- **No CSRF tokens** on server actions — Next.js server actions use a one-time action ID that is bound to the form, which provides equivalent protection.
- **SQLite file permissions** are the operating system's responsibility. Don't run as root and don't put `prisma/dev.db` in a world-readable directory.

If you find a vulnerability in the slot generator, the conflict check, or the input validation, please report it.
