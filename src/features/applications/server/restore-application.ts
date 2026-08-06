"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function restoreApplication(applicationId: string) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ownerId: userId,
      archivedAt: {
        not: null,
      },
    },
    select: {
      id: true,
    },
  });

  if (!application) {
    redirect("/applications/archived");
  }

  await prisma.$transaction([
    prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        archivedAt: null,
      },
    }),

    prisma.applicationActivity.create({
      data: {
        applicationId: application.id,
        type: "OTHER",
        title: "Application restored",
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/applications/archived");
  revalidatePath(`/applications/${application.id}`);

  redirect(`/applications/${application.id}`);
}