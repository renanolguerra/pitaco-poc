export default function EntryScreen({ onSelectPerfil }) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>📌</div>
        <h1 style={styles.title}>Pitaco</h1>
        <p style={styles.subtitle}>Plataforma de feedback colaborativo em roadmaps de produto</p>
        <p style={styles.question}>Como você quer acessar?</p>
        <div style={styles.buttons}>
          <button style={styles.btnPrimary} onClick={() => onSelectPerfil('empresa')}>
            🏢 Sou uma Empresa
          </button>
          <button style={styles.btnSecondary} onClick={() => onSelectPerfil('usuario')}>
            👤 Sou um Usuário
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #F5F7FA 0%, #E8EDF5 100%)',
    padding: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '56px 48px',
    textAlign: 'center',
    boxShadow: '0 4px 24px rgba(30,58,95,0.10)',
    maxWidth: '420px',
    width: '100%',
  },
  logo: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '40px',
    lineHeight: '1.5',
  },
  question: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  btnPrimary: {
    background: '#1E3A5F',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'inherit',
  },
  btnSecondary: {
    background: '#fff',
    color: '#1E3A5F',
    border: '2px solid #1E3A5F',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
}
