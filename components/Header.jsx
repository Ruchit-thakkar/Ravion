"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Brand({ light = false, isFooter = false }) {
  return (
    <Link
      href="/"
      className="block w-28 sm:w-32 transition-transform duration-300 hover:opacity-90"
      aria-label="Ravion Homepage"
    >
      <img
        className={isFooter || light ? "brightness-0 invert" : "logo-img"}
        src={isFooter ? "/assets/ravion-logo.png" : "/assets/ravion_logo_svg-01.svg"}
        alt={siteConfig.name}
      />
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Navigation items required: Home, About, Services, Work, Contact
  const navItems = [
    { name: "Home", id: "home", href: "/" },
    { name: "About", id: "about", href: "/#about" },
    { name: "Services", id: "services", href: "/#services" },
    { name: "Work", id: "work", href: "/#work" },
    { name: "Contact", id: "contact", href: "/#contact" },
  ];

  // Active section tracking via scroll on homepage
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      if (scrollY < 200) {
        setActiveSection("home");
        return;
      }

      // Check sections from bottom to top
      const sections = ["contact", "work", "services", "about"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 240) {
            setActiveSection(id);
            return;
          }
        }
      }
      setActiveSection("home");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Handle Home link click with smooth-scroll if already on homepage
  const handleHomeClick = (e) => {
    setOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("home");
    }
  };

  // Handle in-page section anchors
  const handleSectionClick = (e, id) => {
    setOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        setActiveSection(id);
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#f5f0e8]/95 shadow-[0_4px_20px_-8px_rgba(8,45,42,0.08)] backdrop-blur-md border-b border-[#082d2a]/12"
          : "bg-[#f5f0e8]/85 backdrop-blur-sm border-b border-[#082d2a]/10"
      }`}
    >
      <nav
        className="mx-auto flex h-20 w-[min(1180px,calc(100%-32px))] items-center justify-between"
        aria-label="Main Navigation"
      >
        <Brand />

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => {
            const isHome = item.id === "home";
            const isActive = pathname === "/" && activeSection === item.id;

            return isHome ? (
              <Link
                key={item.id}
                href="/"
                onClick={handleHomeClick}
                className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-[#082d2a] font-semibold"
                    : "text-[#082d2a]/70 hover:text-[#c99a55]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[#c99a55]" />
                )}
              </Link>
            ) : (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleSectionClick(e, item.id)}
                className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-[#082d2a] font-semibold"
                    : "text-[#082d2a]/70 hover:text-[#c99a55]"
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[#c99a55]" />
                )}
              </a>
            );
          })}

          <Link
            href="/samples"
            className="group inline-flex items-center gap-2 rounded-full bg-[#082d2a] px-4.5 py-2.5 text-xs font-medium text-[#f5f0e8] shadow-sm transition-all duration-300 hover:bg-[#c99a55] hover:text-[#031513] hover:-translate-y-0.5 active:scale-95"
          >
            <span>Explore work</span>
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#082d2a]/15 bg-white/50 text-[#082d2a] transition-all hover:bg-white active:scale-95 md:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Navigation Dropdown Drawer */}
        {open && (
          <div className="absolute left-0 right-0 top-full border-b border-[#082d2a]/15 bg-[#f5f0e8] p-6 shadow-2xl backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => {
                const isHome = item.id === "home";
                const isActive = pathname === "/" && activeSection === item.id;

                return isHome ? (
                  <Link
                    key={item.id}
                    href="/"
                    onClick={handleHomeClick}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-[#082d2a]/5 text-[#c99a55] font-semibold"
                        : "text-[#082d2a]/80 hover:bg-[#082d2a]/5 hover:text-[#082d2a]"
                    }`}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c99a55]" />
                    )}
                  </Link>
                ) : (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleSectionClick(e, item.id)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-[#082d2a]/5 text-[#c99a55] font-semibold"
                        : "text-[#082d2a]/80 hover:bg-[#082d2a]/5 hover:text-[#082d2a]"
                    }`}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c99a55]" />
                    )}
                  </a>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/samples"
                  onClick={() => setOpen(false)}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#082d2a] px-4 py-3.5 text-sm font-medium text-[#f5f0e8] shadow-md transition-all hover:bg-[#c99a55] hover:text-[#031513] active:scale-95"
                >
                  <span>Explore Our Work</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
