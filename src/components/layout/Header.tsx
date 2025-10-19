"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Boxes,
  Grid2x2,
} from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [useDarkText, setUseDarkText] = useState(true);
  const headerRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const { totalItems, openCartDrawer } = useCart();

  const parseRGB = (cssColor: string | null) => {
    if (!cssColor) return null;
    const m = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/i);
    if (!m) return null;
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
  };

  const brightnessFromRGB = ({ r, g, b }: { r: number; g: number; b: number }) =>
    (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  const determineTextColor = () => {
    const header = headerRef.current;
    if (!header || typeof document === "undefined") return;

    const rect = header.getBoundingClientRect();
    const x = Math.max(1, Math.min(window.innerWidth - 1, rect.left + rect.width / 2));
    const y = Math.max(1, Math.min(window.innerHeight - 1, rect.bottom + 1));

    let el = document.elementFromPoint(x, y) as HTMLElement | null;
    let foundColor: string | null = null;

    while (el && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      const bgImage = style.backgroundImage;

      if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)" && bg !== "initial") {
        foundColor = bg;
        break;
      }

      if (bgImage && bgImage !== "none") break;
      el = el.parentElement;
    }

    let colorToUse = foundColor;
    if (!colorToUse) {
      const bodyStyle = window.getComputedStyle(document.body);
      colorToUse = bodyStyle.backgroundColor || null;
    }

    const rgb = parseRGB(colorToUse);
    if (rgb) {
      const bright = brightnessFromRGB(rgb);
      setUseDarkText(bright > 0.65);
    } else {
      setUseDarkText(true);
    }
  };

  useEffect(() => {
    determineTextColor();

    const onScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => determineTextColor());
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    let mo: MutationObserver | null = null;
    try {
      mo = new MutationObserver(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => determineTextColor());
      });
      mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    } catch (e) {}

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (mo) mo.disconnect();
    };
  }, []);

  const textClass = useDarkText ? "text-gray-900" : "text-white";
  const borderClass = useDarkText ? "border-gray-200" : "border-white/20";

  const navItems = [
    { name: "Products", href: "/products", icon: Boxes },
    { name: "Categories", href: "/categories", icon: Grid2x2 },
    { name: "Account", href: "/account", icon: User },
  ];

  return (
    <header
      ref={headerRef}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50
        w-[94%] md:w-[90%] lg:w-[85%] max-w-[1200px]
        rounded-2xl px-[clamp(0.8rem,3.5vw,2.5rem)] py-[clamp(0.45rem,1vw,0.9rem)]
        flex items-center justify-between
        backdrop-blur-3xl bg-white/15 border shadow-lg
        transition-all duration-300 ${textClass} ${borderClass}`}
      style={{ height: 72 }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <div className="relative" style={{ transform: "scale(0.85)", marginTop: -1 }}>
          <Image
            src="/images/logo.webp"
            alt="Logo"
            width={120}
            height={36}
            className="object-contain"
            priority
          />
        </div>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-[clamp(1rem,2vw,1.5rem)] font-medium">
        {navItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={name}
            href={href}
            className="group flex flex-col items-center gap-[2px] relative transition-all"
          >
            <div className="flex items-center gap-2">
              <Icon size={18} strokeWidth={2} />
              <span>{name}</span>
            </div>
            <span className="absolute -bottom-[3px] left-0 w-0 h-[2px] bg-current rounded-full transition-all duration-300 group-hover:w-full"></span>
          </Link>
        ))}
        <button
          onClick={openCartDrawer}
          className="relative flex flex-col items-center gap-[2px] transition-all focus:outline-none group"
          aria-label="Open shopping cart"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} strokeWidth={2} />
            <span>Cart</span>
          </div>
          <span className="absolute -bottom-[3px] left-0 w-0 h-[2px] bg-current rounded-full transition-all duration-300 group-hover:w-full"></span>
          {totalItems > 0 && (
            <span className="absolute -top-3 -right-3 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>
      </nav>

      {/* Mobile Actions */}
      <div className="md:hidden flex items-center gap-3">
        <button
          onClick={() => {
            setMenuOpen(false);
            openCartDrawer();
          }}
          className={`relative focus:outline-none ${useDarkText ? "text-gray-900" : "text-white"}`}
          aria-label="Open shopping cart"
        >
          <ShoppingCart size={24} />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 inline-flex min-h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[0.65rem] font-semibold text-white">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>
        <button
          className={`focus:outline-none ${useDarkText ? "text-gray-900" : "text-white"}`}
          onClick={() => setMenuOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full mt-3 p-4 md:p-6 rounded-2xl border shadow-lg bg-white text-gray-900 border-gray-200">
          <nav className="flex flex-col items-stretch text-lg font-medium">
            {navItems.map(({ name, href, icon: Icon }, idx) => (
              <div key={name}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-3 hover:opacity-80 transition-opacity text-gray-900"
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{name}</span>
                </Link>

                {idx < navItems.length - 1 && (
                  <div className="mx-4 border-t border-gray-200/60" />
                )}
              </div>
            ))}
          </nav>
          <div className="mt-3 border-t border-gray-200/60 pt-3">
            <button
              onClick={() => {
                setMenuOpen(false);
                openCartDrawer();
              }}
              className="w-full flex items-center justify-between gap-2 px-2 py-3 text-gray-900 hover:opacity-80 transition-opacity"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart size={18} strokeWidth={2} />
                <span>Cart</span>
              </span>
              {totalItems > 0 && (
                <span className="inline-flex min-h-[1.2rem] min-w-[1.2rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
