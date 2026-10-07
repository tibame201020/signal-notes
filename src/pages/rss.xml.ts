import rss from '@astrojs/rss';
import {getPublishedPosts} from '../lib/content';
import {siteConfig} from '../site.config';
import {withBase} from '../lib/urls';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: withBase(`/articles/${post.data.slug}/`),
    })),
  });
}
