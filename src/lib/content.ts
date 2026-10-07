import {getCollection, type CollectionEntry} from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({data}) => !data.draft);
  return posts.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export function uniqueCategories(posts: Post[]) {
  const map = new Map<string, {name: string; slug: string; count: number}>();
  for (const post of posts) {
    const {name, slug} = post.data.category;
    const current = map.get(slug);
    map.set(slug, {name, slug, count: (current?.count ?? 0) + 1});
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function uniqueTags(posts: Post[]) {
  const map = new Map<string, {name: string; slug: string; count: number}>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const current = map.get(tag.slug);
      map.set(tag.slug, {
        name: tag.name,
        slug: tag.slug,
        count: (current?.count ?? 0) + 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
