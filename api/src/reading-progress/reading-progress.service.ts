import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { SaveReadingProgressDto } from './dto/save-reading-progress.dto.js';

type ReadingProgressRecord = {
  id: string;
  userId: string;
  bookSlug: string;
  chapterIndex: number;
  chapterTitle: string | null;
  lineIndex: number;
  lineText: string | null;
  progressPercent: number;
  updatedAt: Date;
};

@Injectable()
export class ReadingProgressService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  // The matching Prisma migration is the deployment path. This idempotent setup
  // also lets a running local API pick up this additive table without a reset.
  async onModuleInit() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ReadingProgress" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "bookSlug" TEXT NOT NULL,
        "chapterIndex" INTEGER NOT NULL DEFAULT 0,
        "chapterTitle" TEXT,
        "lineIndex" INTEGER NOT NULL DEFAULT 0,
        "lineText" TEXT,
        "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);
    await this.prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ReadingProgress_userId_bookSlug_key"
      ON "ReadingProgress"("userId", "bookSlug")
    `);
    await this.prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ReadingProgress_userId_updatedAt_idx"
      ON "ReadingProgress"("userId", "updatedAt")
    `);
  }

  listForUser(userId: string) {
    return this.prisma.$queryRawUnsafe<ReadingProgressRecord[]>(
      'SELECT * FROM "ReadingProgress" WHERE "userId" = $1 ORDER BY "updatedAt" DESC LIMIT 50',
      userId,
    );
  }

  async latestForUser(userId: string) {
    const results = await this.prisma.$queryRawUnsafe<ReadingProgressRecord[]>(
      'SELECT * FROM "ReadingProgress" WHERE "userId" = $1 ORDER BY "updatedAt" DESC LIMIT 1',
      userId,
    );
    return results[0] ?? null;
  }

  async findForBook(userId: string, bookSlug: string) {
    const results = await this.prisma.$queryRawUnsafe<ReadingProgressRecord[]>(
      'SELECT * FROM "ReadingProgress" WHERE "userId" = $1 AND "bookSlug" = $2 LIMIT 1',
      userId,
      bookSlug,
    );
    return results[0] ?? null;
  }

  async save(userId: string, bookSlug: string, dto: SaveReadingProgressDto) {
    const results = await this.prisma.$queryRawUnsafe<ReadingProgressRecord[]>(
      `INSERT INTO "ReadingProgress" ("id", "userId", "bookSlug", "chapterIndex", "chapterTitle", "lineIndex", "lineText", "progressPercent", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT ("userId", "bookSlug") DO UPDATE SET
         "chapterIndex" = EXCLUDED."chapterIndex",
         "chapterTitle" = EXCLUDED."chapterTitle",
         "lineIndex" = EXCLUDED."lineIndex",
         "lineText" = EXCLUDED."lineText",
         "progressPercent" = EXCLUDED."progressPercent",
         "updatedAt" = CURRENT_TIMESTAMP
       RETURNING *`,
      randomUUID(),
      userId,
      bookSlug,
      dto.chapterIndex,
      dto.chapterTitle ?? null,
      dto.lineIndex,
      dto.lineText ?? null,
      dto.progressPercent,
    );
    return results[0];
  }
}
