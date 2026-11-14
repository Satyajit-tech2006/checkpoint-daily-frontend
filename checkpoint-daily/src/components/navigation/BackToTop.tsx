import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BackToTopProps {
  threshold?: number;
}

export default function BackToTop({ threshold = 500 }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className={cn(
        'fixed bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/90 text-zinc-200 shadow-lg backdrop-blur transition-all duration-200 hover:border-amber-500 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        visible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-4 opacity-0 pointer-events-none'
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}