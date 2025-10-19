"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer aria-label="Site footer" className="mt-16 px-4 sm:px-6">
      <div
        className="mx-auto w-full max-w-screen-xl overflow-hidden rounded-2xl shadow-lg"
        style={{
          background: "linear-gradient(135deg, #0983d2 0%, #142e75 100%)",
        }}
      >
        <div className="flex flex-col items-center justify-between gap-3 px-[clamp(1rem,3vw,2rem)] py-[clamp(0.8rem,1.5vw,1.2rem)] md:flex-row md:gap-6">
          {/* Logo */}
          <Link href="/" aria-label="Home" className="flex-shrink-0">
            <Image
              src="/images/logo.webp"
              alt="Logo"
              width={140}
              height={44}
              className="h-auto w-[clamp(6rem,9vw,8rem)] object-contain"
              priority
            />
          </Link>

          {/* Description */}
          <p className="max-w-md text-center text-sm leading-snug text-white/85 md:text-base">
            Trusted technology & solutions partner helping businesses scale confidently.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-[clamp(0.5rem,1vw,0.9rem)]">
            <a
              href="https://www.linkedin.com/company/techcareplus/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white transition hover:opacity-90"
              title="LinkedIn"
            >
              <Linkedin size={20} />
            </a>

            <a
              href="https://www.facebook.com/techcareplusinc"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white transition hover:opacity-90"
              title="Facebook"
            >
              <Facebook size={20} />
            </a>

            <a
              href="https://instagram.com/techcareplusinc"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white transition hover:opacity-90"
              title="Instagram"
            >
              <Instagram size={20} />
            </a>

            <a
              href="https://wa.me/14374777587"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-white transition hover:opacity-90"
              title="WhatsApp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
              </svg>
            </a>

            <a
              href="mailto:info@techcareplus.ca"
              aria-label="Email"
              className="text-white transition hover:opacity-90"
              title="Email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="border-t border-white/20 px-[clamp(1rem,3vw,2rem)] py-2 text-center text-xs text-white/80">
          © {new Date().getFullYear()} TechCare Plus. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
