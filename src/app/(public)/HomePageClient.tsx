'use client';

import { useEffect } from 'react';
import { BarChart3, CheckCircle, Sparkles, Star, Truck, Shield, Headphones } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCart } from '@/lib/hooks/useCart';

const heroStats = [
  { label: 'Skus ready to ship', value: '475K+', sub: 'Multi-vendor catalog' },
  { label: 'US distribution centers', value: '35', sub: 'Late cut-off windows' },
  { label: 'Customer satisfaction', value: '98%', sub: 'Post-order CSAT score' },
];

export const HomePageClient = () => {
  const { products, loading, searchProducts } = useProducts();
  const { addToCart } = useCart();

  const features = [
    {
      icon: <Truck className="w-8 h-8 text-blue-600" />,
      title: "Fast Shipping",
      description: "Free shipping on orders over $500"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Secure Payment",
      description: "Your payment information is safe with us"
    },
    {
      icon: <Headphones className="w-8 h-8 text-purple-600" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support"
    }
  ];

  const testimonials = [
    {
      name: "John Smith",
      company: "TechCorp Inc.",
      rating: 5,
      comment: "Excellent service and fast delivery. Highly recommended!"
    },
    {
      name: "Sarah Johnson",
      company: "Innovate Solutions",
      rating: 5,
      comment: "Great products and outstanding customer support."
    },
    {
      name: "Mike Davis",
      company: "Digital Dynamics",
      rating: 5,
      comment: "Reliable partner for all our technology needs."
    }
  ];

  useEffect(() => {
    searchProducts({ pageNumber: 1, pageSize: 8 });
  }, [searchProducts]);

  const handleAddToCart = (product: any) => {
    const cartItem = {
      product,
      quantity: 1,
      unitPrice: product.price || 0,
      totalPrice: product.price || 0,
    };
    addToCart(cartItem);
  };

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[32px] gradient-hero text-[var(--color-foreground)] shadow-[0_24px_48px_rgba(16,35,71,0.08)]">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-[var(--color-primary-light)] blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[rgba(96,165,250,0.25)] blur-[160px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/85 px-4 py-1 text-sm font-medium text-[var(--color-primary)] shadow-[0_10px_20px_rgba(37,99,235,0.08)]">
                <Sparkles className="h-4 w-4" />
                Technology commerce reimagined
              </span>
              <h1 className="text-[clamp(2.3rem,4vw,3.6rem)] font-semibold leading-tight">
                Build, sell, and deliver outcomes your customers can feel.
              </h1>
              <p className="text-base leading-relaxed text-[var(--color-muted)]">
                Real-time catalog intelligence, lifecycle services, and procurement automation—designed for
                resellers, MSPs, and enterprise procurement desks who need to move faster with less friction.
              </p>

              <div className="grid gap-3 pt-1 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 shadow-[0_8px_18px_rgba(16,35,71,0.08)]">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">Outcome-led expertise</p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Solution architects and licensing specialists embedded in every engagement.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 shadow-[0_8px_18px_rgba(16,35,71,0.08)]">
                  <BarChart3 className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">Procurement velocity</p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Punchout, EDI, and API integrations tuned for high-volume transaction flows.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link href="/products">
                  <Button size="lg">Browse catalog</Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="border-[var(--color-border)] bg-white/90 text-[var(--color-foreground)] hover:bg-white"
                  >
                    Talk to a specialist
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 pt-6 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 text-center shadow-[0_10px_24px_rgba(16,35,71,0.06)]"
                  >
                    <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--color-foreground)]">{stat.value}</p>
                    <p className="text-xs text-[var(--color-muted)]">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5 rounded-[28px] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_22px_48px_rgba(16,35,71,0.12)]">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                  Platform snapshot
                </p>
                <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                  Built for lifecycle outcomes—not just transactions.
                </h2>
                <p className="text-sm text-[var(--color-muted)]">
                  Launch new practices, expand recurring revenue, and modernize procurement without rebuilding
                  your tech stack from scratch.
                </p>
              </div>

              <div className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-light)]/60 p-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Real-time insights</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--color-foreground)]">Contract pricing API</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Instant price & availability with promotions and attach suggestions surfaced for each SKU.
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-white p-5">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Lifecycle automation</p>
                <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                  <li>• Guided quoting flows with margin checkpoints.</li>
                  <li>• Renewal orchestration and warranty automation.</li>
                  <li>• Services attach playbooks across cloud, security, and workplace.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose TechStore?
            </h2>
            <p className="text-lg text-gray-600">
              We provide exceptional service and quality products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Discover our most popular technology solutions
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.ingramPartNumber}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetails={() => {}}
                  priceAvailabilityData={null}
                  priceLoading={false}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/products">
              <Button size="lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              Trusted by businesses worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers and transform your business today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary">
                Browse Products
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="secondary"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
