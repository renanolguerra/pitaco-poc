import FeatureCard from './FeatureCard.jsx'

const COLUNAS = ['Planejado', 'Em andamento', 'Concluído']

export default function KanbanBoard({ features, onSelectFeature }) {
  return (
    <div style={styles.board}>
      {COLUNAS.map((col) => {
        const items = features.filter((f) => f.status === col)
        return (
          <div key={col} style={styles.column}>
            <div style={styles.colHeader}>
              <h2 style={styles.colTitle}>{col}</h2>
              <span style={styles.colCount}>{items.length}</span>
            </div>
            <div style={styles.colBody}>
              {items.length === 0 ? (
                <p style={styles.empty}>Nenhuma feature</p>
              ) : (
                items.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    onClick={() => onSelectFeature(feature.id)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    flex: 1,
    alignItems: 'start',
  },
  column: {
    background: '#EAEFF6',
    borderRadius: '12px',
    padding: '16px',
    minHeight: '300px',
  },
  colHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  colTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1E3A5F',
  },
  colCount: {
    background: '#1E3A5F',
    color: '#fff',
    borderRadius: '12px',
    padding: '2px 9px',
    fontSize: '12px',
    fontWeight: '600',
  },
  colBody: {
    display: 'flex',
    flexDirection: 'column',
  },
  empty: {
    color: '#AAB4C3',
    fontSize: '13px',
    textAlign: 'center',
    marginTop: '20px',
    fontStyle: 'italic',
  },
}
