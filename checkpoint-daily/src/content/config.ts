import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.enum(['News', 'Explainer', 'Rumour Radar']),
    categorySlug: z.enum(['news', 'explainers', 'rumour-radar']),
    publishedAt: z.string(),
    readingTime: z.string(),
    coverImage: z.string(),
    coverAlt: z.string(),
    author: z.object({
      name: z.string(),
      role: z.string(),
      avatar: z.string().optional(),
      bio: z.string().optional(),
    }),
    tags: z.array(z.string()).default([]),
    rumourStatus: z.enum(['confirmed', 'unverified', 'debunked']).optional(),
    featured: z.boolean().default(false),
    trendingRank: z.number().optional(),
  }),
});

const charactersCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    alias: z.string().optional(),
    role: z.string(),
    faction: z.string(),
    location: z.string(),
    status: z.enum(['Active', 'Wanted', 'Unknown']),
    portraitImage: z.string(),
    bannerImage: z.string().optional(),
    bio: z.string(),
    accentColor: z.string().default('#06b6d4'),
    teamSlug: z.string().optional(),
    stats: z
      .object({
        influence: z.number().min(0).max(100),
        notoriety: z.number().min(0).max(100),
        loyalty: z.number().min(0).max(100),
      })
      .optional(),
  }),
});

export const collections = {
  articles: articlesCollection,
  characters: charactersCollection,
};