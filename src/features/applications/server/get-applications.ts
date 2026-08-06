import "server-only";

import {
  applicationStatuses,
  type ApplicationInput,
} from "@/features/applications/schemas/application";
import { prisma } from "@/lib/prisma";

export const applicationSortOptions = [
  "updated-desc",
  "applied-desc",
  "company-asc",
] as const;

export type ApplicationSort =
  (typeof applicationSortOptions)[number];

export type ApplicationStatus = ApplicationInput["status"];

type GetApplicationsParams = {
  ownerId: string;
  query?: string;
  status?: ApplicationStatus;
  sort?: ApplicationSort;
};

export async function getApplications({
  ownerId,
  query,
  status,
  sort = "updated-desc",
}: GetApplicationsParams) {
  const normalizedQuery = query?.trim();

  const orderBy =
    sort === "applied-desc"
      ? [
          {
            appliedAt: {
              sort: "desc" as const,
              nulls: "last" as const,
            },
          },
          {
            updatedAt: "desc" as const,
          },
        ]
      : sort === "company-asc"
        ? [
            {
              companyName: "asc" as const,
            },
            {
              roleTitle: "asc" as const,
            },
          ]
        : [
            {
              updatedAt: "desc" as const,
            },
          ];

  return prisma.application.findMany({
    where: {
      ownerId,
      archivedAt: null,

      ...(status && applicationStatuses.includes(status)
        ? {
            status,
          }
        : {}),

      ...(normalizedQuery
        ? {
            OR: [
              {
                companyName: {
                  contains: normalizedQuery,
                  mode: "insensitive" as const,
                },
              },
              {
                roleTitle: {
                  contains: normalizedQuery,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    },

    select: {
      id: true,
      companyName: true,
      roleTitle: true,
      status: true,
      location: true,
      workArrangement: true,
      appliedAt: true,
      followUpAt: true,
      updatedAt: true,
    },

    orderBy,
  });
}

export type ApplicationListItem = Awaited<
  ReturnType<typeof getApplications>
>[number];