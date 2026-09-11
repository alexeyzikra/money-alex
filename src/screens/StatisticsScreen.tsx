import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { db, type Category, type Operation, type OperationType } from '../db/db'
import { formatMoney } from '../lib/format'

interface CategoryTotal {
  categoryId: number
  name: string
  icon: string
  color: string
  amount: number
}

export function StatisticsScreen() {
  const [type, setType] = useState<OperationType>('expense')

  const categories = useLiveQuery(() => db.categories.toArray(), [], [])
  const operations = useLiveQuery(() => db.operations.toArray(), [], [])

  // Пока считаем за всё время. Когда добавим выбор периода, здесь появится
  // отбор по датам — расчёт ниже работает с любым набором операций,
  // а индекс по полю date в таблице operations для этого уже готов.
  const totals = sumByCategory(operations, categories, type)
  const total = totals.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="p-4">
        <div className="flex gap-1 rounded-xl bg-slate-200 p-1">
          <TypeTab
            label="Расходы"
            isActive={type === 'expense'}
            onClick={() => setType('expense')}
          />
          <TypeTab
            label="Доходы"
            isActive={type === 'income'}
            onClick={() => setType('income')}
          />
        </div>
      </div>

      {totals.length === 0 ? (
        <p className="px-4 py-12 text-center text-slate-400">
          {type === 'expense'
            ? 'Расходов пока нет — добавь операции, и здесь появится диаграмма.'
            : 'Доходов пока нет — добавь операции, и здесь появится диаграмма.'}
        </p>
      ) : (
        <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={totals}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius="52%"
                  outerRadius="92%"
                  startAngle={90}
                  endAngle={-270}
                  labelLine={false}
                  label={renderPercentLabel}
                  isAnimationActive={false}
                >
                  {totals.map((item) => (
                    <Cell key={item.categoryId} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-between border-b border-slate-200 px-4 pb-3">
            <span className="text-slate-900">
              {type === 'expense' ? 'Все расходы' : 'Все доходы'}
            </span>
            <span className="text-slate-900">{formatMoney(total)}</span>
          </div>

          {totals.map((item) => (
            <div
              key={item.categoryId}
              className="flex items-center gap-3 border-b border-slate-100 px-4 py-3"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: `${item.color}1a` }}
              >
                {item.icon}
              </span>
              <span className="flex-1 text-slate-900">{item.name}</span>
              <span className="text-slate-900">{formatMoney(item.amount)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// Суммирует операции по категориям и сортирует от большей суммы к меньшей.
function sumByCategory(
  operations: Operation[],
  categories: Category[],
  type: OperationType,
): CategoryTotal[] {
  const amountByCategory = new Map<number, number>()
  for (const operation of operations) {
    if (operation.type !== type) continue
    const current = amountByCategory.get(operation.categoryId) ?? 0
    amountByCategory.set(operation.categoryId, current + operation.amount)
  }

  return categories
    .filter((category) => amountByCategory.has(category.id!))
    .map((category) => ({
      categoryId: category.id!,
      name: category.name,
      icon: category.icon,
      color: category.color,
      amount: amountByCategory.get(category.id!)!,
    }))
    .sort((a, b) => b.amount - a.amount)
}

interface PercentLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}

// Проценты пишем прямо внутри сегмента. У узких сегментов подпись не помещается
// и налезает на соседнюю, поэтому их не подписываем — точные суммы всё равно
// видно в списке под диаграммой.
function renderPercentLabel(props: unknown) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } =
    props as PercentLabelProps
  if (percent < 0.07) return null

  const radians = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * radians)
  const y = cy + radius * Math.sin(-midAngle * radians)

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
    >
      {(percent * 100).toFixed(1).replace('.', ',')} %
    </text>
  )
}

interface TypeTabProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function TypeTab({ label, isActive, onClick }: TypeTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm transition-colors ${
        isActive ? 'bg-white font-medium text-slate-900 shadow-sm' : 'text-slate-500'
      }`}
    >
      {label}
    </button>
  )
}
