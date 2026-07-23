"use client";

import { useEffect, useState, type ReactNode } from "react";

export function StickyHeader({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
        scrolled
          ? "border-primary-100 bg-white/90 backdrop-blur"
          : "border-transparent bg-transparent"
      }`}
    >
      {children}
    </header>
  );
}
