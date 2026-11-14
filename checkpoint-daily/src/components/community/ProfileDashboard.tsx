import React, { useState } from 'react';
import { Shield, Vote, Award, LogOut, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

export interface VoteHistoryRecord {
  id: string;
  weekNumber: number;
  pollTitle: string;
  chosenCharacter: string;
  votedAt: string;
  pointsEarned: number;
}

export interface ProfileDashboardProps {
  initialUser?: {
    username: string;
    email: string;
    joinedAt: string;
    teamName?: string | null;
    teamSlug?: string | null;
    totalPointsContributed: number;
  } | null;
  initialHistory?: VoteHistoryRecord[];
  onSignOut?: () => Promise<void>;
}

export default function ProfileDashboard({
  initialUser = null,
  initialHistory = [],
  onSignOut,
}: ProfileDashboardProps) {
  const [user] = useState(initialUser);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-[#121216] p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-amber-400">
          <Shield className="h-6 w-6" />
        </div>
        <h2 className="font-display text-2xl font-black uppercase text-white">
          Sign In Required
        </h2>
        <p className="text-sm text-zinc-400">
          Log in with your Checkpoint ID to view your faction allegiance, earned telemetry, and ballot history.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <a
            href="/login?redirect=/profile"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-500 px-5 text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-amber-400"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-5 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-zinc-800"
          >
            Create ID
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Operative Identity Banner */}
      <div className="flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-[#121216] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-500/15 font-display text-2xl font-black text-cyan-400">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                {user.username}
              </h1>
              {user.teamName && (
                <span className="rounded border border-cyan-500/30 bg-cyan-500/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                  {user.teamName}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {user.email} &bull; Enlisted {user.joinedAt}
            </p>
          </div>
        </div>

        <Button
          variant="danger"
          size="sm"
          leftIcon={<LogOut className="h-3.5 w-3.5" />}
          onClick={async () => {
            if (onSignOut) await onSignOut();
            else window.location.href = '/login';
          }}
        >
          Sign Out
        </Button>
      </div>

      {/* Telemetry Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>Sworn Faction</span>
          </div>
          <p className="mt-2 font-display text-xl font-black text-white">
            {user.teamName || 'Unassigned'}
          </p>
          {user.teamSlug ? (
            <a href={`/teams/${user.teamSlug}`} className="mt-1 inline-block text-xs text-cyan-400 hover:underline">
              Inspect Faction HQ &rarr;
            </a>
          ) : (
            <a href="/teams" className="mt-1 inline-block text-xs text-amber-400 hover:underline">
              Choose Faction Now &rarr;
            </a>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Vote className="h-4 w-4 text-amber-400" />
            <span>Ballots Cast</span>
          </div>
          <p className="mt-2 font-display text-xl font-black text-white">
            {initialHistory.length}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Verified weekly arena votes</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Award className="h-4 w-4 text-emerald-400" />
            <span>Faction Points Earned</span>
          </div>
          <p className="mt-2 font-display text-xl font-black text-emerald-400">
            +{user.totalPointsContributed.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Contributed to leaderboard</p>
        </div>
      </div>

      {/* Voting History Log */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">
          Verified Ballot History
        </h2>

        {initialHistory.length === 0 ? (
          <EmptyState
            title="No Ballots Recorded Yet"
            description="Enter the Weekly Character Arena to cast your first vote and earn faction points."
            actionLabel="Enter Weekly Arena"
            actionHref="/vote"
          />
        ) : (
          <div className="divide-y divide-zinc-800/80 overflow-hidden rounded-xl border border-zinc-800 bg-[#121216]">
            {initialHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    Week {item.weekNumber} &bull; {item.pollTitle}
                  </span>
                  <p className="mt-0.5 text-sm font-bold text-white">
                    Backed: <span className="text-amber-400">{item.chosenCharacter}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {item.votedAt}
                  </span>
                  <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono font-bold text-emerald-400">
                    +{item.pointsEarned} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}