"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import type { User } from "@prisma/client";

interface Props {
  user: User & { empresa?: { nome: string; logoUrl?: string | null } | null };
}

export default function PerfilClient({ user }: Props) {
  const isEmpresa = user.userType === "EMPRESA";

  const [nome, setNome] = useState(user.empresa?.nome ?? user.name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [logoUrl, setLogoUrl] = useState(user.empresa?.logoUrl ?? user.avatarUrl ?? "");

  const updateMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isEmpresa ? "/api/empresa/perfil" : "/api/user/perfil";
      const body = isEmpresa ? { nome, logoUrl } : { username, avatarUrl: logoUrl };
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => toast.success("Perfil atualizado!"),
    onError: (e) => toast.error(e.message ?? "Erro ao atualizar perfil"),
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {isEmpresa ? "Perfil da Empresa" : "Meu Perfil"}
      </h1>

      <div className="border border-border rounded-xl p-6 space-y-4">
        {(logoUrl) && (
          <div className="flex justify-center">
            <Image src={logoUrl} alt="Logo" width={80} height={80} className="rounded-full w-20 h-20 object-cover" />
          </div>
        )}

        {isEmpresa ? (
          <>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome da empresa</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={nome} onChange={e => setNome(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">URL da logo</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="https://..." value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome de usuário</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="meu_usuario" value={username} onChange={e => setUsername(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Apenas letras minúsculas, números e _</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">URL do avatar</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="https://..." value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
            </div>
          </>
        )}

        <button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {updateMutation.isPending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
