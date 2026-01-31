'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Home', href: '/', sectionId: 'home', isRoute: false },
  { label: 'Our Story', href: '/', sectionId: 'our-story', isRoute: false },
  { label: 'Events', href: '/events', sectionId: 'events', isRoute: false },
  { label: 'RSVP', href: '/rsvp', sectionId: 'rsvp', isRoute: false },
  { label: 'Gallery', href: '/gallery', sectionId: 'gallery', isRoute: false },
  { label: 'Wish List', href: '/wish-list', sectionId: null, isRoute: true },
  { label: 'Contact', href: '/contact', sectionId: 'contact', isRoute: false },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Handle hash after hydration to avoid SSR mismatch
  useEffect(() => {
    setIsMounted(true);
    setCurrentHash(window.location.hash);
    
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    if (!item.isRoute && item.sectionId) {
      e.preventDefault();
      // If we're on the home page, scroll to section
      if (pathname === '/') {
        const element = document.getElementById(item.sectionId);
        if (element) {
          // Update URL hash without reloading
          window.history.pushState(null, '', `#${item.sectionId}`);
          setCurrentHash(`#${item.sectionId}`);
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // If we're on another page, navigate to home with hash
        window.location.href = `/#${item.sectionId}`;
      }
      setIsMobileMenuOpen(false);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.isRoute) {
      return pathname === item.href;
    }
    // For sections, check if we're on home page and the section matches
    if (pathname === '/' && item.sectionId) {
      // During SSR or before mount, only mark 'home' as active if no hash
      if (!isMounted) {
        return item.sectionId === 'home';
      }
      // After hydration, check the actual hash
      return currentHash === `#${item.sectionId}` || (currentHash === '' && item.sectionId === 'home');
    }
    return false;
  };

  return (
    <nav className="bg-white border-b border-amber-900/20 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'text-amber-600 border-b-2 border-amber-600'
                      : 'text-amber-900 hover:text-amber-600'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-amber-900 hover:text-amber-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`px-3 py-2 text-base font-medium transition-colors ${
                      active
                        ? 'text-amber-600 bg-amber-50 border-l-4 border-amber-600'
                        : 'text-amber-900 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
