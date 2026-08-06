"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function archiveApplication(applicationId:string) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
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
    redirect("/dashboard");
  }

  await prisma.$transaction([
    prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        archivedAt: new Date(),
      },
    }),

    prisma.applicationActivity.create({
      data: {
        applicationId: application.id,
        type: "OTHER",
        title: "Application archived",
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath(`/applications/${application.id}`);

  redirect("/dashboard");
}