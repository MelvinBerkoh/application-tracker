-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SAVED', 'APPLIED', 'RECRUITER_SCREEN', 'INTERVIEW', 'ASSESSMENT', 'OFFER', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "WorkArrangement" AS ENUM ('ONSITE', 'HYBRID', 'REMOTE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('NOTE', 'FOLLOW_UP', 'STATUS_CHANGE', 'INTERVIEW', 'EMAIL', 'CALL', 'OTHER');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "owner_id" VARCHAR(255) NOT NULL,
    "company_name" VARCHAR(120) NOT NULL,
    "role_title" VARCHAR(160) NOT NULL,
    "job_description" TEXT,
    "job_url" VARCHAR(2048),
    "location" VARCHAR(160),
    "work_arrangement" "WorkArrangement",
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "salary_currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "source" VARCHAR(100),
    "resume_version" VARCHAR(100),
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SAVED',
    "applied_at" TIMESTAMP(3),
    "follow_up_at" TIMESTAMP(3),
    "contact_name" VARCHAR(120),
    "contact_email" VARCHAR(254),
    "contact_linkedin_url" VARCHAR(2048),
    "notes" TEXT,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_activities" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" VARCHAR(160),
    "description" TEXT,
    "from_status" "ApplicationStatus",
    "to_status" "ApplicationStatus",
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applications_owner_id_archived_at_idx" ON "applications"("owner_id", "archived_at");

-- CreateIndex
CREATE INDEX "applications_owner_id_status_idx" ON "applications"("owner_id", "status");

-- CreateIndex
CREATE INDEX "applications_owner_id_follow_up_at_idx" ON "applications"("owner_id", "follow_up_at");

-- CreateIndex
CREATE INDEX "applications_owner_id_applied_at_idx" ON "applications"("owner_id", "applied_at");

-- CreateIndex
CREATE INDEX "applications_owner_id_company_name_idx" ON "applications"("owner_id", "company_name");

-- CreateIndex
CREATE INDEX "application_activities_application_id_occurred_at_idx" ON "application_activities"("application_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "application_activities" ADD CONSTRAINT "application_activities_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
