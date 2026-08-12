import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ApplicationActionState } from "@/features/applications/types/application-action-state";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  createApplication: vi.fn(),
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
      create: mocks.createApplication,
    },
  },
}));

import { createApplication } from "./create-application";

const initialState: ApplicationActionState = {
  status: "idle",
};

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("createApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.auth.mockResolvedValue({
      userId: "user_123",
    });

    mocks.createApplication.mockResolvedValue({
      id: "application_123",
    });
  });

  it("rejects unauthenticated requests before accessing the database", async () => {
    mocks.auth.mockResolvedValue({
      userId: null,
    });

    const result = await createApplication(
      initialState,
      makeFormData({
        companyName: "OpenAI",
        roleTitle: "Software Engineer",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: "You must be signed in to create an application.",
    });

    expect(mocks.createApplication).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("returns validation errors without accessing the database", async () => {
    const result = await createApplication(
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

    expect(mocks.createApplication).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("creates a normalized application owned by the authenticated user", async () => {
    const formData = makeFormData({
      companyName: "  OpenAI  ",
      roleTitle: "Software Engineer",
      ownerId: "attacker_controlled_user",
      salaryMin: "100000",
      salaryMax: "150000",
      salaryCurrency: "usd",
      workArrangement: "REMOTE",
      status: "APPLIED",
      appliedAt: "2026-08-12",
    });

    await createApplication(initialState, formData);

    expect(mocks.createApplication).toHaveBeenCalledTimes(1);

    expect(mocks.createApplication).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: "user_123",
        companyName: "OpenAI",
        roleTitle: "Software Engineer",
        salaryMin: 100000,
        salaryMax: 150000,
        salaryCurrency: "USD",
        workArrangement: "REMOTE",
        status: "APPLIED",
        appliedAt: new Date("2026-08-12"),
      }),
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("returns a safe error when Prisma cannot create the application", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mocks.createApplication.mockRejectedValue(
      new Error("Database unavailable"),
    );

    const result = await createApplication(
      initialState,
      makeFormData({
        companyName: "OpenAI",
        roleTitle: "Software Engineer",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message:
        "The application could not be saved. Please try again in a moment.",
    });

    expect(consoleError).toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
