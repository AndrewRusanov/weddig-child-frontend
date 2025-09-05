import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

type ChartProps = {
  data: { name: string; value: number }[]
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042']

export function GenderPieChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width='100%' height={400}>
      <PieChart>
        <Pie
          data={data}
          dataKey='value'
          nameKey='name'
          cx='50%'
          cy='50%'
          outerRadius={150}
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default GenderPieChart
