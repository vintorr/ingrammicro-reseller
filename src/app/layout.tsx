import { Providers } from "./providers";
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
