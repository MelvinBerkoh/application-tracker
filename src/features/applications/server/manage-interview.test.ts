import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { ManageInterviewActionState } from "@/features/applications/types/manage-interview-action-state";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findInterview: vi.fn(),
  updateActivity: vi.fn(),
  deleteActivity: vi.fn(),
  createActivity: vi.fn(),
  transaction: vi.fn(),
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
    applicationActivity: {
      findFirst: mocks.findInterview,
      update: mocks.updateActivity,
      delete: mocks.deleteActivity,
      create: mocks.createActivity,
    },
    $transaction: mocks.transaction,
  },
}));

import { manageInterview } from "./manage-interview";

const initialState: ManageInterviewActionState = {
  status: "idle",
};

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

const existingInterview = {
  id: "interview_123",
  applicationId: "application_123",
  title: "Technical Interview",
};

describe("manageInterview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-08-12T12:00:00.000Z"),
    );

    mocks.auth.mockResolvedValue({
      userId: "user_123",
    });

    mocks.findInterview.mockResolvedValue(existingInterview);

    mocks.updateActivity.mockResolvedValue({
      id: "interview_123",
    });

    mocks.deleteActivity.mockResolvedValue({
      id: "interview_123",
    });

    mocks.createActivity.mockResolvedValue({
      id: "activity_123",
    });

    mocks.transaction.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects unauthenticated requests before accessing the database", async () => {
    mocks.auth.mockResolvedValue({
      userId: null,
    });

    const result = await manageInterview(
      "interview_123",
      initialState,
      makeFormData({
        intent: "cancel",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: "You must be signed in to manage an interview.",
    });

    expect(mocks.findInterview).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects unsupported interview actions", async () => {
    const result = await manageInterview(
      "interview_123",
      initialState,
      makeFormData({
        intent: "delete-forever",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: "Invalid interview action.",
    });

    expect(mocks.findInterview).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("only finds an interview belonging to an active application owned by the authenticated user", async () => {
    mocks.findInterview.mockResolvedValue(null);

    const result = await manageInterview(
      "interview_123",
      initialState,
      makeFormData({
        intent: "cancel",
      }),
    );

    expect(mocks.findInterview).toHaveBeenCalledWith({
      where: {
        id: "interview_123",
        type: "INTERVIEW",
        application: {
          ownerId: "user_123",
          archivedAt: null,
        },
      },
      select: {
        id: true,
        applicationId: true,
        title: true,
      },
    });

    expect(result).toEqual({
      status: "error",
      message: "The interview could not be found.",
    });

    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("cancels an interview and records cancellation history", async () => {
    const result = await manageInterview(
      "interview_123",
      initialState,
      makeFormData({
        intent: "cancel",
      }),
    );

    expect(mocks.deleteActivity).toHaveBeenCalledWith({
      where: {
        id: "interview_123",
      },
    });

    expect(mocks.createActivity).toHaveBeenCalledWith({
      data: {
        applicationId: "application_123",
        type: "OTHER",
        title: "Interview cancelled",
        description: "Technical Interview was cancelled.",
      },
    });

    expect(mocks.transaction).toHaveBeenCalledTimes(1);

    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/dashboard",
    );

    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/applications/application_123",
    );

    expect(result).toEqual({
      status: "success",
      message: "Interview cancelled.",
    });
  });

  it("rejects a reschedule request without a new date and time", async () => {
    const result = await manageInterview(
      "interview_123",
      initialState,
      makeFormData({
        intent: "reschedule",
        occurredAt: "",
      }),
    );

    expect(result.status).toBe("error");

    expect(result.fieldErrors?.occurredAt).toContain(
      "Choose a new interview date and time.",
    );

    expect(mocks.updateActivity).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects a reschedule date in the past", async () => {
    const result = await manageInterview(
      "interview_123",
      initialState,
      makeFormData({
        intent: "reschedule",
        occurredAt: "2026-08-11T18:00:00.000Z",
      }),
    );

    expect(result.status).toBe("error");

    expect(result.fieldErrors?.occurredAt).toContain(
      "Choose a future interview date and time.",
    );

    expect(mocks.updateActivity).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects rescheduling onto another interview at the exact same time", async () => {
    const newInterviewDate = new Date(
      "2026-08-25T19:30:00.000Z",
    );

    mocks.findInterview
      .mockResolvedValueOnce(existingInterview)
      .mockResolvedValueOnce({
        title: "Hiring Manager Interview",
        application: {
          companyName: "Northstar Labs",
          roleTitle: "Frontend Engineer",
        },
      });

    const result = await manageInterview(
      "interview_123",
      initialState,
      makeFormData({
        intent: "reschedule",
        occurredAt: newInterviewDate.toISOString(),
      }),
    );

    expect(mocks.findInterview).toHaveBeenNthCalledWith(
      2,
      {
        where: {
          id: {
            not: "interview_123",
          },
          type: "INTERVIEW",
          occurredAt: newInterviewDate,
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
      },
    );

    expect(result.status).toBe("error");

    expect(result.message).toBe(
      "You already have an interview scheduled at that time.",
    );

    expect(result.fieldErrors?.occurredAt?.[0]).toContain(
      "Hiring Manager Interview",
    );

    expect(result.fieldErrors?.occurredAt?.[0]).toContain(
      "Northstar Labs",
    );

    expect(mocks.updateActivity).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("reschedules an interview and records activity history", async () => {
    const newInterviewDate = new Date(
      "2026-08-25T19:30:00.000Z",
    );

    mocks.findInterview
      .mockResolvedValueOnce(existingInterview)
      .mockResolvedValueOnce(null);

    const result = await manageInterview(
      "interview_123",
      initialState,
      makeFormData({
        intent: "reschedule",
        occurredAt: newInterviewDate.toISOString(),
      }),
    );

    expect(mocks.updateActivity).toHaveBeenCalledWith({
      where: {
        id: "interview_123",
      },
      data: {
        occurredAt: newInterviewDate,
      },
    });

    expect(mocks.createActivity).toHaveBeenCalledWith({
      data: {
        applicationId: "application_123",
        type: "OTHER",
        title: "Interview rescheduled",
        description: "Technical Interview was rescheduled.",
      },
    });

    expect(mocks.transaction).toHaveBeenCalledTimes(1);

    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/dashboard",
    );

    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/applications/application_123",
    );

    expect(result).toEqual({
      status: "success",
      message: "Interview rescheduled.",
    });
  });

  it("returns a safe error when a reschedule transaction fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mocks.findInterview
      .mockResolvedValueOnce(existingInterview)
      .mockResolvedValueOnce(null);

    mocks.transaction.mockRejectedValue(
      new Error("Database unavailable"),
    );

    const result = await manageInterview(
      "interview_123",
      initialState,
      makeFormData({
        intent: "reschedule",
        occurredAt: "2026-08-25T19:30:00.000Z",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message:
        "The interview could not be rescheduled. Please try again in a moment.",
    });

    expect(consoleError).toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});