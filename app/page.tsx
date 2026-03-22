import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-5xl font-bold text-foreground mb-4">
          Pitaco
        </h1>
        <p className="text-xl text-muted-foreground mb-12">
          Feedback colaborativo em roadmaps de produto
        </p>

        <p className="text-lg font-medium text-foreground mb-8">
          Quem é você?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/empresa"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            🏢 Sou uma Empresa
          </Link>
          <Link
            href="/pitaqueiro"
            className="px-8 py-4 bg-white text-foreground border-2 border-border rounded-lg font-semibold text-lg hover:bg-secondary transition-colors shadow-lg"
          >
            💬 Sou um Pitaqueiro
          </Link>
        </div>
      </div>
    </main>
  );
}
