"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@prisma/client";

interface Props {
  user: User & { empresa?: { nome: string; logoUrl?: string | null } | null };
  googleImage?: string | null;
}

export default function PerfilClient({ user, googleImage }: Props) {
  const isEmpresa = user.userType === "EMPRESA";

  const [nome, setNome] = useState(user.empresa?.nome ?? user.name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [logoUrl, setLogoUrl] = useState(user.empresa?.logoUrl ?? user.avatarUrl ?? "");
  const [imgError, setImgError] = useState(false);

  // URL efetiva para preview: customizada → foto Google → nada
  const previewSrc = logoUrl || googleImage || "";

  // Ao trocar URL, reseta o erro de imagem
  function handleUrlChange(url: string) {
    setLogoUrl(url);
    setImgError(false);
  }

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
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
        {isEmpresa ? "Perfil da Empresa" : "Meu Perfil"}
      </h1>

      <div className="border border-border rounded-xl p-4 sm:p-6 space-y-4">
        {/* Preview da imagem */}
        <div className="flex justify-center">
          {previewSrc && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={previewSrc}
              src={previewSrc}
              alt={isEmpresa ? "Logo" : "Avatar"}
              width={80}
              height={80}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="rounded-full w-20 h-20 object-cover border border-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center text-2xl">
              {isEmpresa ? "🏢" : "👤"}
            </div>
          )}
        </div>

        {isEmpresa ? (
          <>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Nome da empresa
              </label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                URL da logo
              </label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                placeholder="https://i.imgur.com/exemplo.png"
                value={logoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Use uma URL <strong>direta</strong> de imagem (ex: <code className="bg-muted px-1 rounded">https://i.imgur.com/abc123.png</code>).{" "}
                No Imgur: faça upload → clique na imagem → clique em &quot;Copy Link&quot; → use o link que começa com <code className="bg-muted px-1 rounded">i.imgur.com</code>.
                Não use links de álbum (<code className="bg-muted px-1 rounded">imgur.com/a/…</code>) — eles não funcionam como imagem direta.
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Nome de usuário
              </label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                placeholder="meu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Apenas letras minúsculas, números e _
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                URL do avatar
              </label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                placeholder="https://i.imgur.com/exemplo.png"
                value={logoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Use uma URL <strong>direta</strong> de imagem (ex: <code className="bg-muted px-1 rounded">https://i.imgur.com/abc123.png</code>).{" "}
                No Imgur: faça upload → clique na imagem → clique em &quot;Copy Link&quot; → use o link que começa com <code className="bg-muted px-1 rounded">i.imgur.com</code>.
                Não use links de álbum (<code className="bg-muted px-1 rounded">imgur.com/a/…</code>).
              </p>
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
