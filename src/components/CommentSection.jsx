import { useState } from 'react'

export default function CommentSection({ comentarios, onAddComentario, readOnly }) {
  const [texto, setTexto] = useState('')

  function handleEnviar() {
    if (texto.trim() === '') return
    onAddComentario(texto.trim())
    setTexto('')
  }

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Comentários ({comentarios.length})</h4>

      {!readOnly && (
        <div style={styles.inputArea}>
          <textarea
            style={styles.textarea}
            placeholder="Escreva seu comentário..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
          />
          <button style={styles.btn} onClick={handleEnviar}>
            Enviar
          </button>
        </div>
      )}

      <div style={styles.list}>
        {comentarios.length === 0 ? (
          <p style={styles.empty}>Nenhum comentário ainda.</p>
        ) : (
          comentarios.map((c, i) => (
            <div key={i} style={styles.comment}>
              <span style={styles.avatar}>👤</span>
              <p style={styles.commentText}>{c}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    marginTop: '24px',
  },
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '14px',
  },
  inputArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    color: '#333',
    outline: 'none',
  },
  btn: {
    alignSelf: 'flex-end',
    background: '#1E3A5F',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  empty: {
    color: '#999',
    fontSize: '14px',
    fontStyle: 'italic',
  },
  comment: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    background: '#F5F7FA',
    borderRadius: '8px',
    padding: '10px 14px',
  },
  avatar: {
    fontSize: '20px',
    flexShrink: 0,
  },
  commentText: {
    fontSize: '14px',
    color: '#444',
    lineHeight: '1.5',
  },
}
