import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Civora — AI-Powered Civic Intelligence Platform",
  description:
    "See. Understand. Resolve. — Civora enables citizens to identify, report, validate, track, and resolve community issues through AI-powered intelligence and collaboration.",
  keywords: [
    "civic intelligence",
    "community issues",
    "AI platform",
    "smart city",
    "complaint management",
    "CORA",
    "Gemini AI",
  ],
  authors: [{ name: "Civora Team" }],
  openGraph: {
    title: "Civora — AI-Powered Civic Intelligence Platform",
    description:
      "See. Understand. Resolve. — Report, verify, and resolve community issues with AI intelligence.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
