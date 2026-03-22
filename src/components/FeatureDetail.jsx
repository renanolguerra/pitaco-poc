import CommentSection from './CommentSection.jsx'

export default function FeatureDetail({ feature, perfil, onClose, onLike, onDislike, onAddComentario }) {
  const isUsuario = perfil === 'usuario'

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        <div style={styles.header}>
          <h2 style={styles.title}>{feature.titulo}</h2>
          <span style={styles.status}>{feature.status}</span>
        </div>

        <p style={styles.desc}>{feature.descricao}</p>

        <div style={styles.dates}>
          <div style={styles.dateItem}>
            <span style={styles.dateLabel}>Início</span>
            <span style={styles.dateValue}>{formatDate(feature.dataInicio)}</span>
          </div>
          <div style={styles.dateDivider} />
          <div style={styles.dateItem}>
            <span style={styles.dateLabel}>Previsão</span>
            <span style={styles.dateValue}>{formatDate(feature.dataFim)}</span>
          </div>
        </div>

        {isUsuario && (
          <div style={styles.voteArea}>
            <h4 style={styles.voteTitle}>Placar de votos</h4>
            <div style={styles.voteRow}>
              <button style={styles.voteBtnLike} onClick={onLike}>
                👍 Curtir <strong>{feature.likes}</strong>
              </button>
              <button style={styles.voteBtnDislike} onClick={onDislike}>
                👎 Não curtir <strong>{feature.dislikes}</strong>
              </button>
            </div>
          </div>
        )}

        {!isUsuario && (
          <div style={styles.voteDisplay}>
            <span style={styles.voteChip}>👍 {feature.likes} curtidas</span>
            <span style={styles.voteChip}>👎 {feature.dislikes} não curtidas</span>
          </div>
        )}

        <CommentSection
          comentarios={feature.comentarios}
          onAddComentario={onAddComentario}
          readOnly={!isUsuario}
        />
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(30,58,95,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '24px',
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 8px 40px rgba(30,58,95,0.18)',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#888',
    lineHeight: 1,
    padding: '4px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1E3A5F',
    lineHeight: '1.3',
    flex: 1,
  },
  status: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1E3A5F',
    background: '#E8EDF5',
    borderRadius: '12px',
    padding: '4px 10px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  desc: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.65',
    marginBottom: '20px',
  },
  dates: {
    display: 'flex',
    gap: '0',
    background: '#F5F7FA',
    borderRadius: '10px',
    padding: '14px 20px',
    marginBottom: '20px',
    alignItems: 'center',
  },
  dateItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  dateDivider: {
    width: '1px',
    height: '32px',
    background: '#D1D5DB',
    margin: '0 20px',
  },
  dateLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dateValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1E3A5F',
  },
  voteArea: {
    marginBottom: '8px',
  },
  voteTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '10px',
  },
  voteRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '8px',
  },
  voteBtnLike: {
    flex: 1,
    background: '#D1FAE5',
    color: '#065F46',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteBtnDislike: {
    flex: 1,
    background: '#FEE2E2',
    color: '#991B1B',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteDisplay: {
    display: 'flex',
    gap: '10px',
    marginBottom: '8px',
  },
  voteChip: {
    background: '#F5F7FA',
    color: '#555',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '14px',
  },
}
