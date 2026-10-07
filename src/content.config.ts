import {defineCollection, z} from 'astro:content';
import {glob} from 'astro/loaders';

const taxonomy = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

const posts = defineCollection({
  loader: glob({pattern: '**/index.{md,mdx}', base: './src/content/posts'}),
  schema: ({image}) => z.object({
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    category: taxonomy,
    tags: z.array(taxonomy).default([]),
    cover: image().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

export const collections = {posts};
