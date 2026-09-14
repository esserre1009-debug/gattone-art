import { Link, NavLink } from 'react-router-dom'
import { useFlags } from '../hooks/useFlags'

export default function Header() {
  const flags = useFlags()

  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="logo-link">
          <img src="/images/logo.jpeg" alt="gattone.art" className="logo-img" />
        </Link>
        <nav className="main-nav">
          <ul>
            <li><NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink></li>
            <li><NavLink to="/galleria" className={({isActive}) => isActive ? 'active' : ''}>Galleria</NavLink></li>
            {flags.enableBio && (
              <li><NavLink to="/bio">Biografia</NavLink></li>
            )}
            {flags.enableContact && (
              <li><NavLink to="/contatti">Contatti</NavLink></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
