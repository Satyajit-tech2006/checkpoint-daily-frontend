export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  isCommunity?: boolean;
}

export interface FooterColumn {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface CategoryItem {
  label: string;
  slug: string;
  href: string;
  count?: number;
}

export interface SearchableItem {
  id: string;
  title: string;
  excerpt: string;
  category: 'News' | 'Explainer' | 'Rumour Radar' | 'Character';
  href: string;
  date?: string;
}

export interface SocialLinkItem {
  platform: 'youtube' | 'x' | 'discord' | 'twitch' | 'rss';
  href: string;
  label: string;
}

export type RumourStatus = 'confirmed' | 'unverified' | 'debunked';

export interface Author {
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  href?: string;
}

export interface ArticleSummary {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  publishedAt: string;
  readingTime: string;
  coverImage: string;
  coverAlt: string;
  author: Author;
  tags?: string[];
  rumourStatus?: RumourStatus;
  featured?: boolean;
}

// --- Community & Gaming Models ---

export interface CharacterProfile {
  id: string;
  slug: string;
  name: string;
  alias?: string;
  role: string;
  faction: string;
  location: string;
  status: 'Active' | 'Wanted' | 'Unknown';
  portraitImage: string;
  bannerImage?: string;
  bio: string;
  accentColor?: string;
  teamId?: string;
  stats?: {
    influence: number;
    notoriety: number;
    loyalty: number;
  };
}

export interface CharacterTeam {
  id: string;
  slug: string;
  name: string;
  motto: string;
  description: string;
  characterName: string;
  characterImage: string;
  accentColor: string;
  memberCount: number;
  totalPoints: number;
  weeklyWins: number;
}

export interface PollOption {
  id: string;
  characterId: string;
  characterName: string;
  characterAlias?: string;
  faction: string;
  portraitImage: string;
  accentColor: string;
  voteCount: number;
}

export interface WeeklyPoll {
  id: string;
  weekNumber: number;
  title: string;
  question: string;
  closesAt: string;
  status: 'active' | 'closed';
  options: [PollOption, PollOption];
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamSlug: string;
  teamName: string;
  characterName: string;
  characterImage: string;
  accentColor: string;
  memberCount: number;
  weeklyPoints: number;
  totalPoints: number;
  weeklyWins: number;
  trend: 'up' | 'down' | 'same';
}

export interface UserSessionProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  teamId?: string;
  teamName?: string;
  votesCast: number;
}