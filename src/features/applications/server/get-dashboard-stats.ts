import "server-only";

import { prisma } from "@/lib/prisma";

type GetDashboardStatsParams = {
  ownerId: string;
};

export type DashboardStats = {
  totalApplications: number;
  activeInterviews: number;
  upcomingInterviews: number;
  followUpsDue: number;
  offers: number;
};

export async function getDashboardStats({
  ownerId,
}: GetDashboardStatsParams): Promise<DashboardStats> {
  const now = new Date();

  const activeApplicationFilter = {
    ownerId,
    archivedAt: null,
  };

  const [
    totalApplications,
    activeInterviews,
    upcomingInterviews,
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

    prisma.applicationActivity.count({
      where: {
        type: "INTERVIEW",
        occurredAt: {
          gte: now,
        },
        application: {
          ownerId,
          archivedAt: null,
        },
      },
    }),

    prisma.application.count({
      where: {
        ...activeApplicationFilter,
        followUpAt: {
          lte: now,
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
    upcomingInterviews,
    followUpsDue,
    offers,
  };
}