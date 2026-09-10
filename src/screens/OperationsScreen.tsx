import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { AddOperationSheet } from '../components/AddOperationSheet'
import { db, type Category, type Operation } from '../db/db'
import {
  formatDateHeader,
  formatMoney,
  formatShortDate,
  formatSignedMoney,
} from '../lib/format'

export function OperationsScreen() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)

  const accounts = useLiveQuery(() => db.accounts.toArray(), [], [])
  const categories = useLiveQuery(() => db.categories.toArray(), [], [])
  const operations = useLiveQuery(
    () => db.operations.orderBy('date').reverse().toArray(),
    [],
    [],
  )

  // Пока переключателя счёта и периода нет, показываем всё вместе:
  // сводку за текущий календарный месяц по всем счетам сразу.
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthOperations = operations.filter((op) => op.date >= monthStart)
  const monthIncome = sumByType(monthOperations, 'income')
  const monthExpense = sumByType(monthOperations, 'expense')
  const monthBalance = monthIncome - monthExpense

  // Общий остаток по всем счетам. Переводы между своими счетами в такой
  // сумме взаимно гасятся, поэтому в этом расчёте они не участвуют.
  const startingTotal = accounts.reduce((sum, a) => sum + a.startingBalance, 0)
  const totalBalance =
    startingTotal + sumByType(operations, 'income') - sumByType(operations, 'expense')

  const categoriesById = new Map(categories.map((c) => [c.id, c]))
  const dayGroups = groupByDay(operations)

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        <section className="m-4 grid grid-cols-2 gap-y-4 rounded-2xl bg-white p-4 shadow-sm">
          <SummaryCell label="Доходы" value={formatMoney(monthIncome)} accent />
          <SummaryCell label="Расходы" value={formatMoney(monthExpense)} />
          <SummaryCell
            label="Баланс за период"
            value={formatSignedMoney(monthBalance)}
            accent={monthBalance > 0}
          />
          <SummaryCell
            label={`Остаток на ${formatShortDate(now)}`}
            value={formatSignedMoney(totalBalance)}
            accent={totalBalance > 0}
          />
        </section>

        <h2 className="px-4 pb-1 text-sm text-slate-400">Операции</h2>

        {dayGroups.length === 0 ? (
          <p className="px-4 py-8 text-center text-slate-400">
            Пока нет ни одной операции. Нажми "+", чтобы добавить первую.
          </p>
        ) : (
          dayGroups.map((group) => (
            <section key={group.key} className="mt-4">
              <h3 className="border-b border-slate-200 px-4 pb-2 text-sm text-slate-400">
                {formatDateHeader(group.date)}
              </h3>
              {group.operations.map((operation) => (
                <OperationRow
                  key={operation.id}
                  operation={operation}
                  category={categoriesById.get(operation.categoryId)}
                />
              ))}
            </section>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsAddSheetOpen(true)}
        aria-label="Добавить операцию"
        className="absolute right-5 bottom-5 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg active:bg-violet-700"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {isAddSheetOpen && (
        <AddOperationSheet onClose={() => setIsAddSheetOpen(false)} />
      )}
    </div>
  )
}

function sumByType(operations: Operation[], type: Operation['type']): number {
  return operations
    .filter((op) => op.type === type)
    .reduce((sum, op) => sum + op.amount, 0)
}

interface DayGroup {
  key: string
  date: Date
  operations: Operation[]
}

// Операции приходят уже отсортированными по дате (свежие сверху),
// поэтому достаточно складывать их в группы по календарному дню подряд.
function groupByDay(operations: Operation[]): DayGroup[] {
  const groups: DayGroup[] = []
  for (const operation of operations) {
    const key = operation.date.toDateString()
    const lastGroup = groups.at(-1)
    if (lastGroup?.key === key) {
      lastGroup.operations.push(operation)
    } else {
      groups.push({ key, date: operation.date, operations: [operation] })
    }
  }
  return groups
}

interface SummaryCellProps {
  label: string
  value: string
  accent?: boolean
}

function SummaryCell({ label, value, accent }: SummaryCellProps) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p
        className={`mt-0.5 text-xl ${accent ? 'text-violet-600' : 'text-slate-900'}`}
      >
        {value}
      </p>
    </div>
  )
}

interface OperationRowProps {
  operation: Operation
  category?: Category
}

function OperationRow({ operation, category }: OperationRowProps) {
  const isIncome = operation.type === 'income'
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3">
      <span className="text-lg leading-6">{category?.icon ?? '❓'}</span>
      <div className="flex-1">
        <p className="text-slate-900">{category?.name ?? 'Без категории'}</p>
        {operation.note && (
          <p className="mt-0.5 text-sm text-slate-400">{operation.note}</p>
        )}
      </div>
      <span className={isIncome ? 'text-violet-600' : 'text-slate-900'}>
        {formatSignedMoney(isIncome ? operation.amount : -operation.amount)}
      </span>
    </div>
  )
}
