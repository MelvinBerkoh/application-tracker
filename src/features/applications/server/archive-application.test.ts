import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirectToSignIn: vi.fn(),
  findApplication: vi.fn(),
  updateApplication: vi.fn(),
  createActivity: vi.fn(),
  transaction: vi.fn(),
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
      update: mocks.updateApplication,
    },
    applicationActivity: {
      create: mocks.createActivity,
    },
    $transaction: mocks.transaction,
  },
}));

import { archiveApplication } from "./archive-application";

describe("archiveApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockReset();

    mocks.auth.mockResolvedValue({
      userId: "user_123",
      redirectToSignIn: mocks.redirectToSignIn,
    });

    mocks.redirectToSignIn.mockReturnValue("redirect-to-sign-in");

    mocks.findApplication.mockResolvedValue({
      id: "application_123",
    });

    mocks.updateApplication.mockResolvedValue({
      id: "application_123",
    });

    mocks.createActivity.mockResolvedValue({
      id: "activity_123",
    });

    mocks.transaction.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("redirects unauthenticated users to sign in before accessing the database", async () => {
    mocks.auth.mockResolvedValue({
      userId: null,
      redirectToSignIn: mocks.redirectToSignIn,
    });

    const result = await archiveApplication("application_123");

    expect(mocks.redirectToSignIn).toHaveBeenCalledTimes(1);
    expect(result).toBe("redirect-to-sign-in");

    expect(mocks.findApplication).not.toHaveBeenCalled();
    expect(mocks.updateApplication).not.toHaveBeenCalled();
    expect(mocks.createActivity).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("only finds an active application owned by the authenticated user", async () => {
    mocks.findApplication.mockResolvedValue(null);

    const redirectError = new Error("NEXT_REDIRECT");

    mocks.redirect.mockImplementation(() => {
      throw redirectError;
    });

    await expect(
      archiveApplication("application_123"),
    ).rejects.toThrow(redirectError);

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

    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");

    expect(mocks.updateApplication).not.toHaveBeenCalled();
    expect(mocks.createActivity).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("archives the application and records activity history", async () => {
    vi.useFakeTimers();

    const archivedAt = new Date("2026-08-12T20:00:00.000Z");
    vi.setSystemTime(archivedAt);

    await archiveApplication("application_123");

    expect(mocks.updateApplication).toHaveBeenCalledWith({
      where: {
        id: "application_123",
      },
      data: {
        archivedAt,
      },
    });

    expect(mocks.createActivity).toHaveBeenCalledWith({
      data: {
        applicationId: "application_123",
        type: "OTHER",
        title: "Application archived",
      },
    });

    expect(mocks.transaction).toHaveBeenCalledTimes(1);

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/applications/application_123",
    );

    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("does not revalidate or redirect when the transaction fails", async () => {
    mocks.transaction.mockRejectedValue(
      new Error("Database unavailable"),
    );

    await expect(
      archiveApplication("application_123"),
    ).rejects.toThrow("Database unavailable");

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});