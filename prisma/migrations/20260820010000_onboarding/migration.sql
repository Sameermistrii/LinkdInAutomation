ALTER TABLE "User" ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Interest_userId_slug_key" ON "Interest"("userId", "slug");

ALTER TABLE "Interest" ADD CONSTRAINT "Interest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SavedLeader" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catalogId" TEXT NOT NULL DEFAULT '',
    "customUrl" TEXT NOT NULL DEFAULT '',
    "customName" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedLeader_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SavedLeader" ADD CONSTRAINT "SavedLeader_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
