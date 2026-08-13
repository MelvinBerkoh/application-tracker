"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import type { ManageInterviewActionState } from "@/features/applications/types/manage-interview-action-state";
import { prisma } from "@/lib/prisma";

export async function manageInterview(
  interviewId: string,
  _previousState: ManageInterviewActionState,
  formData: FormData,
): Promise<ManageInterviewActionState> {
  const { userId } = await auth();

  if (!userId) {
    return {
      status: "error",
      message: "You must be signed in to manage an interview.",
    };
  }

  const intent = formData.get("intent");

  if (intent !== "reschedule" && intent !== "cancel") {
    return {
      status: "error",
      message: "Invalid interview action.",
    };
  }

  const interview = await prisma.applicationActivity.findFirst({
    where: {
      id: interviewId,
      type: "INTERVIEW",
      application: {
        ownerId: userId,
        archivedAt: null,
      },
    },
    select: {
      id: true,
      applicationId: true,
      title: true,
    },
  });

  if (!interview) {
    return {
      status: "error",
      message: "The interview could not be found.",
    };
  }

  if (intent === "cancel") {
    try {
      await prisma.$transaction([
        prisma.applicationActivity.delete({
          where: {
            id: interview.id,
          },
        }),

        prisma.applicationActivity.create({
          data: {
            applicationId: interview.applicationId,
            type: "OTHER",
            title: "Interview cancelled",
            description: interview.title
              ? `${interview.title} was cancelled.`
              : "The scheduled interview was cancelled.",
          },
        }),
      ]);
    } catch (error) {
      console.error("Failed to cancel interview:", error);

      return {
        status: "error",
        message:
          "The interview could not be cancelled. Please try again in a moment.",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/applications/${interview.applicationId}`);

    return {
      status: "success",
      message: "Interview cancelled.",
    };
  }

  const occurredAtValue = formData.get("occurredAt");

  if (
    typeof occurredAtValue !== "string" ||
    occurredAtValue.trim() === ""
  ) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: {
        occurredAt: ["Choose a new interview date and time."],
      },
    };
  }

  const occurredAt = new Date(occurredAtValue);

  if (Number.isNaN(occurredAt.getTime())) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: {
        occurredAt: ["Enter a valid interview date and time."],
      },
    };
  }

  if (occurredAt <= new Date()) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: {
        occurredAt: ["Choose a future interview date and time."],
      },
    };
  }

  const conflictingInterview =
    await prisma.applicationActivity.findFirst({
      where: {
        id: {
          not: interview.id,
        },
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
    await prisma.$transaction([
      prisma.applicationActivity.update({
        where: {
          id: interview.id,
        },
        data: {
          occurredAt,
        },
      }),

      prisma.applicationActivity.create({
        data: {
          applicationId: interview.applicationId,
          type: "OTHER",
          title: "Interview rescheduled",
          description: interview.title
            ? `${interview.title} was rescheduled.`
            : "The interview was rescheduled.",
        },
      }),
    ]);
  } catch (error) {
    console.error("Failed to reschedule interview:", error);

    return {
      status: "error",
      message:
        "The interview could not be rescheduled. Please try again in a moment.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/applications/${interview.applicationId}`);

  return {
    status: "success",
    message: "Interview rescheduled.",
  };
}