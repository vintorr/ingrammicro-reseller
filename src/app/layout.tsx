import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "Techcareplus Reseller Store",
  description:
    "Shop the Techcareplus reseller catalog for enterprise technology, logistics support, and attach services across Canada.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased text-[var(--color-foreground)]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
