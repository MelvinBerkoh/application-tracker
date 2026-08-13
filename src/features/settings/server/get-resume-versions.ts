import "server-only";

import { prisma } from "@/lib/prisma";

type GetResumeVersionsInput = {
  ownerId: string;
};

export async function getResumeVersions({
  ownerId,
}: GetResumeVersionsInput) {
  return prisma.resumeVersion.findMany({
    where: {
      ownerId,
    },
    orderBy: [
      {
        createdAt: "asc",
      },
      {
        name: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
}