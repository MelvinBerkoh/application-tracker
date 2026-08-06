import "server-only";

import { prisma } from "@/lib/prisma";

type GetDashboardStatsParams = {
  ownerId: string;
};

export type DashboardStats = {
  totalApplications: number;
  activeInterviews: number;
  followUpsDue: number;
  offers: number;
};

export async function getDashboardStats({
  ownerId,
}: GetDashboardStatsParams): Promise<DashboardStats> {
  const activeApplicationFilter = {
    ownerId,
    archivedAt: null,
  };

  const [
    totalApplications,
    activeInterviews,
    followUpsDue,
    offers,
  ] = await Promise.all([
    prisma.application.count({
      where: activeApplicationFilter,
    }),

    prisma.application.count({
      where: {
        ...activeApplicationFilter,
        status: {
          in: ["RECRUITER_SCREEN", "INTERVIEW", "ASSESSMENT"],
        },
      },
    }),

    prisma.application.count({
      where: {
        ...activeApplicationFilter,
        followUpAt: {
          lte: new Date(),
        },
        status: {
          notIn: ["OFFER", "REJECTED", "WITHDRAWN"],
        },
      },
    }),

    prisma.application.count({
      where: {
        ...activeApplicationFilter,
        status: "OFFER",
      },
    }),
  ]);

  return {
    totalApplications,
    activeInterviews,
    followUpsDue,
    offers,
  };
}