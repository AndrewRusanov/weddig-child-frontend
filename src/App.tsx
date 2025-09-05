import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { ValuesDTO } from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || ''

export default function App() {
  const [data, setData] = useState<ValuesDTO | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fallbackTimer = useRef<number | null>(null)

  useEffect(() => {
    const sseUrl = `${API_BASE}/api/stream`
    let es: EventSource | null = null

    function startPolling() {
      if (fallbackTimer.current) return
      async function tick() {
        try {
          const res = await fetch(
            `https://weddig-child-backend.onrender.com/api/values`,
            {
              cache: 'no-store',
            }
          )
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = (await res.json()) as ValuesDTO
          setData(json)
          setError(null)
        } catch (e: any) {
          setError(e?.message || 'Fetch error')
        } finally {
          fallbackTimer.current = window.setTimeout(tick, 5000)
        }
      }
      tick()
    }

    try {
      es = new EventSource(sseUrl)
      es.onmessage = ev => {
        try {
          const payload: ValuesDTO = JSON.parse(ev.data)
          setData(payload)
          setError(null)
        } catch {}
      }
      es.onerror = () => {
        setError('SSE failed — falling back to polling')
        es?.close()
        startPolling()
      }
    } catch {
      startPolling()
    }

    return () => {
      es?.close()
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current)
    }
  }, [])

  const chartData = useMemo(
    () =>
      data
        ? [
            { name: 'A', value: data.a },
            { name: 'B', value: data.b },
          ]
        : [],
    [data]
  )

  return (
    <div className='page'>
      <div className='card'>
        <h1>Sheets → Pie</h1>
        <p className='muted'>
          Диапазон: <code>A2:B2</code>
        </p>

        {error && <div className='error'>Ошибка: {error}</div>}

        {!data ? (
          <div className='loading'>Загрузка…</div>
        ) : (
          <>
            <div className='values'>
              <div>
                <b>A:</b> {data.a}
              </div>
              <div>
                <b>B:</b> {data.b}
              </div>
              <div className='stamp'>
                Обновлено: {new Date(data.updatedAt).toLocaleString()}
              </div>
            </div>

            <div className='chart'>
              <ResponsiveContainer width='100%' height={320}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey='value'
                    nameKey='name'
                    label
                    outerRadius={120}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
