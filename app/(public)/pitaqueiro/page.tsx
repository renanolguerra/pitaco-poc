import Link from "next/link";

export default function PitaqueiroLandingPage() {
  return (
    <main className="min-h-screen bg-white">
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

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-6">
          Sua opinião<br />
          <span className="text-primary">importa de verdade</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Acompanhe os roadmaps das empresas que você usa. Dê seu pitaco nas features, vote nos comentários e ajude a moldar o futuro dos produtos.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity">
            Cadastre-se — é grátis
          </Link>
          <Link href="/login" className="px-8 py-4 border border-border rounded-xl font-semibold text-lg hover:bg-secondary transition-colors">
            Já tenho conta
          </Link>
        </div>
      </section>

      <section className="bg-secondary py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-16">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🔍", step: "1", title: "Encontre empresas", desc: "Pesquise as empresas que você usa no dia a dia e veja o que elas estão construindo." },
              { icon: "👁️", step: "2", title: "Veja o roadmap", desc: "Explore as features planejadas, em andamento e concluídas no Kanban ou Gantt." },
              { icon: "💬", step: "3", title: "Dê seu pitaco", desc: "Curta, critique e comente nas features. Seu feedback vai direto para quem decide." },
            ].map((f) => (
              <div key={f.step} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-2">{f.icon}</div>
                <div className="text-xs font-bold text-primary mb-1">PASSO {f.step}</div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2025 Pitaco — Todos os direitos reservados
      </footer>
    </main>
  );
}
