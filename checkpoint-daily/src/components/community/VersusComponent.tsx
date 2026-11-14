import React, { useState } from 'react';
import { Share2, Clock, Swords } from 'lucide-react';
import type { WeeklyPoll } from '../../types';
import VotingCard from './VotingCard';
import Button from '../ui/Button';
import { showToast } from '../ui/Toast';

export interface VersusComponentProps {
  poll: WeeklyPoll;
  initialUserVoteOptionId?: string | null;
  isAuthenticated: boolean;
  onSubmitVote?: (pollId: string, optionId: string) => Promise<void>;
}

export default function VersusComponent({
  poll,
  initialUserVoteOptionId = null,
  isAuthenticated,
  onSubmitVote,
}: VersusComponentProps) {
  const [options, setOptions] = useState(poll.options);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(initialUserVoteOptionId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalVotes = options[0].voteCount + options[1].voteCount;
  const hasVoted = Boolean(selectedOptionId);
  const isClosed = poll.status === 'closed';

  const handleVote = async (optionId: string) => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/vote`;
      return;
    }
    if (hasVoted || isClosed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onSubmitVote) {
        await onSubmitVote(poll.id, optionId);
      } else {
        await new Promise((r) => setTimeout(r, 450));
      }

      // Optimistically increment local count
      setOptions((prev) => [
        prev[0].id === optionId ? { ...prev[0], voteCount: prev[0].voteCount + 1 } : prev[0],
        prev[1].id === optionId ? { ...prev[1], voteCount: prev[1].voteCount + 1 } : prev[1],
      ]);
      setSelectedOptionId(optionId);

      const chosen = options.find((o) => o.id === optionId);
      showToast({
        type: 'success',
        title: `Vote Cast for ${chosen?.characterName}`,
        description: 'Your ballot is locked and faction points have been credited.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Vote Failed',
        description: err instanceof Error ? err.message : 'Unable to record your ballot.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareResults = async () => {
    const chosen = options.find((o) => o.id === selectedOptionId);
    const shareText = chosen
      ? `I backed ${chosen.characterName} in Week ${poll.weekNumber} of the Checkpoint Daily Arena! Cast your vote:`
      : `Week ${poll.weekNumber} Character Clash is live on Checkpoint Daily:`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://checkpointdaily.com/vote';

    if (navigator.share) {
      try {
        await navigator.share({ title: poll.title, text: shareText, url: shareUrl });
        return;
      } catch {
        // User cancelled native share; fall back to clipboard
      }
    }

    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    showToast({
      type: 'info',
      title: 'Battle Link Copied',
      description: 'Shareable matchup link copied to your clipboard.',
    });
  };

  return (
    <section aria-label={poll.title} className="space-y-6">
      {/* Matchup Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-[#121216] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
            <Swords className="h-4 w-4" />
            <span>Week {poll.weekNumber} Arena Clash</span>
          </div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            {poll.question}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>{isClosed ? 'Voting Ended' : `Closes ${poll.closesAt}`}</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleShareResults}
            leftIcon={<Share2 className="h-3.5 w-3.5" />}
          >
            Share Matchup
          </Button>
        </div>
      </div>

      {/* Head-to-Head Grid */}
      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <VotingCard
          option={options[0]}
          totalVotes={totalVotes}
          isSelected={selectedOptionId === options[0].id}
          hasVoted={hasVoted}
          isClosed={isClosed}
          isSubmitting={isSubmitting}
          onVote={handleVote}
        />

        {/* Center VS Emblem */}
        <div
          aria-hidden="true"
          className="pointer-events-none flex items-center justify-center md:absolute md:left-1/2 md:top-1/2 md:z-20 md:-translate-x-1/2 md:-translate-y-1/2"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-500 bg-zinc-950 font-display text-sm font-black tracking-widest text-amber-400 shadow-2xl">
            VS
          </div>
        </div>

        <VotingCard
          option={options[1]}
          totalVotes={totalVotes}
          isSelected={selectedOptionId === options[1].id}
          hasVoted={hasVoted}
          isClosed={isClosed}
          isSubmitting={isSubmitting}
          onVote={handleVote}
        />
      </div>

      {/* Footer Telemetry */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>Total Verified Ballots: {totalVotes.toLocaleString()}</span>
        <span>1 Ballot per Verified Account</span>
      </div>
    </section>
  );
}