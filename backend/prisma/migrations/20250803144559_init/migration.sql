/*
  Warnings:

  - You are about to drop the column `created_at` on the `ai_comments` table. All the data in the column will be lost.
  - You are about to drop the column `task_id` on the `ai_comments` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `ai_comments` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ai_comments` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `criteria` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `sprint_id` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `daily_checkins` table. All the data in the column will be lost.
  - You are about to alter the column `mood` on the `daily_checkins` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to drop the column `created_at` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `is_read` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `color_theme` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_completion_date` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `sprint_duration_weeks` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `target_completion_date` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `total_sprints` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `sprints` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `sprints` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `sprints` table. All the data in the column will be lost.
  - You are about to drop the column `retrospective_good` on the `sprints` table. All the data in the column will be lost.
  - You are about to drop the column `retrospective_improve` on the `sprints` table. All the data in the column will be lost.
  - You are about to drop the column `sprint_number` on the `sprints` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `sprints` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `sprints` table. All the data in the column will be lost.
  - You are about to drop the column `velocity_points` on the `sprints` table. All the data in the column will be lost.
  - You are about to drop the column `assignee_id` on the `subtasks` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `subtasks` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `subtasks` table. All the data in the column will be lost.
  - You are about to drop the column `is_ai_assisted` on the `subtasks` table. All the data in the column will be lost.
  - You are about to drop the column `is_completed` on the `subtasks` table. All the data in the column will be lost.
  - You are about to drop the column `task_id` on the `subtasks` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `subtasks` table. All the data in the column will be lost.
  - You are about to drop the column `changed_by` on the `task_status_changes` table. All the data in the column will be lost.
  - You are about to drop the column `from_status` on the `task_status_changes` table. All the data in the column will be lost.
  - You are about to drop the column `task_id` on the `task_status_changes` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `task_status_changes` table. All the data in the column will be lost.
  - You are about to drop the column `to_status` on the `task_status_changes` table. All the data in the column will be lost.
  - You are about to drop the column `assignee_id` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `completed_at` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `is_ai_assisted` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `planned_date` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `sprint_id` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `story_points` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `joined_at` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `badge_id` on the `user_badges` table. All the data in the column will be lost.
  - You are about to drop the column `earned_at` on the `user_badges` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `user_badges` table. All the data in the column will be lost.
  - The primary key for the `user_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ai_coach_name` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `daily_checkin_enabled` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `daily_checkin_time` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `daily_focus_task_id` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `retrospective_enabled` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `sprint_duration_weeks` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `ai_usage_count` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `display_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_end_date` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_tier` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - Added the required column `content` to the `ai_comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskId` to the `ai_comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ai_comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `badges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `chat_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `chat_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productivity` to the `daily_checkins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `daily_checkins` table without a default value. This is not possible if the table is not empty.
  - Made the column `mood` on table `daily_checkins` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedCompletionDate` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetCompletionDate` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `sprints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `sprints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sprintNumber` to the `sprints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `sprints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `sprints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `subtasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskId` to the `subtasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `subtasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changedById` to the `task_status_changes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskId` to the `task_status_changes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toStatus` to the `task_status_changes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sprintId` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `team_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `team_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `badgeId` to the `user_badges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `user_badges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `user_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `user_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ai_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ai_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ai_comments" ("id") SELECT "id" FROM "ai_comments";
DROP TABLE "ai_comments";
ALTER TABLE "new_ai_comments" RENAME TO "ai_comments";
CREATE TABLE "new_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_badges" ("id", "name") SELECT "id", "name" FROM "badges";
DROP TABLE "badges";
ALTER TABLE "new_badges" RENAME TO "badges";
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");
CREATE TABLE "new_chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_chat_messages" ("id") SELECT "id" FROM "chat_messages";
DROP TABLE "chat_messages";
ALTER TABLE "new_chat_messages" RENAME TO "chat_messages";
CREATE TABLE "new_daily_checkins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "mood" INTEGER NOT NULL,
    "productivity" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_checkins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_daily_checkins" ("date", "id", "mood", "notes") SELECT "date", "id", "mood", "notes" FROM "daily_checkins";
DROP TABLE "daily_checkins";
ALTER TABLE "new_daily_checkins" RENAME TO "daily_checkins";
CREATE UNIQUE INDEX "daily_checkins_userId_date_key" ON "daily_checkins"("userId", "date");
CREATE TABLE "new_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_notifications" ("id", "message", "type") SELECT "id", "message", "type" FROM "notifications";
DROP TABLE "notifications";
ALTER TABLE "new_notifications" RENAME TO "notifications";
CREATE TABLE "new_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "colorTheme" TEXT NOT NULL DEFAULT '#3B82F6',
    "targetCompletionDate" DATETIME NOT NULL,
    "estimatedCompletionDate" DATETIME NOT NULL,
    "totalSprints" INTEGER NOT NULL DEFAULT 10,
    "sprintDurationWeeks" INTEGER NOT NULL DEFAULT 1,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_projects" ("description", "id", "status", "title") SELECT "description", "id", "status", "title" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
CREATE TABLE "new_sprints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "sprintNumber" INTEGER NOT NULL,
    "goal" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "velocityPoints" INTEGER,
    "retrospectiveGood" TEXT,
    "retrospectiveImprove" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sprints_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_sprints" ("goal", "id", "status") SELECT "goal", "id", "status" FROM "sprints";
DROP TABLE "sprints";
ALTER TABLE "new_sprints" RENAME TO "sprints";
CREATE UNIQUE INDEX "sprints_projectId_sprintNumber_key" ON "sprints"("projectId", "sprintNumber");
CREATE TABLE "new_subtasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT,
    "isAiAssisted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subtasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "subtasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "subtasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_subtasks" ("id", "title") SELECT "id", "title" FROM "subtasks";
DROP TABLE "subtasks";
ALTER TABLE "new_subtasks" RENAME TO "subtasks";
CREATE TABLE "new_task_status_changes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL DEFAULT 'todo',
    "toStatus" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_status_changes_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_status_changes_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_task_status_changes" ("id") SELECT "id" FROM "task_status_changes";
DROP TABLE "task_status_changes";
ALTER TABLE "new_task_status_changes" RENAME TO "task_status_changes";
CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sprintId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "storyPoints" INTEGER,
    "plannedDate" DATETIME,
    "completedAt" DATETIME,
    "notes" TEXT DEFAULT '',
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT,
    "isAiAssisted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tasks_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("description", "id", "notes", "status", "title") SELECT "description", "id", "notes", "status", "title" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
CREATE TABLE "new_team_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "team_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_team_members" ("id", "role") SELECT "id", "role" FROM "team_members";
DROP TABLE "team_members";
ALTER TABLE "new_team_members" RENAME TO "team_members";
CREATE UNIQUE INDEX "team_members_projectId_userId_key" ON "team_members"("projectId", "userId");
CREATE TABLE "new_user_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_badges" ("id") SELECT "id" FROM "user_badges";
DROP TABLE "user_badges";
ALTER TABLE "new_user_badges" RENAME TO "user_badges";
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");
CREATE TABLE "new_user_settings" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "sprintDurationWeeks" INTEGER NOT NULL DEFAULT 1,
    "dailyCheckinEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dailyCheckinTime" TEXT NOT NULL DEFAULT '09:00',
    "retrospectiveEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiCoachName" TEXT NOT NULL DEFAULT 'AI Coach',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
DROP TABLE "user_settings";
ALTER TABLE "new_user_settings" RENAME TO "user_settings";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "aiUsageCount" INTEGER NOT NULL DEFAULT 0,
    "subscriptionEndDate" DATETIME,
    "dailyFocusTaskId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("email", "id") SELECT "email", "id" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
