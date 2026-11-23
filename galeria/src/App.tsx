import { NavLink, Route, Routes } from 'react-router'
import { useCart } from './cart'
// Wersja bazowa: wszystkie trasy importowane statycznie, czyli jeden duży bundle.
import { Gallery } from './pages/Gallery'
import { ProductPage } from './pages/ProductPage'
import { Stats } from './pages/Stats'

export function App() {
  const { count } = useCart()

  return (
    <>
      <header className="site-header">
        <NavLink to="/" className="logo">
          Kadr
        </NavLink>
        <nav>
          <NavLink to="/">Galeria</NavLink>
          <NavLink to="/statystyki">Statystyki</NavLink>
          <span className="cart" aria-label={`Koszyk: ${count}`}>
            Koszyk ({count})
          </span>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/produkt/:id" element={<ProductPage />} />
          <Route path="/statystyki" element={<Stats />} />
        </Routes>
      </main>
    </>
  )
}
