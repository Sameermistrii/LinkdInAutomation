-- AlterTable
CREATE TABLE "ExtraSlot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExtraSlot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScheduleSkip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScheduleSkip_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScheduleSkip_userId_date_key" ON "ScheduleSkip"("userId", "date");

ALTER TABLE "ExtraSlot" ADD CONSTRAINT "ExtraSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduleSkip" ADD CONSTRAINT "ScheduleSkip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
