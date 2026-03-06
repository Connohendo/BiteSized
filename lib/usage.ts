import { prisma } from "@/lib/db";

function todayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function ensureUserAndSubscription(
  userId: string,
  email: string,
  name?: string | null
): Promise<void> {
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      name: name ?? null,
    },
    update: {
      email,
      ...(name !== undefined && { name: name ?? null }),
    },
  });
  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan: "free" },
    update: {},
  });
}

export async function incrementProcess(userId: string): Promise<void> {
  const date = todayUTC();
  await prisma.usage.upsert({
    where: {
      userId_date: { userId, date },
    },
    create: {
      userId,
      date,
      processCount: 1,
      compareCount: 0,
    },
    update: {
      processCount: { increment: 1 },
    },
  });
}

export async function incrementCompare(userId: string): Promise<void> {
  const date = todayUTC();
  await prisma.usage.upsert({
    where: {
      userId_date: { userId, date },
    },
    create: {
      userId,
      date,
      processCount: 0,
      compareCount: 1,
    },
    update: {
      compareCount: { increment: 1 },
    },
  });
}
