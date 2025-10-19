import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer"; // ✅ Added Footer import
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TechStore - Technology Solutions",
  description:
    "Your trusted partner for technology solutions. Browse our comprehensive range of products and get expert support.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}
      >
        <Providers>
          {/* ✅ Glassy transparent header visible on all pages */}
          <Header />

          {/* ✅ Main content (with padding to prevent overlap under header) */}
          <main className="pt-20">{children}</main>

          {/* ✅ Gradient footer consistent with header aesthetics */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
