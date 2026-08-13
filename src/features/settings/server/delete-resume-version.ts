"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function deleteResumeVersion(
  formData: FormData,
) {
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  const resumeVersionId =
    formData.get("resumeVersionId");

  if (
    typeof resumeVersionId !== "string" ||
    !resumeVersionId
  ) {
    return;
  }

  await prisma.resumeVersion.deleteMany({
    where: {
      id: resumeVersionId,
      ownerId: userId,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/applications/new");
}