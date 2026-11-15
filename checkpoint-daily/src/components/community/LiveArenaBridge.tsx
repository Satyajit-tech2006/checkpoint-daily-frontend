import React, { useEffect, useState } from 'react';
import VersusComponent from './VersusComponent';
import LoadingState from '../ui/LoadingState';
import {
  castArenaVote,
  fetchActivePollWithUserVote,
  getCurrentUserProfile,
} from '../../lib/communityService';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { WeeklyPoll } from '../../types';

interface LiveArenaBridgeProps {
  fallbackPoll: WeeklyPoll;
}

export default function LiveArenaBridge({ fallbackPoll }: LiveArenaBridgeProps) {
  const [poll, setPoll] = useState<WeeklyPoll>(fallbackPoll);
  const [userVoteOptionId, setUserVoteOptionId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let mounted = true;
    Promise.all([getCurrentUserProfile(), fetchActivePollWithUserVote()])
      .then(([profile, arenaData]) => {
        if (!mounted) return;
        setIsAuthenticated(Boolean(profile));
        if (arenaData.poll) {
          setPoll(arenaData.poll);
          setUserVoteOptionId(arenaData.userVoteOptionId);
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingState variant="card" count={2} label="Loading live arena telemetry..." />;
  }

  return (
    <VersusComponent
      poll={poll}
      initialUserVoteOptionId={userVoteOptionId}
      isAuthenticated={isAuthenticated}
      onSubmitVote={async (pollId, optionId) => {
        await castArenaVote(pollId, optionId);
      }}
    />
  );
}