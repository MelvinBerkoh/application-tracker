import "server-only";

import { prisma } from "@/lib/prisma";

type GetRecentApplicationsParams = {
  ownerId: string;
  limit?: number;
};

export async function getRecentApplications({
  ownerId,
  limit = 10,
}: GetRecentApplicationsParams) {
  return prisma.application.findMany({
    where: {
      ownerId,
      archivedAt: null,
    },
    select: {
      id: true,
      companyName: true,
      roleTitle: true,
      status: true,
      location: true,
      appliedAt: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  });
}

export type RecentApplication = Awaited<
  ReturnType<typeof getRecentApplications>
>[number];