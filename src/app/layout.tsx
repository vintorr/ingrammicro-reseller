import { Providers } from "./providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer"; // ✅ Added Footer import
import "./globals.css";

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
      <body className="font-sans antialiased text-[var(--color-foreground)]">
        <Providers>
          {/* ✅ Glassy transparent header visible on all pages */}
          <Header />

          {/* ✅ Main content (with padding to prevent overlap under header) */}
          <main className="pt-24">
            <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>

          {/* ✅ Gradient footer consistent with header aesthetics */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
