import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findApplication: vi.fn(),
  updateApplication: vi.fn(),
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

import { updateFollowUp } from "./update-follow-up";

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("updateFollowUp", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.auth.mockResolvedValue({
      userId: "user_123",
    });

    mocks.findApplication.mockResolvedValue({
      id: "application_123",
      followUpAt: null,
    });

    mocks.updateApplication.mockResolvedValue({
      id: "application_123",
    });

    mocks.createActivity.mockResolvedValue({
      id: "activity_123",
    });

    mocks.transaction.mockResolvedValue([]);
  });

  it("ignores unauthenticated requests before accessing the database", async () => {
    mocks.auth.mockResolvedValue({
      userId: null,
    });

    await updateFollowUp(
      "application_123",
      makeFormData({
        intent: "reschedule",
        followUpAt: "2026-08-20",
      }),
    );

    expect(mocks.findApplication).not.toHaveBeenCalled();
    expect(mocks.updateApplication).not.toHaveBeenCalled();
    expect(mocks.createActivity).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("ignores unsupported follow-up intents", async () => {
    await updateFollowUp(
      "application_123",
      makeFormData({
        intent: "delete",
        followUpAt: "2026-08-20",
      }),
    );

    expect(mocks.findApplication).not.toHaveBeenCalled();
    expect(mocks.updateApplication).not.toHaveBeenCalled();
    expect(mocks.createActivity).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("only finds an active application owned by the authenticated user", async () => {
    mocks.findApplication.mockResolvedValue(null);

    await updateFollowUp(
      "application_123",
      makeFormData({
        intent: "reschedule",
        followUpAt: "2026-08-20",
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
        followUpAt: true,
      },
    });

    expect(mocks.updateApplication).not.toHaveBeenCalled();
    expect(mocks.createActivity).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects a reschedule request without a follow-up date", async () => {
    await updateFollowUp(
      "application_123",
      makeFormData({
        intent: "reschedule",
        followUpAt: "",
      }),
    );

    expect(mocks.findApplication).toHaveBeenCalledTimes(1);
    expect(mocks.updateApplication).not.toHaveBeenCalled();
    expect(mocks.createActivity).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects an invalid follow-up date", async () => {
    await updateFollowUp(
      "application_123",
      makeFormData({
        intent: "reschedule",
        followUpAt: "definitely-not-a-date",
      }),
    );

    expect(mocks.findApplication).toHaveBeenCalledTimes(1);
    expect(mocks.updateApplication).not.toHaveBeenCalled();
    expect(mocks.createActivity).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("reschedules a follow-up and records activity history", async () => {
    await updateFollowUp(
      "application_123",
      makeFormData({
        intent: "reschedule",
        followUpAt: "2026-08-20",
      }),
    );

    const expectedFollowUpDate = new Date(
      "2026-08-20T00:00:00.000Z",
    );

    expect(mocks.updateApplication).toHaveBeenCalledWith({
      where: {
        id: "application_123",
      },
      data: {
        followUpAt: expectedFollowUpDate,
      },
    });

    expect(mocks.createActivity).toHaveBeenCalledWith({
      data: {
        applicationId: "application_123",
        type: "FOLLOW_UP",
        title: "Follow-up rescheduled",
        description: "Follow-up scheduled for 2026-08-20.",
      },
    });

    expect(mocks.transaction).toHaveBeenCalledTimes(1);

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/applications");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/applications/follow-ups",
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/applications/application_123",
    );
  });

  it("clears a follow-up and records activity history", async () => {
    mocks.findApplication.mockResolvedValue({
      id: "application_123",
      followUpAt: new Date("2026-08-20T00:00:00.000Z"),
    });

    await updateFollowUp(
      "application_123",
      makeFormData({
        intent: "clear",
        followUpAt: "2026-08-20",
      }),
    );

    expect(mocks.updateApplication).toHaveBeenCalledWith({
      where: {
        id: "application_123",
      },
      data: {
        followUpAt: null,
      },
    });

    expect(mocks.createActivity).toHaveBeenCalledWith({
      data: {
        applicationId: "application_123",
        type: "FOLLOW_UP",
        title: "Follow-up cleared",
        description: "The scheduled follow-up date was removed.",
      },
    });

    expect(mocks.transaction).toHaveBeenCalledTimes(1);

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/applications");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/applications/follow-ups",
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/applications/application_123",
    );
  });

  it("does not revalidate paths when the transaction fails", async () => {
    mocks.transaction.mockRejectedValue(
      new Error("Database unavailable"),
    );

    await expect(
      updateFollowUp(
        "application_123",
        makeFormData({
          intent: "reschedule",
          followUpAt: "2026-08-20",
        }),
      ),
    ).rejects.toThrow("Database unavailable");

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});