import "server-only";

import { prisma } from "@/lib/prisma";

type GetNextInterviewParams = {
  ownerId: string;
};

export type NextInterview = {
  id: string;
  title: string | null;
  description: string | null;
  occurredAt: Date;
  application: {
    id: string;
    companyName: string;
    roleTitle: string;
  };
};

export async function getNextInterview({
  ownerId,
}: GetNextInterviewParams): Promise<NextInterview | null> {
  return prisma.applicationActivity.findFirst({
    where: {
      type: "INTERVIEW",
      occurredAt: {
        gte: new Date(),
      },
      application: {
        ownerId,
        archivedAt: null,
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      occurredAt: true,
      application: {
        select: {
          id: true,
          companyName: true,
          roleTitle: true,
        },
      },
    },
    orderBy: {
      occurredAt: "asc",
    },
  });
}