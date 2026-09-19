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

    setMessage('Richiesta inviata correttamente. Grazie!')
    setForm({
      nome: '',
      cognome: '',
      email: '',
    })
    setLoading(false)
  }

  return (
    <section className="contact-page">
      <div className="container">
        <div className="contact-hero">
          <p className="contact-eyebrow">Contatti</p>
          <h1>Resta in contatto</h1>
          <p className="contact-intro">
            Compila il form per ricevere aggiornamenti, novità sulle opere
            e informazioni sui lavori disponibili.
          </p>
        </div>

        <div className="contact-card">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="contact-grid">
              <div className="form-field">
                <label htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Inserisci il nome"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="cognome">Cognome</label>
                <input
                  id="cognome"
                  name="cognome"
                  type="text"
                  value={form.cognome}
                  onChange={handleChange}
                  placeholder="Inserisci il cognome"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Inserisci la tua email"
                required
              />
            </div>

            <div className="contact-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Invio...' : 'Invia richiesta'}
              </button>
            </div>

            {message && <div className="form-message success">{message}</div>}
            {errorMessage && <div className="form-message error">{errorMessage}</div>}
          </form>
        </div>
      </div>
    </section>
  )
}