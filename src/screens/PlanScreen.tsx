import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { AddGoalSheet } from '../components/AddGoalSheet'
import { AddLimitSheet } from '../components/AddLimitSheet'
import { db, type Category, type Operation } from '../db/db'
import { formatMoney } from '../lib/format'

export function PlanScreen() {
  const [openSheet, setOpenSheet] = useState<'goal' | 'limit' | null>(null)

  const categories = useLiveQuery(() => db.categories.toArray(), [], [])
  const operations = useLiveQuery(() => db.operations.toArray(), [], [])
  const limits = useLiveQuery(() => db.limits.toArray(), [], [])
  const goals = useLiveQuery(() => db.goals.toArray(), [], [])

  const categoriesById = new Map(categories.map((c) => [c.id, c]))

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const monthOperations = operations.filter((op) => op.date >= monthStart)

  return (
    <div className="h-full overflow-y-auto p-4">
      <SectionHeader title="Цели" onAdd={() => setOpenSheet('goal')} />
      {goals.length === 0 ? (
        <EmptyHint text="Целей пока нет. Добавь цель, чтобы копить на что-то конкретное." />
      ) : (
        goals.map((goal) => (
          <ProgressCard
            key={goal.id}
            category={categoriesById.get(goal.categoryId)}
            // Цель копится всё время, а не сбрасывается каждый месяц.
            current={sumForCategory(operations, goal.categoryId)}
            target={goal.targetAmount}
            currentLabel="Накоплено"
          />
        ))
      )}

      <div className="mt-8">
        <SectionHeader title="Лимиты" onAdd={() => setOpenSheet('limit')} />
      </div>
      {limits.length === 0 ? (
        <EmptyHint text="Лимитов пока нет. Задай месячный лимит на категорию расходов." />
      ) : (
        limits.map((limit) => (
          <ProgressCard
            key={limit.id}
            category={categoriesById.get(limit.categoryId)}
            // Лимит месячный, поэтому считаем траты только с начала месяца.
            current={sumForCategory(monthOperations, limit.categoryId)}
            target={limit.amount}
            currentLabel="Потрачено"
            warnOnOverspend
          />
        ))
      )}

      {openSheet === 'goal' && (
        <AddGoalSheet onClose={() => setOpenSheet(null)} />
      )}
      {openSheet === 'limit' && (
        <AddLimitSheet onClose={() => setOpenSheet(null)} />
      )}
    </div>
  )
}

function sumForCategory(operations: Operation[], categoryId: number): number {
  return operations
    .filter((op) => op.type === 'expense' && op.categoryId === categoryId)
    .reduce((sum, op) => sum + op.amount, 0)
}

interface SectionHeaderProps {
  title: string
  onAdd: () => void
}

function SectionHeader({ title, onAdd }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-2">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Добавить: ${title}`}
        className="flex h-9 w-9 items-center justify-center rounded-full text-violet-600 active:bg-violet-50"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return <p className="py-4 text-sm text-slate-400">{text}</p>
}

interface ProgressCardProps {
  category?: Category
  current: number
  target: number
  currentLabel: string
  warnOnOverspend?: boolean
}

function ProgressCard({
  category,
  current,
  target,
  currentLabel,
  warnOnOverspend,
}: ProgressCardProps) {
  const ratio = target > 0 ? current / target : 0
  const isOver = ratio > 1
  const isClose = ratio >= 0.8 && !isOver

  const barColor = warnOnOverspend
    ? isOver
      ? 'bg-red-500'
      : isClose
        ? 'bg-amber-500'
        : 'bg-violet-600'
    : 'bg-violet-600'

  const amountColor = warnOnOverspend && isOver ? 'text-red-500' : 'text-slate-900'

  return (
    <div className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: `${category?.color ?? '#94a3b8'}1a` }}
        >
          {category?.icon ?? '❓'}
        </span>
        <span className="flex-1 font-medium text-slate-900">
          {category?.name ?? 'Категория удалена'}
        </span>
        <span className="text-sm text-slate-400">
          {Math.round(ratio * 100)} %
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.min(ratio, 1) * 100}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-slate-500">
        {currentLabel}{' '}
        <span className={amountColor}>{formatMoney(current)}</span> из{' '}
        {formatMoney(target)}
      </p>
    </div>
  )
}
