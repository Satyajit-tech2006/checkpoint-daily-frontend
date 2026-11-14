import React from 'react';
import { CheckCircle2, Flame } from 'lucide-react';
import type { PollOption } from '../../types';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

export interface VotingCardProps {
  option: PollOption;
  totalVotes: number;
  isSelected: boolean;
  hasVoted: boolean;
  isClosed: boolean;
  isSubmitting: boolean;
  onVote: (optionId: string) => void;
}

export default function VotingCard({
  option,
  totalVotes,
  isSelected,
  hasVoted,
  isClosed,
  isSubmitting,
  onVote,
}: VotingCardProps) {
  const showResults = hasVoted || isClosed;
  const percentage = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border bg-[#121216] transition-all',
        isSelected
          ? 'border-cyan-400 ring-1 ring-cyan-400/50'
          : 'border-zinc-800 hover:border-zinc-700'
      )}
    >
      {/* Contender Image */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-zinc-900">
        <img
          src={option.portraitImage}
          alt={option.characterName}
          className="h-full w-full object-cover object-top"
        />
        <div
          aria-hidden="true"
          class="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/30 to-transparent"
        />

        {isSelected && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-cyan-500 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-zinc-950 shadow-lg">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Your Vote</span>
          </div>
        )}

        <div className="absolute bottom-3 left-5 right-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            {option.faction}
          </p>
          <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            {option.characterName}
          </h3>
        </div>
      </div>

      {/* Telemetry & Vote Action */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        {showResults ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl font-black text-white">{percentage}%</span>
              <span className="text-xs font-medium text-zinc-400">
                {option.voteCount.toLocaleString()} votes
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${option.characterName} vote share`}
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800"
            >
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700 ease-out',
                  isSelected ? 'bg-cyan-400' : 'bg-zinc-500'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-400">
            Cast your ballot to reveal live community standings and earn +10 points for your faction.
          </p>
        )}

        <div>
          {hasVoted ? (
            <div
              className={cn(
                'flex h-10 items-center justify-center rounded-lg border text-xs font-bold uppercase tracking-wider',
                isSelected
                  ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-500'
              )}
            >
              {isSelected ? 'Ballot Recorded' : 'Locked'}
            </div>
          ) : isClosed ? (
            <div className="flex h-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Poll Closed
            </div>
          ) : (
            <Button
              variant="community"
              size="md"
              isLoading={isSubmitting}
              onClick={() => onVote(option.id)}
              leftIcon={<Flame className="h-4 w-4" />}
              className="w-full uppercase tracking-wider text-xs"
            >
              Vote {option.characterName}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}