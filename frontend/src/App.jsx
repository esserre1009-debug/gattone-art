import ScrollToTop from './components/ScrollToTop'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import ArtworkDetail from './pages/ArtworkDetail'
import LinkPage from './pages/LinkPage'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/galleria" element={<Gallery />} />
          <Route path="/opera/:id" element={<ArtworkDetail />} />
          <Route path="/link" element={<LinkPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
