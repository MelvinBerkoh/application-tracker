import "server-only";

import { prisma } from "@/lib/prisma";

type GetApplicationByIdParams = {
  applicationId: string;
  ownerId: string;
};

export async function getApplicationById({
  applicationId,
  ownerId,
}: GetApplicationByIdParams) {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      ownerId,
      archivedAt: null,
    },
    include: {
      activities: {
        orderBy: {
          occurredAt: "desc",
        },
        take: 20,
      },
    },
  });
}

export type ApplicationDetail = NonNullable<
  Awaited<ReturnType<typeof getApplicationById>>
>;