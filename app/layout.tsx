import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MOSAI — Tu link in bio, pero bonito",
    template: "%s | MOSAI",
  },
  description:
    "Un mosaico visual de enlaces donde cada pieza es una imagen clicable. Simple, bonito, para todos.",
  keywords: ["link in bio", "mosaic", "linktree", "creator", "instagram"],
  authors: [{ name: "MOSAI" }],
  openGraph: {
    title: "MOSAI — Tu link in bio, pero bonito",
    description:
      "Un mosaico visual de enlaces donde cada pieza es una imagen clicable.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${jakarta.variable} ${fraunces.variable} ${mono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
