import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Becoming HER Studio",
  description: "The AI creator operating system for women in their becoming.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
