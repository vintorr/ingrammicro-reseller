"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Sparkles,
  Star,
  Truck,
  Headphones,
  Boxes,
  ShieldCheck,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Laptop,
  Router,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/lib/hooks/useProducts";
import { useCart } from "@/lib/hooks/useCart";

const heroStats = [
  {
    label: "Vendors available",
    value: "220+",
    sub: "Tier-1 and emerging lines",
  },
  {
    label: "Orders ship within",
    value: "< 48 hrs",
    sub: "Canadian fulfilment centres",
  },
  {
    label: "Partner satisfaction",
    value: "98%",
    sub: "Post-delivery survey score",
  },
];

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: Array<{ icon: LucideIcon; label: string }>;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  artwork: {
    gradient: string;
    headline: string;
    subheadline: string;
    icons: LucideIcon[];
  };
};

const heroSlides: HeroSlide[] = [
  {
    id: "bundles",
    eyebrow: "Featured bundles",
    title: "Equip hybrid teams in one click",
    description:
      "Shop curated laptop, monitor, and accessory bundles that arrive configured and ready for hand-off to your customers.",
    highlights: [
      {
        icon: Laptop,
        label: "Top-brand notebooks with deployment-ready imaging options",
      },
      {
        icon: Headphones,
        label: "Docking, audio, and monitor kits built for modern work",
      },
    ],
    primaryCta: { label: "Shop featured bundles", href: "/products" },
    secondaryCta: { label: "Request volume quote", href: "/contact" },
    artwork: {
      gradient: "from-sky-500 via-blue-500 to-indigo-500",
      headline: "Ready to deploy",
      subheadline: "Laptops · docks · displays",
      icons: [Laptop, Headphones, Sparkles],
    },
  },
  {
    id: "infrastructure",
    eyebrow: "Infrastructure deals",
    title: "Keep networks moving without backorders",
    description:
      "Secure real-time availability on switching, Wi-Fi 6, and data centre gear backed by Techcareplus logistics across Canada.",
    highlights: [
      {
        icon: Router,
        label:
          "Enterprise networking, security, and collaboration lines in stock",
      },
      {
        icon: Truck,
        label: "Same-day fulfilment from Canadian distribution hubs",
      },
    ],
    primaryCta: { label: "Shop networking gear", href: "/products" },
    secondaryCta: { label: "Talk to a network specialist", href: "/contact" },
    artwork: {
      gradient: "from-emerald-500 via-teal-500 to-cyan-400",
      headline: "Always connected",
      subheadline: "Switches · Wi-Fi · security",
      icons: [Router, Boxes, Sparkles],
    },
  },
  {
    id: "attach-services",
    eyebrow: "Attach services & protection",
    title: "Capture recurring revenue on every sale",
    description:
      "Bundle warranties, deployment, and managed services through Techcareplus to stay close to your customers after the hardware ships.",
    highlights: [
      {
        icon: ShieldCheck,
        label: "Device protection, lifecycle, and recycling programs",
      },
      {
        icon: BarChart3,
        label: "Margin-friendly add-ons purpose-built for resellers",
      },
    ],
    primaryCta: { label: "Add services to quotes", href: "/contact" },
    secondaryCta: { label: "View partner programs", href: "/admin-access" },
    artwork: {
      gradient: "from-purple-600 via-indigo-500 to-blue-500",
      headline: "Attach value",
      subheadline: "Services · support · renewals",
      icons: [ShieldCheck, Cpu, Sparkles],
    },
  },
];

const artworkIconPositions = [
  "top-5 left-6",
  "top-14 right-8",
  "bottom-6 left-1/2 -translate-x-1/2",
];

