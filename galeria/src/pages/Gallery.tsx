import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import _ from 'lodash'
import moment from 'moment'
// Wersja ESM: Vite bierze ESM-owy moment, a 'moment/locale/pl' rejestrowałby język w drugiej kopii biblioteki.
import 'moment/dist/locale/pl'
import { products, type Category } from '../data/products'
import { computeRecommendations, type Recommendation } from '../data/recommendations'
import { ABOVE_THE_FOLD_CARDS, CARD_SIZES, CARD_WIDTHS, HERO_WIDTHS, Photo } from '../components/Photo'
import { useCart } from '../cart'

type Sort = 'newest' | 'cheapest' | 'expensive'

const CATEGORIES: (Category | 'Wszystkie')[] = ['Wszystkie', 'Krajobraz', 'Miasto', 'Natura', 'Detal']

export function Gallery() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Wszystkie')
  const [sort, setSort] = useState<Sort>('newest')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const { add } = useCart()

  useEffect(() => computeRecommendations(products, setRecommendations), [])

  const visible = useMemo(() => {
    const filtered = category === 'Wszystkie' ? products : _.filter(products, { category })
    if (sort === 'cheapest') return _.orderBy(filtered, 'price', 'asc')
    if (sort === 'expensive') return _.orderBy(filtered, 'price', 'desc')
    return _.orderBy(filtered, 'addedAt', 'desc')
  }, [category, sort])

  return (
    <>
      <section className="hero">
        <Photo name="hero" ext="jpg" alt="Górski krajobraz o świcie" widths={HERO_WIDTHS} sizes="100vw" loading="priority" />
        <div className="hero-text">
          <h1>Fotografie, które zostają na ścianie</h1>
          <p>Limitowane odbitki autorskie, drukowane na papierze archiwalnym.</p>
        </div>
      </section>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Kategoria">
          {CATEGORIES.map((c) => (
            <button key={c} className={c === category ? 'chip active' : 'chip'} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <label className="sort">
          Sortuj
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="newest">Najnowsze</option>
            <option value="cheapest">Od najtańszych</option>
            <option value="expensive">Od najdroższych</option>
          </select>
        </label>
      </div>

      <ul className="grid">
        {visible.map((p, i) => (
          <li key={p.id} className="card">
            <Link to={`/produkt/${p.id}`} className="card-image">
              <Photo
                name={p.image}
                ext={p.ext}
                alt={p.name}
                widths={CARD_WIDTHS}
                sizes={CARD_SIZES}
                loading={i < ABOVE_THE_FOLD_CARDS ? 'eager' : 'lazy'}
              />
            </Link>
            <div className="card-body">
              <h2>{p.name}</h2>
              <p className="muted">
                {p.category} · {moment(p.addedAt).locale('pl').format('D MMM YYYY')}
              </p>
              <div className="card-footer">
                <strong>{p.price} zł</strong>
                <button className="add" onClick={add}>
                  Do koszyka
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Pod siatką, poza pierwszym ekranem, więc późne pojawienie się sekcji nie wpływa na CLS. */}
      {recommendations.length > 0 && (
        <section className="recommendations">
          <h2>Pasują do siebie</h2>
          <ul>
            {recommendations.slice(0, 6).map(({ source, match }) => (
              <li key={source.id}>
                <Link to={`/produkt/${source.id}`}>{source.name}</Link> + <Link to={`/produkt/${match.id}`}>{match.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
