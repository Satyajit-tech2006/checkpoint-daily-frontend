import { getCollection } from 'astro:content';
import type {
  ArticleSummary,
  CharacterProfile,
  CharacterTeam,
  LeaderboardEntry,
  SearchableItem,
  WeeklyPoll,
} from '../types';

export async function getAllArticles(): Promise<ArticleSummary[]> {
  const entries = await getCollection('articles');
  return entries
    .map((entry) => ({
      slug: entry.slug,
      ...entry.data,
    }))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getAllCharacters(): Promise<CharacterProfile[]> {
  const entries = await getCollection('characters');
  return entries.map((entry) => ({
    id: entry.slug,
    slug: entry.slug,
    ...entry.data,
  }));
}

export async function getGlobalSearchIndex(): Promise<SearchableItem[]> {
  const [articles, characters] = await Promise.all([getAllArticles(), getAllCharacters()]);

  const articleItems: SearchableItem[] = articles.map((a) => ({
    id: `article-${a.slug}`,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    href: `/articles/${a.slug}`,
    date: a.publishedAt,
  }));

  const characterItems: SearchableItem[] = characters.map((c) => ({
    id: `char-${c.slug}`,
    title: c.name,
    excerpt: `${c.faction} • ${c.location}`,
    category: 'Character',
    href: `/characters/${c.slug}`,
  }));

  return [...articleItems, ...characterItems];
}

// Structured Arena & Faction data (Replaced by live Supabase queries in Phase 3)
export const ACTIVE_WEEKLY_POLL: WeeklyPoll = {
  id: 'poll-week-14',
  weekNumber: 14,
  title: 'Week 14 Arena Clash: Lucia vs. Jason',
  question: 'Who calls the shots when a Vice City heist goes sideways?',
  closesAt: 'Sunday, 23:59 UTC',
  status: 'active',
  options: [
    {
      id: 'opt-lucia',
      characterId: 'lucia-caminos',
      characterName: 'Lucia Caminos',
      faction: 'Vice-Dale Syndicate',
      portraitImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      accentColor: '#f59e0b',
      voteCount: 4820,
    },
    {
      id: 'opt-jason',
      characterId: 'jason-duval',
      characterName: 'Jason Duval',
      faction: 'Port Gellhorn Crew',
      portraitImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
      accentColor: '#06b6d4',
      voteCount: 4590,
    },
  ],
};

export const FACTION_TEAMS: CharacterTeam[] = [
  {
    id: 'team-lucia',
    slug: 'team-lucia',
    name: 'Team Lucia',
    motto: 'Precision over noise. Every exit mapped.',
    description: 'Tactical planners backing Lucia Caminos across Vice-Dale and the eastern seaboard.',
    characterName: 'Lucia Caminos',
    characterImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    accentColor: '#f59e0b',
    memberCount: 6420,
    totalPoints: 148900,
    weeklyWins: 6,
  },
  {
    id: 'team-jason',
    slug: 'team-jason',
    name: 'Team Jason',
    motto: 'Fast wheels, clean getaway, zero hesitation.',
    description: 'Street-level operators and wheelmen loyal to Jason Duval from Port Gellhorn to the Keys.',
    characterName: 'Jason Duval',
    characterImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    accentColor: '#06b6d4',
    memberCount: 6185,
    totalPoints: 143250,
    weeklyWins: 5,
  },
  {
    id: 'team-keys',
    slug: 'team-keys',
    name: 'Keys Smugglers',
    motto: 'Own the tide, control the contraband.',
    description: 'Maritime runners operating out of the Southern Keys and Grassrivers backwaters.',
    characterName: 'Dre Quan',
    characterImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    accentColor: '#10b981',
    memberCount: 3890,
    totalPoints: 96400,
    weeklyWins: 2,
  },
];

export const LEADERBOARD_STANDINGS: LeaderboardEntry[] = FACTION_TEAMS.map((team, index) => ({
  rank: index + 1,
  teamId: team.id,
  teamSlug: team.slug,
  teamName: team.name,
  characterName: team.characterName,
  characterImage: team.characterImage,
  accentColor: team.accentColor,
  memberCount: team.memberCount,
  weeklyPoints: index === 0 ? 12450 : index === 1 ? 11890 : 7320,
  totalPoints: team.totalPoints,
  weeklyWins: team.weeklyWins,
  trend: index === 0 ? 'same' : index === 1 ? 'up' : 'down',
}));