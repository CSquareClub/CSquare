-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "tags" TEXT[],
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "venueName" TEXT,
    "city" TEXT,
    "onlineLink" TEXT,
    "organizerName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "registrationLink" TEXT NOT NULL,
    "registrationDeadline" TIMESTAMP(3),
    "bannerImage" TEXT,
    "prizes" TEXT,
    "rules" TEXT,
    "schedule" TEXT,
    "sponsors" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
