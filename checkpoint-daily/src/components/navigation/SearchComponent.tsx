import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, FileText, Users, Radio, BookOpen, ArrowUpRight } from 'lucide-react';
import type { SearchableItem } from '../../types';
import { cn } from '../../lib/utils';

interface SearchComponentProps {
  items: SearchableItem[];
}

export default function SearchComponent({ items = [] }: SearchComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Cmd+K / Ctrl+K shortcut & Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus input and lock scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 6);
    return items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.excerpt.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, items]);

  const getCategoryIcon = (category: SearchableItem['category']) => {
    switch (category) {
      case 'Character':
        return <Users className="h-4 w-4 text-cyan-400" />;
      case 'Rumour Radar':
        return <Radio className="h-4 w-4 text-amber-400" />;
      case 'Explainer':
        return <BookOpen className="h-4 w-4 text-emerald-400" />;
      default:
        return <FileText className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <>
      {/* Trigger Button for Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search articles and characters"
        className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <Search className="h-4 w-4 text-zinc-400" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden lg:inline-flex items-center rounded border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
          ⌘K
        </kbd>
      </button>

      {/* Search Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site Search"
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            {/* Input Bar */}
            <div className="flex items-center border-b border-zinc-800 px-4">
              <Search className="h-4 w-4 shrink-0 text-amber-500" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Leonida news, rumours, characters..."
                className="w-full bg-transparent px-3 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close search"
                className="rounded p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[65vh] overflow-y-auto p-2">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {query.trim() ? `Matches (${results.length})` : 'Recent & Featured Dispatches'}
              </div>

              {results.length === 0 ? (
                <div className="py-10 text-center text-sm text-zinc-500">
                  No dispatches found matching &ldquo;<span className="text-zinc-300">{query}</span>&rdquo;.
                </div>
              ) : (
                <ul className="space-y-1">
                  {results.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'group flex items-start justify-between gap-3 rounded-lg p-2.5 transition-colors',
                          'hover:bg-zinc-900 focus-visible:bg-zinc-900 focus-visible:outline-none'
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="mt-0.5 rounded-md border border-zinc-800 bg-zinc-900 p-1.5">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                {item.category}
                              </span>
                              {item.date && (
                                <span className="text-[11px] text-zinc-500">&bull; {item.date}</span>
                              )}
                            </div>
                            <p className="truncate text-sm font-semibold text-zinc-100 group-hover:text-amber-400">
                              {item.title}
                            </p>
                            <p className="truncate text-xs text-zinc-400">{item.excerpt}</p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber-400" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer Hints */}
            <div className="flex items-center justify-between border-t border-zinc-900 bg-zinc-900/40 px-4 py-2 text-[11px] text-zinc-500">
              <span>Checkpoint Daily Archive</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}