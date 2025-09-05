import { useEffect, useState } from 'react'

export type SheetData = {
  labels: string[]
  values: (string | number)[]
}

export async function fetchSheetData(): Promise<SheetData | null> {
  //disk.yandex.ru/i/c8ncWA202Su3rA

  const url = `https://disk.yandex.ru/i/c8ncWA202Su3rA/export?format=csv`

  const res = await fetch(url, { cache: 'no-store' })
  const buf = await res.arrayBuffer()
  const text = new TextDecoder('utf-8').decode(buf)

  const rows = text
    .trim()
    .split('\n')
    .map(line => line.split(','))

  if (rows.length < 2) return null

  const headers = rows[0] // первая строка — заголовки
  const lastRow = rows[rows.length - 1] // последняя строка — актуальные данные

  // приводим числа к числовому типу
  const values = lastRow.map(val => {
    const num = Number(val)
    return isNaN(num) ? val : num
  })

  return { labels: headers, values }
}

export function useSheetData(interval = 3000) {
  const [data, setData] = useState<SheetData | null>(null)

  useEffect(() => {
    let timer

    async function load() {
      try {
        const result = await fetchSheetData()
        if (result) {
          setData(result)
        }
      } catch (err) {
        console.error('Ошибка загрузки Яндекс Таблицы:', err)
      }
    }

    load() // первая загрузка
    timer = setInterval(load, interval) // повторяем каждые N мс

    return () => clearInterval(timer)
  }, [interval])

  return data
}
