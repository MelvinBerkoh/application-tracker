-- CreateTable
CREATE TABLE "resume_versions" (
    "id" TEXT NOT NULL,
    "owner_id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resume_versions_owner_id_idx" ON "resume_versions"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "resume_versions_owner_id_name_key" ON "resume_versions"("owner_id", "name");
