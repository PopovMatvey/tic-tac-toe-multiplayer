import { Prisma } from '@prisma/client';

export const matchInclude = {
  playerX: true,
  playerO: true,
  games: {
    orderBy: { index: 'desc' as const },
    take: 1,
  },
} satisfies Prisma.MatchInclude;

export type MatchRecord = Prisma.MatchGetPayload<{ include: typeof matchInclude }>;
