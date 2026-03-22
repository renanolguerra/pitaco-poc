import type { User } from "@prisma/client";

export function isTrialActive(user: Pick<User, "plan" | "trialEndsAt">): boolean {
  if (user.plan !== "TRIAL") return false;
  if (!user.trialEndsAt) return false;
  return user.trialEndsAt > new Date();
}

export function isSubscribed(user: Pick<User, "plan" | "stripeCurrentPeriodEnd">): boolean {
  if (user.plan !== "PRO") return false;
  if (!user.stripeCurrentPeriodEnd) return false;
  return user.stripeCurrentPeriodEnd > new Date();
}

export function hasAccess(user: Pick<User, "plan" | "trialEndsAt" | "stripeCurrentPeriodEnd">): boolean {
  return isTrialActive(user) || isSubscribed(user);
}

export function daysLeftInTrial(user: Pick<User, "trialEndsAt">): number {
  if (!user.trialEndsAt) return 0;
  const diff = user.trialEndsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export const PLAN_LIMITS = {
  FREE: { roadmaps: 1 },
  TRIAL: { roadmaps: Infinity },
  PRO: { roadmaps: Infinity },
} as const;
