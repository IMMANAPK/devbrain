export interface SyllabusTopic {
  topic: string;
  keywords: string[];
  weight: number; // importance 1-3
}

export interface RoleSyllabus {
  role: string;
  topics: SyllabusTopic[];
}

export const SYLLABI: RoleSyllabus[] = [
  {
    role: 'Backend',
    topics: [
      { topic: 'REST API Design', keywords: ['rest', 'api', 'endpoint', 'http', 'crud', 'route', 'controller'], weight: 3 },
      { topic: 'Authentication & Authorization', keywords: ['jwt', 'auth', 'passport', 'oauth', 'login', 'token', 'session', 'guard'], weight: 3 },
      { topic: 'Database Design', keywords: ['mongodb', 'postgresql', 'mysql', 'schema', 'model', 'migration', 'index', 'query'], weight: 3 },
      { topic: 'NestJS', keywords: ['nestjs', 'module', 'service', 'controller', 'decorator', 'dependency injection', 'pipe', 'interceptor'], weight: 3 },
      { topic: 'System Design', keywords: ['system design', 'scalability', 'microservices', 'load balancer', 'caching', 'architecture'], weight: 3 },
      { topic: 'Message Queues', keywords: ['bullmq', 'rabbitmq', 'kafka', 'queue', 'worker', 'job', 'async', 'background'], weight: 2 },
      { topic: 'Caching', keywords: ['redis', 'cache', 'memcached', 'ttl', 'invalidation'], weight: 2 },
      { topic: 'Testing', keywords: ['unit test', 'jest', 'integration test', 'e2e', 'mock', 'supertest'], weight: 2 },
      { topic: 'Docker & DevOps', keywords: ['docker', 'container', 'kubernetes', 'ci/cd', 'deployment', 'nginx'], weight: 2 },
      { topic: 'Security', keywords: ['xss', 'csrf', 'injection', 'ssl', 'https', 'encryption', 'vulnerability'], weight: 2 },
      { topic: 'TypeScript', keywords: ['typescript', 'types', 'interface', 'generics', 'enum', 'decorator'], weight: 2 },
      { topic: 'Error Handling', keywords: ['error', 'exception', 'try catch', 'logging', 'monitoring', 'sentry'], weight: 1 },
    ],
  },
  {
    role: 'Frontend',
    topics: [
      { topic: 'React', keywords: ['react', 'component', 'hook', 'state', 'props', 'useEffect', 'useMemo', 'useCallback'], weight: 3 },
      { topic: 'TypeScript', keywords: ['typescript', 'types', 'interface', 'generics', 'type guard'], weight: 3 },
      { topic: 'State Management', keywords: ['zustand', 'redux', 'context', 'global state', 'store'], weight: 3 },
      { topic: 'CSS & Tailwind', keywords: ['tailwind', 'css', 'flexbox', 'grid', 'responsive', 'animation'], weight: 2 },
      { topic: 'API Integration', keywords: ['axios', 'fetch', 'react query', 'tanstack', 'api call', 'rest'], weight: 3 },
      { topic: 'Performance', keywords: ['lazy load', 'code split', 'memo', 'virtualization', 'bundle size', 'lighthouse'], weight: 2 },
      { topic: 'Testing', keywords: ['jest', 'vitest', 'testing library', 'cypress', 'playwright', 'unit test'], weight: 2 },
      { topic: 'Build Tools', keywords: ['vite', 'webpack', 'esbuild', 'rollup', 'babel'], weight: 1 },
      { topic: 'Accessibility', keywords: ['a11y', 'aria', 'wcag', 'screen reader', 'keyboard navigation'], weight: 1 },
    ],
  },
  {
    role: 'Fullstack',
    topics: [
      { topic: 'React', keywords: ['react', 'component', 'hook', 'useEffect', 'state'], weight: 3 },
      { topic: 'NestJS / Node.js', keywords: ['nestjs', 'nodejs', 'express', 'module', 'service'], weight: 3 },
      { topic: 'Database', keywords: ['mongodb', 'postgresql', 'schema', 'query', 'orm', 'mongoose'], weight: 3 },
      { topic: 'Authentication', keywords: ['jwt', 'auth', 'login', 'session', 'token', 'guard'], weight: 3 },
      { topic: 'REST API', keywords: ['rest', 'api', 'endpoint', 'http', 'crud'], weight: 3 },
      { topic: 'TypeScript', keywords: ['typescript', 'types', 'interface', 'generics'], weight: 2 },
      { topic: 'State Management', keywords: ['zustand', 'redux', 'context', 'global state'], weight: 2 },
      { topic: 'Caching & Queues', keywords: ['redis', 'bullmq', 'cache', 'queue', 'worker'], weight: 2 },
      { topic: 'System Design', keywords: ['system design', 'scalability', 'microservices', 'architecture'], weight: 2 },
      { topic: 'Docker & DevOps', keywords: ['docker', 'ci/cd', 'deployment', 'kubernetes'], weight: 1 },
      { topic: 'Testing', keywords: ['jest', 'unit test', 'e2e', 'mock'], weight: 1 },
    ],
  },
];

export function getSyllabus(role: string): RoleSyllabus {
  return SYLLABI.find((s) => s.role.toLowerCase() === role.toLowerCase()) ?? SYLLABI[2];
}
