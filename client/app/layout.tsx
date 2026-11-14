import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans/wght.css";
import "@fontsource-variable/plus-jakarta-sans/wght-italic.css";
import "@fontsource-variable/noto-sans-malayalam/wght.css";
import "./globals.css";
import "./portal.css";
import { AppProviders } from "@/lib/auth";

export const metadata: Metadata = {
  title: "vithu | From farm to market",
  description: "A simpler way for farmers and buyers to connect around every harvest.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
