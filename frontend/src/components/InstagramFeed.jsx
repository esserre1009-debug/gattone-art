import { useInstagram } from '../hooks/useInstagram'

export default function InstagramFeed() {
  const { profileUrl, embedUrl } = useInstagram()

  if (!profileUrl && !embedUrl) return null

  return (
    <section className="instagram-feed">
      <div className="container">
        <div className="section-heading">
          <div>
            <h2>Instagram</h2>
            <p className="subtitle">Seguici per gli ultimi aggiornamenti sulle opere.</p>
          </div>
          {profileUrl && (
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Vai al profilo
            </a>
          )}
        </div>

        {embedUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="600"
            scrolling="no"
            allowTransparency="true"
            title="Instagram Feed"
          ></iframe>
        ) : (
          <div className="instagram-cta">
            <p>Scopri tutte le opere e le novita' direttamente sul profilo Instagram.</p>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Seguici su Instagram
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
