CREATE TABLE IF NOT EXISTS "ReadingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "chapterIndex" INTEGER NOT NULL DEFAULT 0,
    "chapterTitle" TEXT,
    "lineIndex" INTEGER NOT NULL DEFAULT 0,
    "lineText" TEXT,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReadingProgress_userId_bookSlug_key" ON "ReadingProgress"("userId", "bookSlug");
CREATE INDEX IF NOT EXISTS "ReadingProgress_userId_updatedAt_idx" ON "ReadingProgress"("userId", "updatedAt");
