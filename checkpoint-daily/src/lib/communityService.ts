import { supabase, isSupabaseConfigured } from './supabase';
import type {
  CharacterTeam,
  LeaderboardEntry,
  UserSessionProfile,
  WeeklyPoll,
} from '../types';
import type { VoteHistoryRecord } from '../components/community/ProfileDashboard';

// ----------------------------------------------------------------------------
// 1. AUTHENTICATION & SESSION HELPERS
// ----------------------------------------------------------------------------

export async function signUpOperative(email: string, password: string, username: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured in .env');

  const cleanUsername = username.trim();

  // 1. Pre-check handle availability so trigger never fails with a cryptic 500 error
  const { data: existingHandle } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', cleanUsername)
    .maybeSingle();

  if (existingHandle) {
    throw new Error(`Operative handle "${cleanUsername}" is already taken. Choose another.`);
  }

  // 2. Register user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { username: cleanUsername },
    },
  });

  if (error) throw new Error(error.message);

  // 3. Warn clearly if Supabase still has "Confirm email" enabled
  if (data.user && !data.session) {
    throw new Error(
      'Account created! Please check your email inbox to confirm your address before signing in (or disable "Confirm email" in Supabase Auth settings).'
    );
  }

  return data;
}

export async function signInOperative(email: string, password: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured in .env');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function signOutOperative() {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getCurrentUserProfile(): Promise<UserSessionProfile | null> {
  if (!isSupabaseConfigured) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: membership }, { count: votesCast }] = await Promise.all([
    supabase.from('profiles').select('id, username, avatar_url').eq('id', user.id).single(),
    supabase
      .from('team_memberships')
      .select('team_id, teams(name)')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase.from('votes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  if (!profile) return null;

  const teamRelation = membership?.teams as unknown as { name: string } | null;

  return {
    id: profile.id,
    username: profile.username,
    avatarUrl: profile.avatar_url || undefined,
    teamId: membership?.team_id || undefined,
    teamName: teamRelation?.name || undefined,
    votesCast: votesCast ?? 0,
  };
}

// ----------------------------------------------------------------------------
// 2. FACTION TEAMS & PERMANENT ALLEGIANCE
// ----------------------------------------------------------------------------

export async function fetchAllTeams(): Promise<CharacterTeam[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('teams')
    .select(
      `
      id,
      slug,
      name,
      motto,
      description,
      accent_color,
      member_count,
      total_points,
      weekly_wins,
      characters ( name, portrait_url )
    `
    )
    .order('total_points', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const char = row.characters as unknown as { name: string; portrait_url: string };
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      motto: row.motto,
      description: row.description,
      characterName: char?.name ?? 'Unknown',
      characterImage: char?.portrait_url ?? '',
      accentColor: row.accent_color,
      memberCount: row.member_count,
      totalPoints: row.total_points,
      weeklyWins: row.weekly_wins,
    };
  });
}

export async function joinFactionTeam(teamId: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured in .env');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to pledge allegiance.');

  const { error } = await supabase.from('team_memberships').insert({
    user_id: user.id,
    team_id: teamId,
  });

  if (error) {
    // PostgreSQL unique violation code 23505 = user already pledged allegiance
    if (error.code === '23505') {
      throw new Error('Your allegiance is already permanently locked to a faction.');
    }
    throw new Error(error.message);
  }
}

// ----------------------------------------------------------------------------
// 3. WEEKLY ARENA POLLS & SECURE VOTING
// ----------------------------------------------------------------------------

export async function fetchActivePollWithUserVote(): Promise<{
  poll: WeeklyPoll | null;
  userVoteOptionId: string | null;
}> {
  if (!isSupabaseConfigured) return { poll: null, userVoteOptionId: null };

  const { data: pollRow, error } = await supabase
    .from('polls')
    .select(
      `
      id,
      week_number,
      title,
      question,
      closes_at,
      status,
      poll_options (
        id,
        vote_count,
        characters ( id, name, alias, faction, portrait_url, accent_color )
      )
    `
    )
    .eq('status', 'active')
    .order('week_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !pollRow) return { poll: null, userVoteOptionId: null };

  const rawOptions = (pollRow.poll_options as unknown as Array<{
    id: string;
    vote_count: number;
    characters: {
      id: string;
      name: string;
      alias?: string;
      faction: string;
      portrait_url: string;
      accent_color: string;
    };
  }>) || [];

  if (rawOptions.length < 2) return { poll: null, userVoteOptionId: null };

  const mappedOptions = rawOptions.slice(0, 2).map((opt) => ({
    id: opt.id,
    characterId: opt.characters.id,
    characterName: opt.characters.name,
    characterAlias: opt.characters.alias,
    faction: opt.characters.faction,
    portraitImage: opt.characters.portrait_url,
    accentColor: opt.characters.accent_color,
    voteCount: opt.vote_count,
  }));

  let userVoteOptionId: string | null = null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: existingVote } = await supabase
      .from('votes')
      .select('option_id')
      .eq('poll_id', pollRow.id)
      .eq('user_id', user.id)
      .maybeSingle();

    userVoteOptionId = existingVote?.option_id ?? null;
  }

  return {
    poll: {
      id: pollRow.id,
      weekNumber: pollRow.week_number,
      title: pollRow.title,
      question: pollRow.question,
      closesAt: new Date(pollRow.closes_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
      status: pollRow.status as 'active' | 'closed',
      options: [mappedOptions[0], mappedOptions[1]],
    },
    userVoteOptionId,
  };
}

export async function castArenaVote(pollId: string, optionId: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured in .env');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in with your Checkpoint ID before voting.');

  const { error } = await supabase.from('votes').insert({
    poll_id: pollId,
    option_id: optionId,
    user_id: user.id,
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('Duplicate ballot blocked: you have already voted in this matchup.');
    }
    throw new Error(error.message);
  }
}

// ----------------------------------------------------------------------------
// 4. LEADERBOARD & USER VOTING HISTORY
// ----------------------------------------------------------------------------

export async function fetchLeaderboardStandings(): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('teams')
    .select(
      `
      id,
      slug,
      name,
      accent_color,
      member_count,
      weekly_points,
      total_points,
      weekly_wins,
      characters ( name, portrait_url )
    `
    )
    .order('total_points', { ascending: false });

  if (error || !data) return [];

  return data.map((row, idx) => {
    const char = row.characters as unknown as { name: string; portrait_url: string };
    return {
      rank: idx + 1,
      teamId: row.id,
      teamSlug: row.slug,
      teamName: row.name,
      characterName: char?.name ?? 'Unknown',
      characterImage: char?.portrait_url ?? '',
      accentColor: row.accent_color,
      memberCount: row.member_count,
      weeklyPoints: row.weekly_points,
      totalPoints: row.total_points,
      weeklyWins: row.weekly_wins,
      trend: idx === 0 ? 'same' : 'up',
    };
  });
}

export async function fetchUserVoteHistory(userId: string): Promise<VoteHistoryRecord[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('votes')
    .select(
      `
      id,
      points_awarded,
      created_at,
      polls ( week_number, title ),
      poll_options ( characters ( name ) )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const poll = row.polls as unknown as { week_number: number; title: string };
    const opt = row.poll_options as unknown as { characters: { name: string } };
    return {
      id: row.id,
      weekNumber: poll?.week_number ?? 0,
      pollTitle: poll?.title ?? 'Weekly Arena Clash',
      chosenCharacter: opt?.characters?.name ?? 'Contender',
      votedAt: new Date(row.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      pointsEarned: row.points_awarded,
    };
  });
}