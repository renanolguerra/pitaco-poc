"use client";

import { useState } from "react";
import { toast } from "sonner";
import { isSubscribed, isTrialActive, daysLeftInTrial } from "@/lib/subscription";
import type { User } from "@prisma/client";

interface Props { user: User; }

export default function BillingClient({ user }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { toast.error("Erro ao iniciar checkout"); setLoading(false); }
  }

  async function handlePortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { toast.error("Erro ao abrir portal"); setLoading(false); }
  }

  const subscribed = isSubscribed(user);
  const trialActive = isTrialActive(user);
  const days = daysLeftInTrial(user);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Plano e Cobrança</h1>

      <div className="border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-foreground text-lg">
              {subscribed ? "Plano PRO" : trialActive ? "Trial Gratuito" : "Plano Gratuito"}
            </div>
            <div className="text-sm text-muted-foreground">
              {subscribed && "Acesso ilimitado a todos os recursos"}
              {trialActive && `${days} dia${days !== 1 ? "s" : ""} restante${days !== 1 ? "s" : ""}`}
              {!subscribed && !trialActive && "1 roadmap incluído"}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            subscribed ? "bg-green-100 text-green-700" :
            trialActive ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {subscribed ? "PRO" : trialActive ? "TRIAL" : "FREE"}
          </span>
        </div>

        {!subscribed && (
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Aguarde..." : "Assinar PRO — R$49/mês"}
          </button>
        )}

        {subscribed && (
          <button
            onClick={handlePortal}
            disabled={loading}
            className="w-full py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {loading ? "Aguarde..." : "Gerenciar assinatura"}
          </button>
        )}
      </div>
    </div>
  );
}
