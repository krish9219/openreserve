import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "openreserve — open-source scheduling",
  description: "An open-source Calendly alternative you can self-host in 60 seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <header className="border-b border-black/10 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <a href="/" className="text-lg font-semibold tracking-tight">openreserve</a>
            <nav className="flex gap-6 text-sm">
              <a href={`/book/${process.env.HOST_USERNAME ?? "demo"}`} className="hover:underline">Public page</a>
              <a href="/availability" className="hover:underline">Availability</a>
              <a href="/bookings" className="hover:underline">Bookings</a>
              <a href="https://github.com/krish9219/openreserve" className="hover:underline">GitHub</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="mx-auto mt-20 max-w-5xl px-6 py-8 text-xs text-black/50">
          Self-hosted on your own infrastructure. MIT licensed.
        </footer>
      </body>
    </html>
  );
}
