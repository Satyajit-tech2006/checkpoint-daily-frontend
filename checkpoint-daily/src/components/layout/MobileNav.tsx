import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, ShieldAlert } from 'lucide-react';
import type { NavItem } from '../../types';
import { cn } from '../../lib/utils';

interface MobileNavProps {
  items: NavItem[];
  currentPath: string;
}

export default function MobileNav({ items, currentPath }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll and listen for Escape key when drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        aria-label="Open navigation menu"
        className="inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop & Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="relative z-10 flex w-full max-w-xs flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <span className="text-sm font-black uppercase tracking-widest text-white">
                Checkpoint <span className="text-amber-500">Daily</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links List */}
            <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3.5 py-3 text-sm font-semibold transition-colors',
                      active
                        ? 'bg-zinc-900 text-white border border-zinc-800'
                        : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                            item.isCommunity
                              ? 'bg-cyan-500/15 text-cyan-400'
                              : 'bg-amber-500/15 text-amber-400'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </a>
                );
              })}
            </nav>

            {/* Drawer Footer / Account CTA */}
            <div className="border-t border-zinc-800 p-4 space-y-3 bg-zinc-900/40">
              <a
                href="/login"
                className="flex w-full items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-400"
              >
                Sign In / Join Faction
              </a>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
                <ShieldAlert className="h-3.5 w-3.5" />
                Independent Gaming Publication
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}