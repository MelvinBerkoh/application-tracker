import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { ScheduleInterviewActionState } from "@/features/applications/types/schedule-interview-action-state";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findApplication: vi.fn(),
  findConflictingInterview: vi.fn(),
  createActivity: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.auth,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      findFirst: mocks.findApplication,
    },
    applicationActivity: {
      findFirst: mocks.findConflictingInterview,
      create: mocks.createActivity,
    },
  },
}));

import { scheduleInterview } from "./schedule-interview";

const initialState: ScheduleInterviewActionState = {
  status: "idle",
};

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("scheduleInterview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-08-12T12:00:00.000Z"),
    );

    mocks.auth.mockResolvedValue({
      userId: "user_123",
    });

    mocks.findApplication.mockResolvedValue({
      id: "application_123",
    });

    mocks.findConflictingInterview.mockResolvedValue(null);

    mocks.createActivity.mockResolvedValue({
      id: "interview_123",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects unauthenticated requests before accessing the database", async () => {
    mocks.auth.mockResolvedValue({
      userId: null,
    });

    const result = await scheduleInterview(
      "application_123",
      initialState,
      makeFormData({
        title: "Technical Interview",
        occurredAt: "2026-08-20T18:00:00.000Z",
        description: "Meet with engineering.",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: "You must be signed in to schedule an interview.",
    });

    expect(mocks.findApplication).not.toHaveBeenCalled();
    expect(mocks.findConflictingInterview).not.toHaveBeenCalled();
    expect(mocks.createActivity).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects an interview scheduled in the past", async () => {
    const result = await scheduleInterview(
      "application_123",
      initialState,
      makeFormData({
        title: "Technical Interview",
        occurredAt: "2026-08-11T18:00:00.000Z",
        description: "",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe(
      "Please correct the highlighted fields.",
    );

    expect(result.fieldErrors?.occurredAt).toContain(
      "Choose a future interview date and time.",
    );

    expect(mocks.findApplication).not.toHaveBeenCalled();
    expect(mocks.findConflictingInterview).not.toHaveBeenCalled();
    expect(mocks.createActivity).not.toHaveBeenCalled();
  });

  it("only schedules interviews for an active application owned by the authenticated user", async () => {
    mocks.findApplication.mockResolvedValue(null);

    const result = await scheduleInterview(
      "application_123",
      initialState,
      makeFormData({
        title: "Technical Interview",
        occurredAt: "2026-08-20T18:00:00.000Z",
        description: "",
      }),
    );

    expect(mocks.findApplication).toHaveBeenCalledWith({
      where: {
        id: "application_123",
        ownerId: "user_123",
        archivedAt: null,
      },
      select: {
        id: true,
      },
    });

    expect(result).toEqual({
      status: "error",
      message: "The application could not be found.",
    });

    expect(mocks.findConflictingInterview).not.toHaveBeenCalled();
    expect(mocks.createActivity).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects an exact-time conflict with another active interview", async () => {
    const interviewDate = new Date(
      "2026-08-20T18:00:00.000Z",
    );

    mocks.findConflictingInterview.mockResolvedValue({
      title: "Recruiter Interview",
      application: {
        companyName: "Northstar Labs",
        roleTitle: "Frontend Engineer",
      },
    });

    const result = await scheduleInterview(
      "application_123",
      initialState,
      makeFormData({
        title: "Technical Interview",
        occurredAt: interviewDate.toISOString(),
        description: "",
      }),
    );

    expect(
      mocks.findConflictingInterview,
    ).toHaveBeenCalledWith({
      where: {
        type: "INTERVIEW",
        occurredAt: interviewDate,
        application: {
          ownerId: "user_123",
          archivedAt: null,
        },
      },
      select: {
        title: true,
        application: {
          select: {
            companyName: true,
            roleTitle: true,
          },
        },
      },
    });

    expect(result.status).toBe("error");
    expect(result.message).toBe(
      "You already have an interview scheduled at that time.",
    );

    expect(result.fieldErrors?.occurredAt?.[0]).toContain(
      "Recruiter Interview",
    );

    expect(result.fieldErrors?.occurredAt?.[0]).toContain(
      "Northstar Labs",
    );

    expect(mocks.createActivity).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("creates a future interview and revalidates the dashboard and application", async () => {
    const interviewDate = new Date(
      "2026-08-20T19:00:00.000Z",
    );

    const result = await scheduleInterview(
      "application_123",
      initialState,
      makeFormData({
        title: "  Technical Interview  ",
        occurredAt: interviewDate.toISOString(),
        description: "  Zoom with engineering manager.  ",
      }),
    );

    expect(mocks.createActivity).toHaveBeenCalledWith({
      data: {
        applicationId: "application_123",
        type: "INTERVIEW",
        title: "Technical Interview",
        description: "Zoom with engineering manager.",
        occurredAt: interviewDate,
      },
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/dashboard",
    );

    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/applications/application_123",
    );

    expect(result).toEqual({
      status: "success",
      message: "Interview scheduled.",
    });
  });

  it("returns a safe error when Prisma cannot create the interview", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mocks.createActivity.mockRejectedValue(
      new Error("Database unavailable"),
    );

    const result = await scheduleInterview(
      "application_123",
      initialState,
      makeFormData({
        title: "Technical Interview",
        occurredAt: "2026-08-20T18:00:00.000Z",
        description: "",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message:
        "The interview could not be scheduled. Please try again in a moment.",
    });

    expect(consoleError).toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});