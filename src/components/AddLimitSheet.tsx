import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '../db/db'
import { PickerSheet } from './PickerSheet'
import { SheetHeader } from './SheetHeader'

interface AddLimitSheetProps {
  onClose: () => void
}

export function AddLimitSheet({ onClose }: AddLimitSheetProps) {
  const [categoryId, setCategoryId] = useState<number>()
  const [amountText, setAmountText] = useState('')
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  // Показываем только расходные категории, у которых лимита ещё нет:
  // в базе стоит уникальный индекс, второй лимит на ту же категорию не создать.
  const availableCategories = useLiveQuery(async () => {
    const [categories, limits, goals] = await Promise.all([
      db.categories.where('type').equals('expense').toArray(),
      db.limits.toArray(),
      db.goals.toArray(),
    ])
    const taken = new Set([
      ...limits.map((l) => l.categoryId),
      ...goals.map((g) => g.categoryId),
    ])
    return categories.filter((c) => !taken.has(c.id))
  }, [], [])

  const amount = Number(amountText.replace(',', '.'))
  const selectedCategory = availableCategories.find((c) => c.id === categoryId)
  const canSave = amount > 0 && categoryId !== undefined

  const save = async () => {
    if (!canSave) return
    await db.limits.add({ categoryId, amount })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-white">
      <SheetHeader
        title="Новый лимит"
        canSave={canSave}
        onSave={save}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-4">
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="flex w-full items-center justify-between border-b border-slate-100 py-4 text-left active:bg-slate-50"
        >
          <span className="text-slate-400">Категория</span>
          <span className={selectedCategory ? 'text-slate-900' : 'text-slate-400'}>
            {selectedCategory
              ? `${selectedCategory.icon} ${selectedCategory.name}`
              : 'Выбрать'}
          </span>
        </button>

        <label className="flex items-center justify-between border-b border-slate-100 py-4">
          <span className="text-slate-400">Лимит в месяц</span>
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
      </div>

      {isPickerOpen && (
        <PickerSheet
          title="Категория"
          items={availableCategories.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
          }))}
          selectedId={categoryId}
          onSelect={(id) => {
            setCategoryId(id)
            setIsPickerOpen(false)
          }}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  )
}
