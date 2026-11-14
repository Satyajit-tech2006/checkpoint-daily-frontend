import React, { useState, useRef, useEffect } from 'react';
import { User, Vote, LogOut, ChevronDown, Shield } from 'lucide-react';
import type { UserSessionProfile } from '../../types';

export interface UserAvatarMenuProps {
  user?: UserSessionProfile | null;
  onSignOut?: () => Promise<void>;
}

export default function UserAvatarMenu({ user = null, onSignOut }: UserAvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!user) {
    return (
      <a
        href="/login"
        className="hidden sm:inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-100 transition-colors hover:border-amber-500/60 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        Sign In
      </a>
    );
  }

  const initials = user.username.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    setIsOpen(false);
    if (onSignOut) {
      await onSignOut();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 py-1 pl-1.5 pr-2.5 text-left transition-colors hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="h-7 w-7 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/20 font-display text-xs font-black text-cyan-400">
            {initials}
          </div>
        )}

        <div className="hidden md:block leading-tight">
          <span className="block text-xs font-bold text-zinc-100">{user.username}</span>
          {user.teamName && (
            <span className="block text-[10px] font-semibold text-cyan-400">{user.teamName}</span>
          )}
        </div>

        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl"
        >
          <div className="border-b border-zinc-800/80 px-3 py-2">
            <p className="text-xs font-bold text-white truncate">{user.username}</p>
            <p className="text-[11px] text-zinc-400">
              {user.teamName ? `Faction: ${user.teamName}` : 'No Faction Selected'}
            </p>
          </div>

          <div className="py-1 space-y-0.5">
            <a
              href="/profile"
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              <User className="h-4 w-4 text-zinc-400" />
              <span>Operative Profile</span>
            </a>
            <a
              href="/vote"
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              <Vote className="h-4 w-4 text-cyan-400" />
              <span>Weekly Arena ({user.votesCast} votes)</span>
            </a>
            <a
              href="/teams"
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              <Shield className="h-4 w-4 text-amber-400" />
              <span>Faction Hub</span>
            </a>
          </div>

          <div className="border-t border-zinc-800/80 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}