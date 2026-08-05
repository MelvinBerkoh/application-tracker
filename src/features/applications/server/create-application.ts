"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { applicationSchema } from "@/features/applications/schemas/application";
import type { ApplicationActionState } from "@/features/applications/types/application-action-state";
import { prisma } from "@/lib/prisma";

export async function createApplication(
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const { userId } = await auth();

  if (!userId) {
    return {
      status: "error",
      message: "You must be signed in to create an application.",
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

  try {
    await prisma.application.create({
      data: {
        ownerId: userId,
        companyName: parsedResult.data.companyName,
        roleTitle: parsedResult.data.roleTitle,
        jobDescription: parsedResult.data.jobDescription,
        jobUrl: parsedResult.data.jobUrl,
        location: parsedResult.data.location,
        workArrangement: parsedResult.data.workArrangement,
        salaryMin: parsedResult.data.salaryMin,
        salaryMax: parsedResult.data.salaryMax,
        salaryCurrency: parsedResult.data.salaryCurrency,
        source: parsedResult.data.source,
        resumeVersion: parsedResult.data.resumeVersion,
        status: parsedResult.data.status,
        appliedAt: parsedResult.data.appliedAt,
        followUpAt: parsedResult.data.followUpAt,
        contactName: parsedResult.data.contactName,
        contactEmail: parsedResult.data.contactEmail,
        contactLinkedInUrl: parsedResult.data.contactLinkedInUrl,
        notes: parsedResult.data.notes,
      },
    });
  } catch (error) {
    console.error("Failed to create application:", error);

    return {
      status: "error",
      message:
        "The application could not be saved. Please try again in a moment.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}