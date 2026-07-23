import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "نظام كشف تعارض الجداول الدراسية | الأكاديمية الحديثة",
  description:
    "ابني جدولك الدراسي واكتشف أي تعارض في المواعيد بين المواد قبل التسجيل.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="relative flex min-h-full flex-col">
        <div className="hero-backdrop pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px]" aria-hidden="true" />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
