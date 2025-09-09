/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ValuesDTO } from './types'

const API_BASE = 'https://weddig-child-backend.onrender.com'

const COLOR_MAP: Record<string, string> = {
  Мальчик: '#56b0cbff',
  Девочка: '#FF9EA7',
}

const COLOR_STROKE_MAP: Record<string, string> = {
  Мальчик: '#2a5360ff',
  Девочка: '#724d50ff',
}

export default function App() {
  const [data, setData] = useState<ValuesDTO | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}/api/values`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as ValuesDTO
        setData(json)
        setError(null)
      } catch (e: any) {
        setError(e?.message || 'Fetch error')
      } finally {
        timer.current = window.setTimeout(fetchData, 5000)
      }
    }

    fetchData()

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const chartData = useMemo(
    () =>
      data
        ? [
            { name: 'Мальчик', value: data.a },
            { name: 'Девочка', value: data.b },
          ]
        : [],
    [data]
  )

  return (
    <div className='page'>
      <div className='card'>
        <h1 className='title'>Кто будет первым?</h1>
        {error && <div className='error'>Ошибка: {error}</div>}

        {!data ? (
          <div className='loading'>Загрузка…</div>
        ) : (
          <>
            <div className='chart'>
              <ResponsiveContainer width='100%' height={620}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey='value'
                    nameKey='name'
                    label={({ percent }) => `${(percent! * 100).toFixed(0)}%`} // проценты
                    outerRadius={300}
                  >
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={COLOR_MAP[entry.name] || '#8884d8'}
                        stroke={COLOR_STROKE_MAP[entry.name] || '#8884d8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
