export default function FeedbackPanel({ features }) {
  const total = features.reduce((acc, f) => acc + f.likes + f.dislikes, 0)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Painel de Feedbacks</h2>
        <span style={styles.subtitle}>{total} interações no total</span>
      </div>

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span style={{ flex: 3 }}>Feature</span>
          <span style={styles.cell}>Status</span>
          <span style={styles.cell}>👍</span>
          <span style={styles.cell}>👎</span>
          <span style={styles.cell}>💬</span>
          <span style={styles.cell}>Aprovação</span>
        </div>

        {features.map((f) => {
          const totalVotes = f.likes + f.dislikes
          const approval = totalVotes > 0 ? Math.round((f.likes / totalVotes) * 100) : 0
          return (
            <div key={f.id} style={styles.row}>
              <div style={{ flex: 3 }}>
                <p style={styles.featureName}>{f.titulo}</p>
              </div>
              <span style={styles.cell}>
                <span style={{
                  ...styles.badge,
                  background: f.status === 'Concluído' ? '#D1FAE5' : f.status === 'Em andamento' ? '#FEF3C7' : '#F3F4F6',
                  color: f.status === 'Concluído' ? '#065F46' : f.status === 'Em andamento' ? '#92400E' : '#374151',
                }}>
                  {f.status}
                </span>
              </span>
              <span style={{ ...styles.cell, color: '#059669', fontWeight: '600' }}>{f.likes}</span>
              <span style={{ ...styles.cell, color: '#DC2626', fontWeight: '600' }}>{f.dislikes}</span>
              <span style={{ ...styles.cell, color: '#6B7280', fontWeight: '600' }}>{f.comentarios.length}</span>
              <span style={styles.cell}>
                <div style={styles.approvalWrap}>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: `${approval}%` }} />
                  </div>
                  <span style={styles.approvalText}>{approval}%</span>
                </div>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
  },
  table: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(30,58,95,0.07)',
    border: '1px solid #E8EDF5',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    background: '#1E3A5F',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    gap: '8px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    gap: '8px',
    borderBottom: '1px solid #F0F4F8',
    transition: 'background 0.15s',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: '14px',
  },
  featureName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1E3A5F',
  },
  badge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  approvalWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center',
  },
  barBg: {
    width: '60px',
    height: '6px',
    background: '#E5E7EB',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    background: '#059669',
    borderRadius: '3px',
    transition: 'width 0.3s',
  },
  approvalText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    minWidth: '32px',
  },
}
