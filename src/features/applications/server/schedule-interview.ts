"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import type { ScheduleInterviewActionState } from "@/features/applications/types/schedule-interview-action-state";
import { prisma } from "@/lib/prisma";

export async function scheduleInterview(
  applicationId: string,
  _previousState: ScheduleInterviewActionState,
  formData: FormData,
): Promise<ScheduleInterviewActionState> {
  const { userId } = await auth();

  if (!userId) {
    return {
      status: "error",
      message: "You must be signed in to schedule an interview.",
    };
  }

  const titleValue = formData.get("title");
  const occurredAtValue = formData.get("occurredAt");
  const descriptionValue = formData.get("description");

  const fieldErrors: ScheduleInterviewActionState["fieldErrors"] = {};

  const title =
    typeof titleValue === "string" ? titleValue.trim() : "";

  const description =
    typeof descriptionValue === "string"
      ? descriptionValue.trim()
      : "";

  if (!title) {
    fieldErrors.title = ["Interview type is required."];
  } else if (title.length > 160) {
    fieldErrors.title = [
      "Interview type must be 160 characters or fewer.",
    ];
  }

  let occurredAt: Date | null = null;

  if (
    typeof occurredAtValue !== "string" ||
    occurredAtValue.trim() === ""
  ) {
    fieldErrors.occurredAt = [
      "Interview date and time are required.",
    ];
  } else {
    occurredAt = new Date(occurredAtValue);

    if (Number.isNaN(occurredAt.getTime())) {
      fieldErrors.occurredAt = [
        "Enter a valid interview date and time.",
      ];

      occurredAt = null;
    } else if (occurredAt <= new Date()) {
      fieldErrors.occurredAt = [
        "Choose a future interview date and time.",
      ];
    }
  }

  if (description.length > 2000) {
    fieldErrors.description = [
      "Interview notes must be 2,000 characters or fewer.",
    ];
  }

  if (Object.keys(fieldErrors).length > 0 || !occurredAt) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ownerId: userId,
      archivedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!application) {
    return {
      status: "error",
      message: "The application could not be found.",
    };
  }

  const conflictingInterview =
    await prisma.applicationActivity.findFirst({
      where: {
        type: "INTERVIEW",
        occurredAt,
        application: {
          ownerId: userId,
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

  if (conflictingInterview) {
    return {
      status: "error",
      message: "You already have an interview scheduled at that time.",
      fieldErrors: {
        occurredAt: [
          `${conflictingInterview.title ?? "Interview"} for ${
            conflictingInterview.application.roleTitle
          } at ${
            conflictingInterview.application.companyName
          } is already scheduled for that exact time.`,
        ],
      },
    };
  }

  try {
    await prisma.applicationActivity.create({
      data: {
        applicationId: application.id,
        type: "INTERVIEW",
        title,
        description: description || null,
        occurredAt,
      },
    });
  } catch (error) {
    console.error("Failed to schedule interview:", error);

    return {
      status: "error",
      message:
        "The interview could not be scheduled. Please try again in a moment.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/applications/${application.id}`);

  return {
    status: "success",
    message: "Interview scheduled.",
  };
}