-- CreateTable
CREATE TABLE "velocity_tracking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sprintId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedStoryPoints" INTEGER NOT NULL,
    "totalStoryPoints" INTEGER NOT NULL,
    "completedTasks" INTEGER NOT NULL,
    "totalTasks" INTEGER NOT NULL,
    "sprintDuration" INTEGER NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "velocity_tracking_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "velocity_tracking_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "velocity_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "burndown_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sprintId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "remainingPoints" INTEGER NOT NULL,
    "remainingTasks" INTEGER NOT NULL,
    "idealPoints" REAL NOT NULL,
    "completedPoints" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "burndown_data_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sprint_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sprintId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "velocityPoints" INTEGER NOT NULL,
    "completionRate" REAL NOT NULL,
    "averageTaskDuration" REAL NOT NULL,
    "teamEfficiency" REAL NOT NULL,
    "burndownTrend" TEXT NOT NULL,
    "predictedCompletion" DATETIME,
    "riskFactors" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sprint_analytics_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sprint_analytics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "velocity_tracking_sprintId_userId_key" ON "velocity_tracking"("sprintId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "burndown_data_sprintId_date_key" ON "burndown_data"("sprintId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "sprint_analytics_sprintId_key" ON "sprint_analytics"("sprintId");
