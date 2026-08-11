import "server-only";

import { prisma } from "@/lib/prisma";

type GetFollowUpApplicationsParams = {
  ownerId: string;
};

export async function getFollowUpApplications({
  ownerId,
}: GetFollowUpApplicationsParams) {
  return prisma.application.findMany({
    where: {
      ownerId,
      archivedAt: null,
      followUpAt: {
        not: null,
      },
      status: {
        notIn: ["OFFER", "REJECTED", "WITHDRAWN"],
      },
    },
    select: {
      id: true,
      companyName: true,
      roleTitle: true,
      status: true,
      followUpAt: true,
      appliedAt: true,
      location: true,
    },
    orderBy: {
      followUpAt: "asc",
    },
  });
}

export type FollowUpApplication = Awaited<
  ReturnType<typeof getFollowUpApplications>
>[number];