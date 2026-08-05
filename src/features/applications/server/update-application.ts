"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { applicationSchema } from "@/features/applications/schemas/application";
import type { ApplicationActionState } from "@/features/applications/types/application-action-state";
import { prisma } from "@/lib/prisma";

export async function updateApplication(
  applicationId: string,
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const { userId } = await auth();

  if (!userId) {
    return {
      status: "error",
      message: "You must be signed in to update an application.",
    };
  }

  const parsedResult = applicationSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsedResult.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedResult.error.flatten().fieldErrors,
    };
  }

  const existingApplication = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ownerId: userId,
      archivedAt: null,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existingApplication) {
    return {
      status: "error",
      message: "This application could not be found.",
    };
  }

  const data = parsedResult.data;

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.application.update({
        where: {
          id: existingApplication.id,
        },
        data: {
          companyName: data.companyName,
          roleTitle: data.roleTitle,
          jobDescription: data.jobDescription ?? null,
          jobUrl: data.jobUrl ?? null,
          location: data.location ?? null,
          workArrangement: data.workArrangement ?? null,
          salaryMin: data.salaryMin ?? null,
          salaryMax: data.salaryMax ?? null,
          salaryCurrency: data.salaryCurrency,
          source: data.source ?? null,
          resumeVersion: data.resumeVersion ?? null,
          status: data.status,
          appliedAt: data.appliedAt ?? null,
          followUpAt: data.followUpAt ?? null,
          contactName: data.contactName ?? null,
          contactEmail: data.contactEmail ?? null,
          contactLinkedInUrl: data.contactLinkedInUrl ?? null,
          notes: data.notes ?? null,
        },
      });

      if (existingApplication.status !== data.status) {
        await transaction.applicationActivity.create({
          data: {
            applicationId: existingApplication.id,
            type: "STATUS_CHANGE",
            title: "Application status changed",
            fromStatus: existingApplication.status,
            toStatus: data.status,
          },
        });
      }
    });
  } catch (error) {
    console.error("Failed to update application:", error);

    return {
      status: "error",
      message:
        "The application could not be updated. Please try again in a moment.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/applications/${applicationId}`);

  redirect(`/applications/${applicationId}`);
}