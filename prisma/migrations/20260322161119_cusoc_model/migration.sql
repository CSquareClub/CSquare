-- CreateTable
CREATE TABLE "CusocRegistration2026" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "cuEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "dsaLevel" TEXT NOT NULL,
    "devExperience" TEXT NOT NULL,
    "primaryTrack" TEXT NOT NULL,
    "githubProfile" TEXT NOT NULL,
    "projectCount" TEXT NOT NULL,
    "bestProjectLink" TEXT NOT NULL,
    "openSourceContrib" TEXT NOT NULL,
    "openSourceLink" TEXT,
    "targetOrgs" TEXT NOT NULL,
    "exploredRepo" TEXT NOT NULL,
    "orgRepoLink" TEXT,
    "primaryGoal" TEXT NOT NULL,
    "whyCusoc" TEXT NOT NULL,
    "hoursPerWeek" TEXT NOT NULL,
    "readyWeeklyTasks" TEXT NOT NULL,
    "readyDeadlines" TEXT NOT NULL,
    "proposalOrgName" TEXT NOT NULL,
    "proposalProjectTitle" TEXT NOT NULL,
    "proposalProblemStatement" TEXT NOT NULL,
    "proposalSolution" TEXT NOT NULL,
    "proposalTechStack" TEXT NOT NULL,
    "proposalTimeline" TEXT NOT NULL,
    "screeningChoice" TEXT NOT NULL,
    "screeningAnswer" TEXT NOT NULL,

    CONSTRAINT "CusocRegistration2026_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CusocRegistration2027" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "cuEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "skillLevel" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "interestArea" TEXT NOT NULL,
    "goalLearnCoding" BOOLEAN NOT NULL DEFAULT false,
    "goalBuildProjects" BOOLEAN NOT NULL DEFAULT false,
    "goalTargetGsoc" BOOLEAN NOT NULL DEFAULT false,
    "whyJoin" TEXT NOT NULL,
    "knowsOpenSource" BOOLEAN NOT NULL DEFAULT false,
    "knowsGsoc" BOOLEAN NOT NULL DEFAULT false,
    "hoursPerWeek" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,

    CONSTRAINT "CusocRegistration2027_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CusocRegistration2026_cuEmail_key" ON "CusocRegistration2026"("cuEmail");

-- CreateIndex
CREATE UNIQUE INDEX "CusocRegistration2027_cuEmail_key" ON "CusocRegistration2027"("cuEmail");
