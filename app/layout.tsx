import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Markdown Review", description: "Turn Markdown placeholders into interactive review forms." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <a className="brand" href="/" aria-label="Markdown Review home">
            <span className="brand-mark" aria-hidden="true">M↓</span>
            <span>Markdown Review</span>
          </a>
        </header>
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}
