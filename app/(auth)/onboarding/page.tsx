"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function selectType(type: "EMPRESA" | "PITAQUEIRO") {
    setLoading(type);
    const res = await fetch("/api/user/type", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userType: type }),
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error("Erro ao salvar. Tente novamente.");
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Bem-vindo ao Pitaco!</h1>
        <p className="text-muted-foreground mb-10">Como você vai usar a plataforma?</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => selectType("EMPRESA")}
            disabled={loading !== null}
            className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-blue-50 transition-all disabled:opacity-50 text-left"
          >
            <div className="text-3xl mb-3">🏢</div>
            <div className="font-semibold text-foreground">Empresa</div>
            <div className="text-xs text-muted-foreground mt-1">Publico roadmaps e recebo feedback</div>
          </button>
          <button
            onClick={() => selectType("PITAQUEIRO")}
            disabled={loading !== null}
            className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-blue-50 transition-all disabled:opacity-50 text-left"
          >
            <div className="text-3xl mb-3">💬</div>
            <div className="font-semibold text-foreground">Pitaqueiro</div>
            <div className="text-xs text-muted-foreground mt-1">Acompanho roadmaps e dou feedback</div>
          </button>
        </div>
      </div>
    </main>
  );
}
