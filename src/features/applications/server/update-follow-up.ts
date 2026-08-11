"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function updateFollowUp(
  applicationId: string,
  formData: FormData,
) {
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  const intent = formData.get("intent");
  const followUpAtValue = formData.get("followUpAt");

  if (intent !== "reschedule" && intent !== "clear") {
    return;
  }

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ownerId: userId,
      archivedAt: null,
    },
    select: {
      id: true,
      followUpAt: true,
    },
  });

  if (!application) {
    return;
  }

  let followUpAt: Date | null = null;

  if (intent === "reschedule") {
    if (
      typeof followUpAtValue !== "string" ||
      followUpAtValue.trim() === ""
    ) {
      return;
    }

    followUpAt = new Date(`${followUpAtValue}T00:00:00.000Z`);

    if (Number.isNaN(followUpAt.getTime())) {
      return;
    }
  }

  await prisma.$transaction([
    prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        followUpAt,
      },
    }),

    prisma.applicationActivity.create({
      data: {
        applicationId: application.id,
        type: "FOLLOW_UP",
        title:
          intent === "clear"
            ? "Follow-up cleared"
            : "Follow-up rescheduled",
        description:
          intent === "clear"
            ? "The scheduled follow-up date was removed."
            : `Follow-up scheduled for ${followUpAt?.toISOString().slice(0, 10)}.`,
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath("/applications/follow-ups");
  revalidatePath(`/applications/${application.id}`);
}