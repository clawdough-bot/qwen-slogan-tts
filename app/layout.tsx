import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Qwen Slogan TTS",
  description: "Generator sloganów audio na Qwen3-TTS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
