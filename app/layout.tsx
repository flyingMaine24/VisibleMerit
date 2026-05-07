import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visible Merit",
  description: "Make real work visible."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand-lockup" href="/" aria-label="Visible Merit home">
            <span className="brand-mark" aria-hidden="true">V</span>
            <span>
              <strong>Visible <em>Merit</em></strong>
              <small>Make real work visible.</small>
            </span>
          </Link>
          <nav className="site-nav" aria-label="Primary navigation">
            <Link href="/intake">Start</Link>
            <Link href="/preview/demo-pack">Sample</Link>
            <Link href="/account">Account</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
