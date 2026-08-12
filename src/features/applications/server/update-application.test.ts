import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ApplicationActionState } from "@/features/applications/types/application-action-state";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findApplication: vi.fn(),
  transaction: vi.fn(),
  updateApplication: vi.fn(),
  createActivity: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.auth,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      findFirst: mocks.findApplication,
    },
    $transaction: mocks.transaction,
  },
}));

import { updateApplication } from "./update-application";

const initialState: ApplicationActionState = {
  status: "idle",
};

const transactionClient = {
  application: {
    update: mocks.updateApplication,
  },
  applicationActivity: {
    create: mocks.createActivity,
  },
};

type TransactionCallback = (
  transaction: typeof transactionClient,
) => Promise<unknown>;

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("updateApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.auth.mockResolvedValue({
      userId: "user_123",
    });

    mocks.findApplication.mockResolvedValue({
      id: "application_123",
      status: "APPLIED",
    });

    mocks.updateApplication.mockResolvedValue({
      id: "application_123",
    });

    mocks.createActivity.mockResolvedValue({
      id: "activity_123",
    });

    mocks.transaction.mockImplementation(
      async (callback: TransactionCallback) =>
        callback(transactionClient),
    );
  });

  it("rejects unauthenticated requests before accessing the database", async () => {
    mocks.auth.mockResolvedValue({
      userId: null,
    });

    const result = await updateApplication(
      "application_123",
      initialState,
      makeFormData({
        companyName: "OpenAI",
        roleTitle: "Software Engineer",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: "You must be signed in to update an application.",
    });

    expect(mocks.findApplication).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("returns validation errors before accessing the database", async () => {
    const result = await updateApplication(
      "application_123",
      initialState,
      makeFormData({
        companyName: "",
        roleTitle: "Software Engineer",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe(
      "Please correct the highlighted fields.",
    );

    expect(result.fieldErrors?.companyName).toContain(
      "Company name is required.",
    );

    expect(mocks.findApplication).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("only finds an active application owned by the authenticated user", async () => {
    mocks.findApplication.mockResolvedValue(null);

    const result = await updateApplication(
      "application_123",
      initialState,
      makeFormData({
        companyName: "OpenAI",
        roleTitle: "Software Engineer",
        status: "APPLIED",
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
        status: true,
      },
    });

    expect(result).toEqual({
      status: "error",
      message: "This application could not be found.",
    });

    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("updates normalized application data without creating status activity when the status is unchanged", async () => {
    await updateApplication(
      "application_123",
      initialState,
      makeFormData({
        companyName: "  OpenAI  ",
        roleTitle: "Software Engineer",
        location: "",
        jobUrl: "",
        salaryMin: "100000",
        salaryMax: "150000",
        salaryCurrency: "usd",
        status: "APPLIED",
        appliedAt: "2026-08-12",
      }),
    );

    expect(mocks.transaction).toHaveBeenCalledTimes(1);

    expect(mocks.updateApplication).toHaveBeenCalledWith({
      where: {
        id: "application_123",
      },
      data: expect.objectContaining({
        companyName: "OpenAI",
        roleTitle: "Software Engineer",
        location: null,
        jobUrl: null,
        salaryMin: 100000,
        salaryMax: 150000,
        salaryCurrency: "USD",
        status: "APPLIED",
        appliedAt: new Date("2026-08-12"),
        followUpAt: null,
      }),
    });

    expect(mocks.createActivity).not.toHaveBeenCalled();

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/applications/application_123",
    );

    expect(mocks.redirect).toHaveBeenCalledWith(
      "/applications/application_123",
    );
  });

  it("creates activity history when the application status changes", async () => {
    mocks.findApplication.mockResolvedValue({
      id: "application_123",
      status: "SAVED",
    });

    await updateApplication(
      "application_123",
      initialState,
      makeFormData({
        companyName: "OpenAI",
        roleTitle: "Software Engineer",
        status: "INTERVIEW",
      }),
    );

    expect(mocks.updateApplication).toHaveBeenCalledTimes(1);

    expect(mocks.createActivity).toHaveBeenCalledTimes(1);

    expect(mocks.createActivity).toHaveBeenCalledWith({
      data: {
        applicationId: "application_123",
        type: "STATUS_CHANGE",
        title: "Application status changed",
        fromStatus: "SAVED",
        toStatus: "INTERVIEW",
      },
    });

    expect(mocks.redirect).toHaveBeenCalledWith(
      "/applications/application_123",
    );
  });

  it("returns a safe error when the transaction fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mocks.transaction.mockRejectedValue(
      new Error("Database unavailable"),
    );

    const result = await updateApplication(
      "application_123",
      initialState,
      makeFormData({
        companyName: "OpenAI",
        roleTitle: "Software Engineer",
        status: "APPLIED",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message:
        "The application could not be updated. Please try again in a moment.",
    });

    expect(consoleError).toHaveBeenCalled();

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});