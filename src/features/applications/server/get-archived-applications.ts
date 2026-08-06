import "server-only";

import { prisma } from "@/lib/prisma";

type GetArchivedApplicationsParams = {
  ownerId: string;
};

export async function getArchivedApplications({
  ownerId,
}: GetArchivedApplicationsParams) {
  return prisma.application.findMany({
    where: {
      ownerId,
      archivedAt: {
        not: null,
      },
    },
    select: {
      id: true,
      companyName: true,
      roleTitle: true,
      status: true,
      archivedAt: true,
    },
    orderBy: {
      archivedAt: "desc",
    },
  });
}

export type ArchivedApplication = Awaited<
  ReturnType<typeof getArchivedApplications>
>[number];