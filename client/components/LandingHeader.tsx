"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <Link href="/" className="brand" aria-label="vithu home">
        <Image className="brand-logo" src="/images/vithu-logo.png" alt="" width={36} height={36} />
        vithu
      </Link>
      <nav className="primary-nav" aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#how-it-works">How it works</a>
        <a href="#farmers">For farmers</a>
        <a href="#buyers">For buyers</a>
      </nav>
      <div className="header-actions">
        <Link className="header-login" href="/login">Log in</Link>
        <Link className="button button-small button-green" href="/register">
          Get started <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <details className="mobile-nav">
        <summary>Menu</summary>
        <div>
          <a href="#home">Home</a>
          <a href="#how-it-works">How it works</a>
          <a href="#farmers">For farmers</a>
          <a href="#buyers">For buyers</a>
          <Link href="/login">Log in</Link>
          <Link href="/register">Get started</Link>
        </div>
      </details>
    </header>
  );
}
