-- ============================================================================
-- CHECKPOINT DAILY — SUPABASE POSTGRESQL SCHEMA, TRIGGERS & RLS POLICIES
-- ============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES (Linked 1:1 to Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL CHECK (char_length(username) BETWEEN 3 AND 20 AND username ~ '^[a-zA-Z0-9_]+$'),
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Automatically create a profile row when a new user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  raw_username TEXT;
BEGIN
  raw_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'operative_' || substr(NEW.id::text, 1, 8)
  );

  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, raw_username);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. CHARACTERS
-- ----------------------------------------------------------------------------
CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  alias TEXT,
  faction TEXT NOT NULL,
  location TEXT NOT NULL,
  portrait_url TEXT NOT NULL,
  accent_color TEXT NOT NULL DEFAULT '#06b6d4',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_characters_slug ON public.characters(slug);

-- ----------------------------------------------------------------------------
-- 3. TEAMS (Character Factions)
-- ----------------------------------------------------------------------------
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL,
  motto TEXT NOT NULL,
  description TEXT NOT NULL,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE RESTRICT,
  accent_color TEXT NOT NULL DEFAULT '#06b6d4',
  member_count INTEGER NOT NULL DEFAULT 0 CHECK (member_count >= 0),
  weekly_points INTEGER NOT NULL DEFAULT 0 CHECK (weekly_points >= 0),
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  weekly_wins INTEGER NOT NULL DEFAULT 0 CHECK (weekly_wins >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_slug ON public.teams(slug);
CREATE INDEX idx_teams_total_points ON public.teams(total_points DESC);

-- ----------------------------------------------------------------------------
-- 4. TEAM MEMBERSHIPS (Permanent Allegiance — 1 Faction per User)
-- ----------------------------------------------------------------------------
CREATE TABLE public.team_memberships (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_team_memberships_team_id ON public.team_memberships(team_id);

-- Atomically increment teams.member_count when a user pledges allegiance
CREATE OR REPLACE FUNCTION public.handle_new_team_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.teams
  SET member_count = member_count + 1
  WHERE id = NEW.team_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_membership_inserted
  AFTER INSERT ON public.team_memberships
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_team_membership();

-- ----------------------------------------------------------------------------
-- 5. POLLS & POLL OPTIONS (Weekly Character Battles)
-- ----------------------------------------------------------------------------
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'closed')),
  closes_at TIMESTAMPTZ NOT NULL,
  winner_option_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_polls_status ON public.polls(status);
CREATE INDEX idx_polls_week_number ON public.polls(week_number DESC);

CREATE TABLE public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE RESTRICT,
  vote_count INTEGER NOT NULL DEFAULT 0 CHECK (vote_count >= 0),
  UNIQUE (poll_id, character_id)
);

CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);

ALTER TABLE public.polls
  ADD CONSTRAINT fk_polls_winner_option
  FOREIGN KEY (winner_option_id) REFERENCES public.poll_options(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 6. VOTES (1 Ballot per Authenticated User per Poll)
-- ----------------------------------------------------------------------------
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_awarded INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Hard database guarantee against duplicate votes per poll
  UNIQUE (poll_id, user_id)
);

CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_votes_poll_id ON public.votes(poll_id);

-- Validate option belongs to poll, poll is active, and atomically update counts & faction points
CREATE OR REPLACE FUNCTION public.handle_new_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  poll_status TEXT;
  poll_deadline TIMESTAMPTZ;
  option_poll_id UUID;
  voter_team_id UUID;
BEGIN
  -- 1. Verify the option actually belongs to the target poll
  SELECT poll_id INTO option_poll_id
  FROM public.poll_options
  WHERE id = NEW.option_id;

  IF option_poll_id IS NULL OR option_poll_id <> NEW.poll_id THEN
    RAISE EXCEPTION 'Invalid poll option for this matchup.';
  END IF;

  -- 2. Verify poll is open and past deadline check
  SELECT status, closes_at INTO poll_status, poll_deadline
  FROM public.polls
  WHERE id = NEW.poll_id;

  IF poll_status <> 'active' OR poll_deadline <= NOW() THEN
    RAISE EXCEPTION 'This weekly arena poll is closed.';
  END IF;

  -- 3. Increment option ballot tally atomically
  UPDATE public.poll_options
  SET vote_count = vote_count + 1
  WHERE id = NEW.option_id;

  -- 4. Credit +10 faction points if the voter belongs to a team
  SELECT team_id INTO voter_team_id
  FROM public.team_memberships
  WHERE user_id = NEW.user_id;

  IF voter_team_id IS NOT NULL THEN
    UPDATE public.teams
    SET
      weekly_points = weekly_points + NEW.points_awarded,
      total_points = total_points + NEW.points_awarded
    WHERE id = voter_team_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_vote_inserted
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vote();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- PROFILES: Public read; users can update only their own username/avatar (never their role)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- CHARACTERS: Public read; admin-only write
CREATE POLICY "Characters are viewable by everyone"
  ON public.characters FOR SELECT
  USING (true);

-- TEAMS: Public read; scores mutated strictly by SECURITY DEFINER triggers
CREATE POLICY "Teams are viewable by everyone"
  ON public.teams FOR SELECT
  USING (true);

-- TEAM MEMBERSHIPS: Public read; authenticated user can insert ONCE for themselves; NO update/delete
CREATE POLICY "Team memberships are viewable by everyone"
  ON public.team_memberships FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can pledge allegiance once"
  ON public.team_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- POLLS & OPTIONS: Public read
CREATE POLICY "Polls are viewable by everyone"
  ON public.polls FOR SELECT
  USING (true);

CREATE POLICY "Poll options are viewable by everyone"
  ON public.poll_options FOR SELECT
  USING (true);

-- VOTES: Users can read their own ballot history; authenticated users can insert once per poll
CREATE POLICY "Users can view their own vote history"
  ON public.votes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can cast their own ballot"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);