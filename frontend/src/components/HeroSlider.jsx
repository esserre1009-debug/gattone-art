import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHero } from '../hooks/useHero'

function SlideButton({ text, link }) {
  if (!text) return null
  const isInternal = link && link.startsWith('/')
  if (isInternal) {
    return <Link to={link} className="btn btn-primary">{text}</Link>
  }
  return (
    <a href={link || '#'} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
      {text}
    </a>
  )
}

export default function HeroSlider() {
  const heroData = useHero()
  const slides = heroData.filter((s) => s.image)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [slides.length])

  useEffect(() => {
    setCurrent(0)
  }, [heroData])

  if (slides.length === 0) return null

  return (
    <section className="hero-slider">
      <div className="hero-shapes">
        <span className="hero-shape-triangle"></span>
        <span className="hero-shape-diamond"></span>
        <span className="hero-shape-line"></span>
      </div>

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${index === current ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-slide-overlay"></div>
          <div className="hero-slide-content">
            {slide.eyebrow && <span className="eyebrow">{slide.eyebrow}</span>}
            {slide.title && <h1>{slide.title}</h1>}
            {slide.text && <p>{slide.text}</p>}
            <SlideButton text={slide.buttonText} link={slide.buttonLink} />
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`hero-dot ${index === current ? 'active' : ''}`}
              onClick={() => setCurrent(index)}
              aria-label={`Vai alla slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
