import { useState } from 'react'
import { initialFeatures } from './data/mockData.js'
import EntryScreen from './components/EntryScreen.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'
import FeatureDetail from './components/FeatureDetail.jsx'
import FeedbackPanel from './components/FeedbackPanel.jsx'

export default function App() {
  const [perfil, setPerfil] = useState(null)
  const [features, setFeatures] = useState(initialFeatures)
  const [featureSelecionadaId, setFeatureSelecionadaId] = useState(null)
  const [view, setView] = useState('kanban')

  const featureSelecionada = features.find((f) => f.id === featureSelecionadaId) || null

  function handleLike(id) {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, likes: f.likes + 1 } : f))
    )
  }

  function handleDislike(id) {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, dislikes: f.dislikes + 1 } : f))
    )
  }

  function handleAddComentario(id, texto) {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, comentarios: [...f.comentarios, texto] } : f
      )
    )
  }

  if (!perfil) {
    return <EntryScreen onSelectPerfil={setPerfil} />
  }

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={styles.logoIcon}>📌</span>
          <span style={styles.logoText}>Pitaco</span>
        </div>

        <nav style={styles.nav}>
          <button
            style={{ ...styles.navItem, ...(view === 'kanban' ? styles.navItemActive : {}) }}
            onClick={() => setView('kanban')}
          >
            🗂 Roadmap
          </button>
          {perfil === 'empresa' && (
            <button
              style={{ ...styles.navItem, ...(view === 'feedbacks' ? styles.navItemActive : {}) }}
              onClick={() => setView('feedbacks')}
            >
              📊 Feedbacks
            </button>
          )}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.perfilChip}>
            {perfil === 'empresa' ? '🏢' : '👤'}
            <span>{perfil === 'empresa' ? 'Empresa' : 'Usuário'}</span>
          </div>
          <button style={styles.logoutBtn} onClick={() => { setPerfil(null); setView('kanban') }}>
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>
              {view === 'kanban' ? 'Roadmap de Produto' : 'Painel de Feedbacks'}
            </h1>
            <p style={styles.pageSubtitle}>
              {view === 'kanban'
                ? perfil === 'empresa'
                  ? 'Gerencie e visualize o andamento das features'
                  : 'Acompanhe o roadmap e deixe seu feedback'
                : 'Visão consolidada de votos e comentários por feature'}
            </p>
          </div>
        </div>

        <div style={styles.content}>
          {view === 'kanban' && (
            <KanbanBoard
              features={features}
              onSelectFeature={setFeatureSelecionadaId}
            />
          )}
          {view === 'feedbacks' && perfil === 'empresa' && (
            <FeedbackPanel features={features} />
          )}
        </div>
      </main>

      {/* Modal */}
      {featureSelecionada && (
        <FeatureDetail
          feature={featureSelecionada}
          perfil={perfil}
          onClose={() => setFeatureSelecionadaId(null)}
          onLike={() => handleLike(featureSelecionada.id)}
          onDislike={() => handleDislike(featureSelecionada.id)}
          onAddComentario={(texto) => handleAddComentario(featureSelecionada.id, texto)}
        />
      )}
    </div>
  )
}

const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '220px',
    background: '#1E3A5F',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    flexShrink: 0,
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '36px',
    paddingLeft: '4px',
  },
  logoIcon: {
    fontSize: '24px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.65)',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
  },
  sidebarFooter: {
    borderTop: '1px solid rgba(255,255,255,0.12)',
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  perfilChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '13px',
    fontWeight: '500',
    padding: '4px 0',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topbar: {
    padding: '24px 32px 0',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: '4px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#888',
  },
  content: {
    flex: 1,
    padding: '0 32px 32px',
    display: 'flex',
    flexDirection: 'column',
  },
}
