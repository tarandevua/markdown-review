import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Markdown Review", description: "Turn Markdown placeholders into interactive review forms." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><main className="shell">{children}</main></body></html>;
}
