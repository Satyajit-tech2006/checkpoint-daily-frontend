import React, { useEffect, useState } from 'react';
import TeamMembershipButton from './TeamMembershipButton';
import {
  fetchAllTeams,
  getCurrentUserProfile,
  joinFactionTeam,
} from '../../lib/communityService';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { CharacterTeam } from '../../types';

interface LiveTeamsSectionProps {
  fallbackTeams: CharacterTeam[];
}

export default function LiveTeamsSection({ fallbackTeams }: LiveTeamsSectionProps) {
  const [teams, setTeams] = useState<CharacterTeam[]>(fallbackTeams);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadData = async () => {
    if (!isSupabaseConfigured) return;
    const [profile, liveTeams] = await Promise.all([
      getCurrentUserProfile(),
      fetchAllTeams(),
    ]);
    setIsAuthenticated(Boolean(profile));
    setUserTeamId(profile?.teamId ?? null);
    if (liveTeams.length > 0) {
      setTeams(liveTeams);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <article
          key={team.id}
          className="flex flex-col overflow-hidden rounded-xl border border-zinc-800/90 bg-[#121216] transition-colors hover:border-zinc-700"
        >
          <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
            <img
              src={team.characterImage}
              alt={team.characterName}
              loading="lazy"
              className="h-full w-full object-cover object-top"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/50 to-transparent"
            />
            <div className="absolute bottom-3 left-5 right-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                Representing {team.characterName}
              </span>
              <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                <a href={`/teams/${team.slug}`} className="hover:text-cyan-300 transition-colors">
                  {team.name}
                </a>
              </h3>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-5 pt-3 space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-bold italic text-amber-400">&ldquo;{team.motto}&rdquo;</p>
              <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">{team.description}</p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-zinc-800 rounded-lg border border-zinc-800/80 bg-zinc-950/60 py-2.5 text-center">
              <div>
                <p className="font-display text-base font-black text-white">
                  {team.memberCount.toLocaleString()}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Members</p>
              </div>
              <div>
                <p className="font-display text-base font-black text-cyan-400">
                  {team.totalPoints.toLocaleString()}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Points</p>
              </div>
              <div>
                <p className="font-display text-base font-black text-amber-400">
                  {team.weeklyWins}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Wins</p>
              </div>
            </div>

            <div className="space-y-2">
              <TeamMembershipButton
                teamId={team.id}
                teamName={team.name}
                userCurrentTeamId={userTeamId}
                isAuthenticated={isAuthenticated}
                onJoinTeam={async (id) => {
                  await joinFactionTeam(id);
                  await loadData();
                }}
              />
              <a
                href={`/teams/${team.slug}`}
                className="block text-center text-xs font-semibold text-zinc-400 transition-colors hover:text-white py-1"
              >
                Inspect Faction Roster &rarr;
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}