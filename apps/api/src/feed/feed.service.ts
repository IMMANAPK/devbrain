import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface FeedItem {
  id: string;
  type: 'github' | 'devto';
  title: string;
  url: string;
  summary: string;
  publishedAt: string;
  source: string;
  tags: string[];
}

// Map lowercase tech keywords → GitHub owner/repo
const STACK_TO_REPO: Record<string, string> = {
  nestjs: 'nestjs/nest',
  react: 'facebook/react',
  vue: 'vuejs/core',
  angular: 'angular/angular',
  typescript: 'microsoft/TypeScript',
  mongodb: 'mongodb/node-mongodb-native',
  mongoose: 'Automattic/mongoose',
  redis: 'redis/ioredis',
  bullmq: 'taskforcesh/bullmq',
  bull: 'OptimalBits/bull',
  docker: 'docker/compose',
  kubernetes: 'kubernetes/kubernetes',
  vite: 'vitejs/vite',
  tailwind: 'tailwindlabs/tailwindcss',
  tailwindcss: 'tailwindlabs/tailwindcss',
  prisma: 'prisma/prisma',
  graphql: 'graphql/graphql-js',
  jest: 'jestjs/jest',
  playwright: 'microsoft/playwright',
  zustand: 'pmndrs/zustand',
  axios: 'axios/axios',
  express: 'expressjs/express',
  fastify: 'fastify/fastify',
  nextjs: 'vercel/next.js',
  next: 'vercel/next.js',
  trpc: 'trpc/trpc',
  zod: 'colinhacks/zod',
  vitest: 'vitest-dev/vitest',
  drizzle: 'drizzle-team/drizzle-orm',
  hono: 'honojs/hono',
};

// Map lowercase tech keywords → dev.to tag
const STACK_TO_TAG: Record<string, string> = {
  nestjs: 'nestjs',
  react: 'react',
  vue: 'vue',
  typescript: 'typescript',
  javascript: 'javascript',
  mongodb: 'mongodb',
  redis: 'redis',
  docker: 'docker',
  kubernetes: 'kubernetes',
  tailwind: 'tailwind',
  tailwindcss: 'tailwind',
  graphql: 'graphql',
  nodejs: 'node',
  node: 'node',
  postgresql: 'postgres',
  postgres: 'postgres',
  mysql: 'mysql',
  nextjs: 'nextjs',
  angular: 'angular',
  prisma: 'prisma',
  python: 'python',
  go: 'go',
  rust: 'rust',
  devops: 'devops',
  cicd: 'devops',
  microservices: 'microservices',
  systemdesign: 'systemdesign',
};

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);
  private cache = new Map<string, { data: FeedItem[]; expiresAt: number }>();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  async fetchForStack(stack: string[]): Promise<FeedItem[]> {
    if (!stack || stack.length === 0) return [];

    const normalised = stack.map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const cacheKey = [...normalised].sort().join(',');

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      this.logger.debug(`Cache hit for: ${cacheKey}`);
      return cached.data;
    }

    const items: FeedItem[] = await Promise.all([
      this.fetchGitHubReleases(normalised),
      this.fetchDevToArticles(normalised),
    ]).then(([a, b]) => [...a, ...b]);

    // Sort newest first
    items.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    const result = items.slice(0, 30);
    this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL });
    return result;
  }

  // ── GitHub ───────────────────────────────────────────────────────────────

  private async fetchGitHubReleases(stack: string[]): Promise<FeedItem[]> {
    const repos = new Set<string>();
    for (const tech of stack) {
      const repo = STACK_TO_REPO[tech];
      if (repo) repos.add(repo);
    }

    const results: FeedItem[] = [];
    const repoList = Array.from(repos).slice(0, 6); // max 6 repos to stay under rate limit

    await Promise.allSettled(
      repoList.map(async (repo) => {
        try {
          const { data } = await axios.get<any[]>(
            `https://api.github.com/repos/${repo}/releases`,
            {
              params: { per_page: 3 },
              headers: { Accept: 'application/vnd.github+json' },
              timeout: 6000,
            },
          );

          for (const release of data.slice(0, 2)) {
            results.push({
              id: `github-${repo}-${release.id}`,
              type: 'github',
              title: `${repo.split('/')[1]} ${release.tag_name} released`,
              url: release.html_url as string,
              summary: this.trimMarkdown(release.body as string | null, 220),
              publishedAt: release.published_at as string,
              source: repo,
              tags: [repo.split('/')[1]],
            });
          }
        } catch (err: any) {
          this.logger.warn(`GitHub fetch failed for ${repo}: ${err?.message}`);
        }
      }),
    );

    return results;
  }

  // ── dev.to ───────────────────────────────────────────────────────────────

  private async fetchDevToArticles(stack: string[]): Promise<FeedItem[]> {
    const tags = new Set<string>();
    for (const tech of stack) {
      const tag = STACK_TO_TAG[tech];
      if (tag) tags.add(tag);
    }

    const results: FeedItem[] = [];
    const tagList = Array.from(tags).slice(0, 4); // max 4 tags

    await Promise.allSettled(
      tagList.map(async (tag) => {
        try {
          const { data } = await axios.get<any[]>('https://dev.to/api/articles', {
            params: { tag, per_page: 5, top: 1 },
            timeout: 6000,
          });

          for (const article of data.slice(0, 3)) {
            results.push({
              id: `devto-${article.id}`,
              type: 'devto',
              title: article.title as string,
              url: article.url as string,
              summary: (article.description as string) || '',
              publishedAt: article.published_at as string,
              source: `dev.to #${tag}`,
              tags: (article.tag_list as string[]) || [tag],
            });
          }
        } catch (err: any) {
          this.logger.warn(`dev.to fetch failed for #${tag}: ${err?.message}`);
        }
      }),
    );

    return results;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private trimMarkdown(text: string | null | undefined, maxLen: number): string {
    if (!text) return '';
    // strip markdown headers and bullet chars, then trim
    const clean = text
      .replace(/#{1,6}\s/g, '')
      .replace(/[*_`]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    return clean.length > maxLen ? clean.slice(0, maxLen) + '…' : clean;
  }
}
