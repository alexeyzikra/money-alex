import { useState } from 'react'
import { db } from '../db/db'
import { SheetHeader } from './SheetHeader'

const goalColors = ['#8b5cf6', '#0ea5e9', '#14b8a6', '#ec4899', '#f59e0b']

interface AddGoalSheetProps {
  onClose: () => void
}

export function AddGoalSheet({ onClose }: AddGoalSheetProps) {
  const [name, setName] = useState('')
  const [amountText, setAmountText] = useState('')

  const targetAmount = Number(amountText.replace(',', '.'))
  const canSave = targetAmount > 0 && name.trim().length > 0

  const save = async () => {
    if (!canSave) return

    // Категория и цель создаются вместе: если что-то упадёт посередине,
    // транзакция откатится целиком и "бесхозной" категории не останется.
    await db.transaction('rw', db.categories, db.goals, async () => {
      const goalCount = await db.goals.count()
      const categoryId = await db.categories.add({
        name: name.trim(),
        type: 'expense',
        icon: '🎯',
        color: goalColors[goalCount % goalColors.length],
      })
      await db.goals.add({ categoryId, targetAmount })
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-white">
      <SheetHeader
        title="Новая цель"
        canSave={canSave}
        onSave={save}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-4">
        <label className="flex items-center justify-between border-b border-slate-100 py-4">
          <span className="shrink-0 text-slate-400">Название</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например, Санкт-Петербург"
            className="min-w-0 flex-1 bg-transparent text-right text-slate-900 outline-none"
          />
        </label>

        <label className="flex items-center justify-between border-b border-slate-100 py-4">
          <span className="text-slate-400">Хочу накопить</span>
          <span className="flex items-baseline gap-1">
            <input
              type="text"
              inputMode="decimal"
              value={amountText}
              onChange={(event) => setAmountText(event.target.value)}
              placeholder="0"
              className="w-28 bg-transparent text-right text-slate-900 outline-none"
            />
            <span className="text-slate-400">Br</span>
          </span>
        </label>

        <p className="mt-4 text-sm text-slate-400">
          Под цель создастся своя категория расхода. Чтобы отложить деньги,
          добавь расход в эту категорию — цель заполнится.
        </p>
      </div>
    </div>
  )
}
