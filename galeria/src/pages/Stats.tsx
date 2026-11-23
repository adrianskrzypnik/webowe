import _ from 'lodash'
import moment from 'moment'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { products } from '../data/products'

export function Stats() {
  const byCategory = _.map(_.groupBy(products, 'category'), (items, category) => ({
    category,
    liczba: items.length,
    srednia: Math.round(_.meanBy(items, 'price')),
  }))

  const byMonth = _.sortBy(
    _.map(
      _.groupBy(products, (p) => moment(p.addedAt).format('YYYY-MM')),
      (items, month) => ({ month, dodane: items.length }),
    ),
    'month',
  )

  return (
    <div className="page">
      <h1>Statystyki katalogu</h1>
      <h2>Średnia cena w kategorii (zł)</h2>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byCategory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="srednia" fill="#3d5a80" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <h2>Nowe odbitki w miesiącu</h2>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={byMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line dataKey="dodane" stroke="#c8553d" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
