-- Seed Characters
INSERT INTO public.characters (slug, name, alias, faction, location, portrait_url, accent_color)
VALUES
  (
    'lucia-caminos',
    'Lucia Caminos',
    'The Architect',
    'Vice-Dale Syndicate',
    'Vice City',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    '#f59e0b'
  ),
  (
    'jason-duval',
    'Jason Duval',
    'Gellhorn Ghost',
    'Port Gellhorn Crew',
    'Port Gellhorn',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    '#06b6d4'
  ),
  (
    'dre-quan',
    'Dre Quan',
    'Tide Runner',
    'Keys Smugglers',
    'Southern Keys',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    '#10b981'
  );

-- Seed Faction Teams
INSERT INTO public.teams (slug, name, motto, description, character_id, accent_color)
SELECT
  'team-lucia',
  'Team Lucia',
  'Precision over noise. Every exit mapped.',
  'Tactical planners backing Lucia Caminos across Vice-Dale and the eastern seaboard.',
  id,
  '#f59e0b'
FROM public.characters WHERE slug = 'lucia-caminos';

INSERT INTO public.teams (slug, name, motto, description, character_id, accent_color)
SELECT
  'team-jason',
  'Team Jason',
  'Fast wheels, clean getaway, zero hesitation.',
  'Street-level operators and wheelmen loyal to Jason Duval from Port Gellhorn to the Keys.',
  id,
  '#06b6d4'
FROM public.characters WHERE slug = 'jason-duval';

INSERT INTO public.teams (slug, name, motto, description, character_id, accent_color)
SELECT
  'team-keys',
  'Keys Smugglers',
  'Own the tide, control the contraband.',
  'Maritime runners operating out of the Southern Keys and Grassrivers backwaters.',
  id,
  '#10b981'
FROM public.characters WHERE slug = 'dre-quan';

-- Seed Week 14 Active Poll
INSERT INTO public.polls (week_number, title, question, status, closes_at)
VALUES (
  14,
  'Week 14 Arena Clash: Lucia vs. Jason',
  'Who calls the shots when a Vice City heist goes sideways?',
  'active',
  NOW() + INTERVAL '7 days'
);

-- Seed Poll Options
INSERT INTO public.poll_options (poll_id, character_id)
SELECT p.id, c.id
FROM public.polls p, public.characters c
WHERE p.week_number = 14 AND c.slug IN ('lucia-caminos', 'jason-duval');