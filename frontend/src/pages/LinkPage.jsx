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
        setErrorMessage('Questa email risulta già registrata.')
      } else {
        setErrorMessage('Si è verificato un errore durante l’invio. Riprova.')
      }
      setLoading(false)
      return
    }

    setMessage('Richiesta inviata correttamente. Grazie.')
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
        <div className="contact-shell">
          <div className="contact-heading">
            <p className="contact-kicker">Contatti</p>
            <h1>Resta in contatto</h1>
            <p className="contact-subtitle">
              Compila il form per ricevere aggiornamenti, novità sulle opere e
              informazioni sui lavori disponibili.
            </p>
          </div>

          <div className="contact-card">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-field">
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

              <div className="contact-field">
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

              <div className="contact-field">
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

              <div className="contact-submit">
                <button
                  type="submit"
                  className="contact-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Invio in corso...' : 'Invia richiesta'}
                </button>
              </div>

              {message && <div className="contact-feedback success">{message}</div>}
              {errorMessage && <div className="contact-feedback error">{errorMessage}</div>}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}