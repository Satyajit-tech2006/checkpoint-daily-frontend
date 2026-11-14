import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { showToast } from '../ui/Toast';

export interface TeamMembershipButtonProps {
  teamId: string;
  teamName: string;
  userCurrentTeamId?: string | null;
  isAuthenticated: boolean;
  onJoinTeam?: (teamId: string) => Promise<void>;
  className?: string;
}

export default function TeamMembershipButton({
  teamId,
  teamName,
  userCurrentTeamId,
  isAuthenticated,
  onJoinTeam,
  className,
}: TeamMembershipButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinedTeamId, setJoinedTeamId] = useState<string | null | undefined>(userCurrentTeamId);

  const isMemberOfThisTeam = joinedTeamId === teamId;
  const isLockedToAnotherTeam = Boolean(joinedTeamId && joinedTeamId !== teamId);

  const handleConfirmJoin = async () => {
    setIsSubmitting(true);
    try {
      if (onJoinTeam) {
        await onJoinTeam(teamId);
      } else {
        // Fallback simulation until Phase 3 Supabase wiring
        await new Promise((r) => setTimeout(r, 500));
      }
      setJoinedTeamId(teamId);
      setIsModalOpen(false);
      showToast({
        type: 'success',
        title: `Allegiance Pledged: ${teamName}`,
        description: 'Your votes now earn bonus faction points on the global leaderboard.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Allegiance Failed',
        description: err instanceof Error ? err.message : 'Could not register team membership.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <a
        href={`/login?redirect=/teams`}
        className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 text-xs font-bold uppercase tracking-wider text-cyan-300 transition-colors hover:bg-cyan-500/20"
      >
        Sign In to Pledge Allegiance
      </a>
    );
  }

  if (isMemberOfThisTeam) {
    return (
      <div className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-4 text-xs font-bold uppercase tracking-wider text-emerald-300">
        <ShieldCheck className="h-4 w-4" />
        <span>Your Active Faction</span>
      </div>
    );
  }

  if (isLockedToAnotherTeam) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-500"
      >
        <Lock className="h-3.5 w-3.5" />
        <span>Allegiance Locked</span>
      </button>
    );
  }

  return (
    <>
      <Button
        variant="community"
        size="md"
        onClick={() => setIsModalOpen(true)}
        className={className ?? 'w-full uppercase tracking-wider text-xs'}
      >
        Join {teamName}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={`Pledge Permanent Allegiance to ${teamName}?`}
        description="Read carefully before locking in your faction."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p>
              <strong>Permanent Choice:</strong> Faction allegiance on Checkpoint Daily is permanent for the season. Every weekly battle vote you cast will contribute directly to <strong>{teamName}</strong>&apos;s leaderboard score.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="community"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleConfirmJoin}
            >
              Lock In Allegiance
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}