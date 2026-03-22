import Link from "next/link";

interface PaywallGateProps {
  resource: string;
  children: React.ReactNode;
  blocked: boolean;
}

export default function PaywallGate({ resource, children, blocked }: PaywallGateProps) {
  if (!blocked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-30 select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white border border-border rounded-2xl p-8 shadow-xl text-center max-w-sm mx-4">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            Limite atingido
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Você atingiu o limite de {resource} do plano gratuito. Assine o PRO para ter acesso ilimitado.
          </p>
          <Link
            href="/settings/billing"
            className="block w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Assinar PRO — R$49/mês
          </Link>
        </div>
      </div>
    </div>
  );
}
