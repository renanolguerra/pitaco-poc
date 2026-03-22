"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isSubscribed, isTrialActive, daysLeftInTrial } from "@/lib/subscription";
import type { User } from "@prisma/client";

interface Props { user: User; }

export default function BillingClient({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const subscribed = isSubscribed(user);
  const trialActive = isTrialActive(user);
  const days = daysLeftInTrial(user);

  const periodEndDate = user.stripeCurrentPeriodEnd
    ? new Date(user.stripeCurrentPeriodEnd)
    : null;
  const daysUntilEnd = periodEndDate
    ? Math.max(0, Math.ceil((periodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { toast.error("Erro ao iniciar checkout"); setLoading(false); }
  }

  async function handleCancel() {
    setCancelling(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { toast.error("Erro ao abrir portal"); setCancelling(false); }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Botão voltar */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-6">Plano e Cobrança</h1>

      {/* ─────────────────────────────────────────
          Estado PRO: assinante ativo
      ───────────────────────────────────────── */}
      {subscribed && (
        <div className="border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Plano PRO</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
              PRO
            </span>
          </div>
          {periodEndDate && (
            <p className="text-sm text-muted-foreground mb-6">
              Próxima renovação em {periodEndDate.toLocaleDateString("pt-BR")}
            </p>
          )}
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full py-3 border border-destructive text-destructive rounded-lg font-medium hover:bg-destructive/5 transition-colors"
          >
            Cancelar assinatura
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────
          Estado TRIAL ou FREE
      ───────────────────────────────────────── */}
      {!subscribed && (
        <>
          {/* Badge de trial ativo */}
          {trialActive && (
            <div className="border border-border rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Trial Gratuito</h2>
                <p className="text-sm text-muted-foreground">
                  {days} dia{days !== 1 ? "s" : ""} restante{days !== 1 ? "s" : ""}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                TRIAL
              </span>
            </div>
          )}

          {/* Cards de plano — empilhados no mobile, lado a lado no desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card Gratuito */}
            <div
              className={`border rounded-xl p-6 ${
                !trialActive ? "border-primary ring-1 ring-primary" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-foreground text-lg">Gratuito</h3>
                {!trialActive && (
                  <span className="px-2 py-0.5 rounded text-xs bg-secondary text-muted-foreground font-medium">
                    Atual
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-foreground mb-0.5">R$0</div>
              <div className="text-xs text-muted-foreground mb-5">para sempre</div>
              <ul className="space-y-2 mb-6 text-sm text-foreground">
                <li>✓ 1 roadmap</li>
                <li>✓ Features ilimitadas</li>
                <li>✓ Comentários ilimitados</li>
              </ul>
              <button
                disabled={!trialActive}
                onClick={() =>
                  trialActive
                    ? toast.info("Plano gratuito ativado ao fim do trial")
                    : undefined
                }
                className="w-full py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-60 disabled:cursor-default"
              >
                Começar grátis
              </button>
            </div>

            {/* Card PRO — destacado */}
            <div className="border-2 border-primary rounded-xl p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                MAIS POPULAR
              </span>
              <h3 className="font-bold text-foreground text-lg mb-0.5">PRO</h3>
              <div className="text-2xl font-bold text-foreground mb-0.5">R$49</div>
              <div className="text-xs text-muted-foreground mb-5">/ mês</div>
              <ul className="space-y-2 mb-6 text-sm text-foreground">
                <li>✓ Roadmaps ilimitados</li>
                <li>✓ Features ilimitadas</li>
                <li>✓ Comentários ilimitados</li>
                <li>✓ Suporte prioritário</li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Aguarde..." : "Assinar PRO"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────
          Modal de confirmação de cancelamento
          Em mobile: bottom sheet (items-end)
          Em desktop: centralizado (sm:items-center)
      ───────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground mb-3">
              Cancelar assinatura?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Você ainda terá acesso ao plano PRO por{" "}
              <span className="font-semibold text-foreground">{daysUntilEnd} dia{daysUntilEnd !== 1 ? "s" : ""}</span>
              {periodEndDate && (
                <>, até {periodEndDate.toLocaleDateString("pt-BR")}</>
              )}
              . Após essa data, sua conta voltará para o plano Gratuito (máximo 1 roadmap).
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
              >
                Manter assinatura
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-3 bg-destructive text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {cancelling ? "Aguarde..." : "Sim, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
