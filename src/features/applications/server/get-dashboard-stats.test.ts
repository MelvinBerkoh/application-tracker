import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  countApplications: vi.fn(),
  countActivities: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      count: mocks.countApplications,
    },
    applicationActivity: {
      count: mocks.countActivities,
    },
  },
}));

import { getDashboardStats } from "./get-dashboard-stats";

describe("getDashboardStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-08-12T12:00:00.000Z"),
    );

    mocks.countApplications
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);

    mocks.countActivities.mockResolvedValue(4);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns application pipeline metrics and future scheduled interview count", async () => {
    const now = new Date();

    const result = await getDashboardStats({
      ownerId: "user_123",
    });

    expect(result).toEqual({
      totalApplications: 12,
      activeInterviews: 3,
      upcomingInterviews: 4,
      followUpsDue: 2,
      offers: 1,
    });

    expect(mocks.countApplications).toHaveBeenNthCalledWith(
      1,
      {
        where: {
          ownerId: "user_123",
          archivedAt: null,
        },
      },
    );

    expect(mocks.countApplications).toHaveBeenNthCalledWith(
      2,
      {
        where: {
          ownerId: "user_123",
          archivedAt: null,
          status: {
            in: [
              "RECRUITER_SCREEN",
              "INTERVIEW",
              "ASSESSMENT",
            ],
          },
        },
      },
    );

    expect(mocks.countActivities).toHaveBeenCalledWith({
      where: {
        type: "INTERVIEW",
        occurredAt: {
          gte: now,
        },
        application: {
          ownerId: "user_123",
          archivedAt: null,
        },
      },
    });

    expect(mocks.countApplications).toHaveBeenNthCalledWith(
      3,
      {
        where: {
          ownerId: "user_123",
          archivedAt: null,
          followUpAt: {
            lte: now,
          },
          status: {
            notIn: [
              "OFFER",
              "REJECTED",
              "WITHDRAWN",
            ],
          },
        },
      },
    );

    expect(mocks.countApplications).toHaveBeenNthCalledWith(
      4,
      {
        where: {
          ownerId: "user_123",
          archivedAt: null,
          status: "OFFER",
        },
      },
    );
  });
});