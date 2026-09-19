import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LinkPage() {
  const [form, setForm] = useState({
    nome: '',
    cognome: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setErrorMessage('')

    const { error } = await supabase.from('link_contacts').insert([
      {
        nome: form.nome.trim(),
        cognome: form.cognome.trim(),
        email: form.email.trim().toLowerCase(),
      },
    ])

    if (error) {
      if (error.code === '23505') {
        setErrorMessage('Questa email è già registrata.')
      } else {
        setErrorMessage('Errore durante il salvataggio. Riprova.')
      }
      setLoading(false)
      return
    }

    setMessage('Dati inviati correttamente.')
    setForm({
      nome: '',
      cognome: '',
      email: '',
    })
    setLoading(false)
  }

  return (
    <section className="intro-section">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="section-heading">
          <div>
            <h1>Resta in contatto</h1>
            <p className="subtitle">
              Compila il form per ricevere aggiornamenti e informazioni
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="cognome">Cognome</label>
            <input
              id="cognome"
              name="cognome"
              type="text"
              value={form.cognome}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <button type="submit" className="btn btn-outline" disabled={loading}>
              {loading ? 'Invio...' : 'Invia'}
            </button>
          </div>
        </form>

        {message && (
          <p style={{ marginTop: 16, color: 'green' }}>
            {message}
          </p>
        )}

        {errorMessage && (
          <p style={{ marginTop: 16, color: 'crimson' }}>
            {errorMessage}
          </p>
        )}
      </div>
    </section>
  )
}