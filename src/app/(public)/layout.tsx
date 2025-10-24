import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <Header />
      <main className="pt-24">
        <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