export const HomePageClient = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slideCount = heroSlides.length;
  const { products, loading, searchProducts } = useProducts();
  const { addToCart } = useCart();
  const currentSlide = heroSlides[activeSlide];

  const features = [
    {
      icon: <Boxes className="h-8 w-8 text-blue-600" />,
      title: "Bulk-ready catalog",
      description:
        "Volume pricing on 220+ vendors with availability refreshed every morning.",
    },
    {
      icon: <Truck className="h-8 w-8 text-emerald-600" />,
      title: "Canada-wide fulfilment",
      description:
        "Drop-ship to customer sites with same-day pick, pack, and tracking updates.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-purple-600" />,
      title: "Attach services easily",
      description:
        "Add warranties, deployment, and lifecycle services in the same checkout flow.",
    },
  ];

  const testimonials = [
    {
      name: "Priya Desai",
      company: "Northlight IT",
      rating: 5,
      comment:
        "Techcareplus keeps our drop-ship orders on schedule and helps us hit customer SLAs every time.",
    },
    {
      name: "Anthony Morales",
      company: "Bridgeview Solutions",
      rating: 5,
      comment:
        "Our account team surfaces real inventory and promos before quotes go out—huge competitive edge.",
    },
    {
      name: "Mei Chen",
      company: "Skyline MSP",
      rating: 5,
      comment:
        "Bundling services and renewals through Techcareplus adds revenue without adding admin overhead.",
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideCount);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [slideCount]);

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
      <section className="relative overflow-hidden rounded-[32px] bg-white text-[var(--color-foreground)] shadow-[0_24px_48px_rgba(16,35,71,0.08)]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-sky-50" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="relative min-h-[27rem]">
            {heroSlides.map((slide, index) => {
              const isActive = index === activeSlide;
              return (
                <article
                  key={slide.id}
                  aria-hidden={!isActive}
                  className={`grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center transition-all duration-700 ease-out ${
                    isActive
                      ? "relative opacity-100 translate-y-0"
                      : "pointer-events-none absolute inset-0 opacity-0 translate-y-6"
                  }`}
                >
                  <div className="max-w-2xl space-y-7">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/85 px-4 py-1 text-sm font-medium text-[#062fa3] shadow-[0_10px_20px_rgba(37,99,235,0.08)]">
                      <Sparkles className="h-4 w-4" />
                      {slide.eyebrow}
                    </span>
                    <h1 className="text-[clamp(2.3rem,4vw,3.6rem)] font-semibold leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-base leading-relaxed text-[var(--color-muted)]">
                      {slide.description}
                    </p>

                    <ul className="grid gap-3 pt-1 sm:grid-cols-2">
                      {slide.highlights.map(({ icon: Icon, label }) => (
                        <li
                          key={label}
                          className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 shadow-[0_8px_18px_rgba(16,35,71,0.08)]"
                        >
                          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#062fa3]/10 text-[#062fa3]">
                            <Icon className="h-5 w-5" />
                          </span>
                          <p className="text-sm text-[var(--color-muted)]">
                            {label}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                      <Link href={slide.primaryCta.href}>
                        <Button size="lg">{slide.primaryCta.label}</Button>
                      </Link>
                      {slide.secondaryCta && (
                        <Link href={slide.secondaryCta.href}>
                          <Button
                            size="lg"
                            variant="secondary"
                            className="border-[var(--color-border)] bg-white/90 text-[var(--color-foreground)] hover:bg-white"
                          >
                            {slide.secondaryCta.label}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div
                      className={`relative h-full min-h-[320px] overflow-hidden rounded-[28px] bg-gradient-to-br ${slide.artwork.gradient}`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
                      <div className="absolute inset-4 rounded-[24px] border border-white/20 backdrop-blur-sm" />
                      <div className="absolute -top-24 right-8 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
                      <div className="absolute bottom-0 left-1/2 h-48 w-48 -translate-x-1/2 translate-y-10 rounded-full bg-white/10 blur-2xl" />
                      <div className="relative flex h-full flex-col justify-between p-8 text-white">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                            {slide.artwork.headline}
                          </p>
                          <p className="mt-3 text-2xl font-semibold">
                            {slide.artwork.subheadline}
                          </p>
                        </div>
                        <div className="relative mt-6 h-32">
                          {slide.artwork.icons.map(
                            (IconComponent, iconIndex) => (
                              <span
                                key={`${slide.id}-icon-${iconIndex}`}
                                className={`pointer-events-none absolute flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur ${artworkIconPositions[iconIndex]}`}
                              >
                                <IconComponent className="h-8 w-8 text-white" />
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-[var(--color-muted)]">
              <span className="font-semibold text-[var(--color-foreground)]">
                {String(activeSlide + 1).padStart(2, "0")}
              </span>
              <span className="mx-1 text-[var(--color-muted)]">/</span>
              {String(slideCount).padStart(2, "0")} · {currentSlide.title}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setActiveSlide((prev) => (prev - 1 + slideCount) % slideCount)
                }
                aria-label="Show previous hero slide"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeSlide
                        ? "w-10 bg-[#062fa3]"
                        : "w-6 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setActiveSlide((prev) => (prev + 1) % slideCount)
                }
                aria-label="Show next hero slide"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-4 text-center shadow-[0_10px_24px_rgba(16,35,71,0.08)] backdrop-blur"
              >
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--color-foreground)]">
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--color-muted)]">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Techcareplus?
            </h2>
            <p className="text-lg text-gray-600">
              We blend distribution scale with concierge support for Canadian
              resellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
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
              See what Techcareplus partners are shipping this week
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
              <Button size="lg">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
