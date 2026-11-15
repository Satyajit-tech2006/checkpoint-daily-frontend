import React, { useEffect, useState } from 'react';
import ProfileDashboard, { type VoteHistoryRecord } from './ProfileDashboard';
import LoadingState from '../ui/LoadingState';
import {
  fetchAllTeams,
  fetchUserVoteHistory,
  getCurrentUserProfile,
  signOutOperative,
} from '../../lib/communityService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function LiveProfileBridge() {
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
    joinedAt: string;
    teamName?: string | null;
    teamSlug?: string | null;
    totalPointsContributed: number;
  } | null>(null);
  const [history, setHistory] = useState<VoteHistoryRecord[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let mounted = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const [profile, voteHistory, teams] = await Promise.all([
          getCurrentUserProfile(),
          fetchUserVoteHistory(user.id),
          fetchAllTeams(),
        ]);

        if (!mounted || !profile) return;

        const matchedTeam = teams.find((t) => t.id === profile.teamId);
        const totalPoints = voteHistory.reduce((sum, item) => sum + item.pointsEarned, 0);

        setUserData({
          username: profile.username,
          email: user.email || '',
          joinedAt: new Date(user.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          teamName: profile.teamName ?? null,
          teamSlug: matchedTeam?.slug ?? null,
          totalPointsContributed: totalPoints,
        });
        setHistory(voteHistory);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingState variant="row" count={4} label="Loading operative dossier..." />;
  }

  return (
    <ProfileDashboard
      initialUser={userData}
      initialHistory={history}
      onSignOut={async () => {
        await signOutOperative();
        window.location.href = '/';
      }}
    />
  );
}