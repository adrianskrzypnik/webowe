import { Link, useParams } from 'react-router'
import { products } from '../data/products'
import { CARD_WIDTHS, DETAIL_SIZES, Photo } from '../components/Photo'
import { useCart } from '../cart'

export function ProductPage() {
  const { id } = useParams()
  const { add } = useCart()
  const product = products.find((p) => p.id === Number(id))

  if (!product) {
    return (
      <p className="page">
        Nie znaleziono produktu. <Link to="/">Wróć do galerii</Link>
      </p>
    )
  }

  return (
    <article className="page detail">
      <div className="detail-image">
        <Photo name={product.image} ext={product.ext} alt={product.name} widths={CARD_WIDTHS} sizes={DETAIL_SIZES} loading="priority" />
      </div>
      <div>
        <p className="muted">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="price">{product.price} zł</p>
        <p>Odbitka 40×30 cm na papierze bawełnianym, numerowana i podpisana przez autora.</p>
        <button className="add large" onClick={add}>
          Dodaj do koszyka
        </button>
      </div>
    </article>
  )
}
