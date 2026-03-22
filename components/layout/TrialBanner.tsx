import Link from "next/link";
import { isTrialActive, daysLeftInTrial, isSubscribed } from "@/lib/subscription";
import type { User } from "@prisma/client";

interface TrialBannerProps {
  user: Pick<User, "plan" | "trialEndsAt" | "stripeCurrentPeriodEnd">;
}

export default function TrialBanner({ user }: TrialBannerProps) {
  if (isSubscribed(user)) return null;
  if (!isTrialActive(user)) return null;

  const days = daysLeftInTrial(user);

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-6 py-2 flex items-center justify-between text-sm">
      <span className="text-primary font-medium">
        {days === 0
          ? "⚠️ Seu trial expira hoje!"
          : `⏳ ${days} dia${days > 1 ? "s" : ""} restante${days > 1 ? "s" : ""} no trial`}
      </span>
      <Link href="/settings/billing" className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full hover:opacity-90 transition-opacity">
        Assinar PRO
      </Link>
    </div>
  );
}
