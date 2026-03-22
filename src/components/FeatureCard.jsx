export default function FeatureCard({ feature, onClick }) {
  const statusColor = {
    'Planejado': '#6B7280',
    'Em andamento': '#D97706',
    'Concluído': '#059669',
  }

  const statusBg = {
    'Planejado': '#F3F4F6',
    'Em andamento': '#FEF3C7',
    'Concluído': '#D1FAE5',
  }

  return (
    <div style={styles.card} onClick={onClick}>
      <div style={styles.header}>
        <span style={{
          ...styles.badge,
          color: statusColor[feature.status],
          background: statusBg[feature.status],
        }}>
          {feature.status}
        </span>
      </div>
      <h3 style={styles.title}>{feature.titulo}</h3>
      <p style={styles.desc}>{feature.descricao}</p>
      <div style={styles.footer}>
        <span style={styles.footerItem}>👍 {feature.likes}</span>
        <span style={styles.footerItem}>👎 {feature.dislikes}</span>
        <span style={styles.footerItem}>💬 {feature.comentarios.length}</span>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '10px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(30,58,95,0.07)',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    marginBottom: '12px',
    border: '1px solid #E8EDF5',
  },
  header: {
    marginBottom: '8px',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '6px',
    lineHeight: '1.4',
  },
  desc: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    fontSize: '13px',
    color: '#888',
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
}
