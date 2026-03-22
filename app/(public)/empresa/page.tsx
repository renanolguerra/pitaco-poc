import Link from "next/link";

export default function EmpresaLandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-foreground">Pitaco</Link>
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Cadastre-se
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-6">
          Seu roadmap, com o<br />
          <span className="text-primary">feedback certo</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Publique seu roadmap de produto e receba feedback real dos seus usuários.
          Tome decisões baseadas em dados, não em achismos.
        </p>
        <Link href="/login" className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity">
          Começar grátis — 14 dias de trial
        </Link>
      </section>

      {/* Features */}
      <section className="bg-secondary py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-16">Por que o Pitaco?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "📋", title: "Kanban & Gantt", desc: "Visualize seu roadmap em Kanban ou Gantt. Sincronizados em tempo real." },
              { icon: "💬", title: "Feedback qualificado", desc: "Seus usuários curtem, criticam e comentam. Você vê o que realmente importa." },
              { icon: "📊", title: "Painel de insights", desc: "Veja likes, dislikes e comentários por feature. Priorize com dados." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-foreground mb-16">Planos</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="border border-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-foreground mb-2">Gratuito</h3>
            <p className="text-4xl font-bold text-foreground mb-1">R$0</p>
            <p className="text-muted-foreground text-sm mb-8">para sempre</p>
            <ul className="space-y-3 mb-8 text-sm">
              {["1 roadmap", "Features ilimitadas", "Comentários ilimitados"].map(f => (
                <li key={f} className="flex gap-2"><span className="text-status-done">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/login" className="block text-center py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors">
              Começar grátis
            </Link>
          </div>
          <div className="border-2 border-primary rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              MAIS POPULAR
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">PRO</h3>
            <p className="text-4xl font-bold text-foreground mb-1">R$49</p>
            <p className="text-muted-foreground text-sm mb-8">/mês</p>
            <ul className="space-y-3 mb-8 text-sm">
              {["Roadmaps ilimitados", "Features ilimitadas", "Comentários ilimitados", "Suporte prioritário"].map(f => (
                <li key={f} className="flex gap-2"><span className="text-status-done">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/login" className="block text-center py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Assinar PRO
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2025 Pitaco — Todos os direitos reservados
      </footer>
    </main>
  );
}
