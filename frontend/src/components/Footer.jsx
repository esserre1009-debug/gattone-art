import { useFlags } from '../hooks/useFlags'

export default function Footer() {
  const flags = useFlags()

  return (
    <footer className="site-footer">
      <div className="container">
        <span>&copy; {new Date().getFullYear()} gattone.art - Tutti i diritti riservati</span>
        <span>
          {flags.enableContact ? 'Contatti disponibili' : 'Vetrina - sezione contatti in arrivo'}
        </span>
      </div>
    </footer>
  )
}
