"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import type { ResumeVersionActionState } from "@/features/settings/types/resume-version-action-state";
import { prisma } from "@/lib/prisma";

const MAXIMUM_RESUME_VERSIONS = 20;
const MAXIMUM_NAME_LENGTH = 100;

function normalizeName(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ");
}

function isUniqueConstraintError(
  error: unknown,
): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error)
  ) {
    return false;
  }

  return (
    (error as { code?: unknown }).code ===
    "P2002"
  );
}

export async function createResumeVersion(
  _previousState: ResumeVersionActionState,
  formData: FormData,
): Promise<ResumeVersionActionState> {
  const { userId } = await auth();

  if (!userId) {
    return {
      status: "error",
      message:
        "You must be signed in to manage résumé versions.",
    };
  }

  const name = normalizeName(
    formData.get("name"),
  );

  if (!name) {
    return {
      status: "error",
      message:
        "Enter a name for this résumé version.",
      fieldErrors: {
        name: [
          "Résumé version name is required.",
        ],
      },
    };
  }

  if (name.length > MAXIMUM_NAME_LENGTH) {
    return {
      status: "error",
      message:
        "Résumé version names must be 100 characters or fewer.",
      fieldErrors: {
        name: [
          "Use 100 characters or fewer.",
        ],
      },
    };
  }

  const existingCount =
    await prisma.resumeVersion.count({
      where: {
        ownerId: userId,
      },
    });

  if (
    existingCount >=
    MAXIMUM_RESUME_VERSIONS
  ) {
    return {
      status: "error",
      message:
        "You can save up to 20 résumé versions.",
    };
  }

  try {
    await prisma.resumeVersion.create({
      data: {
        ownerId: userId,
        name,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message:
          "You already have a résumé version with that name.",
        fieldErrors: {
          name: [
            "Choose a different résumé version name.",
          ],
        },
      };
    }

    console.error(
      "Failed to create résumé version:",
      error,
    );

    return {
      status: "error",
      message:
        "We could not save that résumé version. Please try again.",
    };
  }

  revalidatePath("/settings");
  revalidatePath("/applications/new");

  return {
    status: "success",
    message: `"${name}" was added.`,
  };
}