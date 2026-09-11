import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, type OperationType } from '../db/db'
import { formatMoney } from '../lib/format'
import { NumericKeypad } from './NumericKeypad'
import { PickerSheet } from './PickerSheet'

type SheetMode = OperationType | 'transfer'

const modeTabs: { id: SheetMode; label: string }[] = [
  { id: 'income', label: 'Доход' },
  { id: 'expense', label: 'Расход' },
  { id: 'transfer', label: 'Перевод' },
]

type OpenPicker = 'category' | 'account' | 'fromAccount' | 'toAccount' | null

interface AddOperationSheetProps {
  onClose: () => void
}

export function AddOperationSheet({ onClose }: AddOperationSheetProps) {
  const [mode, setMode] = useState<SheetMode>('expense')
  const [amountText, setAmountText] = useState('0')
  const [categoryId, setCategoryId] = useState<number>()
  const [accountId, setAccountId] = useState<number>()
  const [fromAccountId, setFromAccountId] = useState<number>()
  const [toAccountId, setToAccountId] = useState<number>()
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null)

  const accounts = useLiveQuery(() => db.accounts.toArray(), [], [])
  const categories = useLiveQuery(
    () => (mode === 'transfer' ? [] : db.categories.where('type').equals(mode).toArray()),
    [mode],
    [],
  )

  // Счёт по умолчанию — первый в списке, чтобы не заставлять выбирать его каждый раз.
  const selectedAccountId = accountId ?? accounts[0]?.id
  const selectedFromAccountId = fromAccountId ?? accounts[0]?.id

  const amount = Number(amountText.replace(',', '.'))
  const selectedCategory = categories.find((c) => c.id === categoryId)
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId)
  const selectedFromAccount = accounts.find((a) => a.id === selectedFromAccountId)
  const selectedToAccount = accounts.find((a) => a.id === toAccountId)

  // Условия вынесены в отдельные переменные не только ради читаемости:
  // так TypeScript внутри save() сам понимает, что нужные поля заполнены,
  // и не требует ручных проверок вроде categoryId!.
  const canSaveTransfer =
    amount > 0 &&
    selectedFromAccountId !== undefined &&
    toAccountId !== undefined &&
    selectedFromAccountId !== toAccountId

  const canSaveOperation =
    amount > 0 && categoryId !== undefined && selectedAccountId !== undefined

  const canSave = mode === 'transfer' ? canSaveTransfer : canSaveOperation

  const save = async () => {
    if (mode === 'transfer') {
      if (!canSaveTransfer) return
      await db.transfers.add({
        amount,
        fromAccountId: selectedFromAccountId,
        toAccountId,
        date: new Date(),
      })
    } else {
      if (!canSaveOperation) return
      await db.operations.add({
        type: mode,
        amount,
        categoryId,
        accountId: selectedAccountId,
        date: new Date(),
      })
    }
    onClose()
  }

  const changeMode = (nextMode: SheetMode) => {
    setMode(nextMode)
    // Категории у доходов и расходов разные, поэтому выбранную сбрасываем.
    setCategoryId(undefined)
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-white">
      <header className="flex shrink-0 items-center gap-2 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 active:bg-slate-100"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        <div className="flex flex-1 justify-center gap-5">
          {modeTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => changeMode(tab.id)}
              className={`border-b-2 pb-1 text-base transition-colors ${
                mode === tab.id
                  ? 'border-violet-600 font-medium text-slate-900'
                  : 'border-transparent text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          aria-label="Сохранить"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white disabled:bg-slate-200 disabled:text-slate-400"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4">
        {mode === 'transfer' ? (
          <div className="mt-2 flex items-stretch gap-3 rounded-2xl bg-slate-50 p-4">
            <button
              type="button"
              onClick={() => setOpenPicker('fromAccount')}
              className="flex-1 text-left"
            >
              <span className="block text-sm text-slate-500">
                {selectedFromAccount
                  ? `${selectedFromAccount.icon} ${selectedFromAccount.name}`
                  : 'Откуда'}
              </span>
              <span className="mt-1 block text-2xl text-slate-900">
                − {amountText} Br
              </span>
            </button>
            <div className="w-px bg-slate-200" />
            <button
              type="button"
              onClick={() => setOpenPicker('toAccount')}
              className="flex-1 text-right"
            >
              <span className="block text-sm text-slate-500">
                {selectedToAccount
                  ? `${selectedToAccount.icon} ${selectedToAccount.name}`
                  : 'Назначение'}
              </span>
              <span className="mt-1 block text-2xl text-slate-900">
                + {amountText} Br
              </span>
            </button>
          </div>
        ) : (
          <>
            <div className="mt-2 rounded-2xl bg-slate-50 px-4 py-6 text-right">
              <span className="text-4xl font-light text-slate-900">
                {mode === 'expense' ? '−' : '+'} {amountText} Br
              </span>
            </div>

            <FormRow
              label="Категория"
              onClick={() => setOpenPicker('category')}
              value={
                selectedCategory
                  ? `${selectedCategory.icon} ${selectedCategory.name}`
                  : 'Без категории'
              }
              isPlaceholder={!selectedCategory}
            />
            <FormRow
              label="Счёт"
              onClick={() => setOpenPicker('account')}
              value={
                selectedAccount
                  ? `${selectedAccount.icon} ${selectedAccount.name}`
                  : 'Выбрать'
              }
              isPlaceholder={!selectedAccount}
            />
          </>
        )}
      </div>

      <NumericKeypad value={amountText} onChange={setAmountText} />

      {openPicker === 'category' && (
        <PickerSheet
          title="Категория"
          items={categories.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
          }))}
          selectedId={categoryId}
          onSelect={(id) => {
            setCategoryId(id)
            setOpenPicker(null)
          }}
          onClose={() => setOpenPicker(null)}
        />
      )}

      {(openPicker === 'account' ||
        openPicker === 'fromAccount' ||
        openPicker === 'toAccount') && (
        <PickerSheet
          title="Счёт"
          items={accounts.map((a) => ({
            id: a.id,
            name: `${a.name} · ${formatMoney(a.startingBalance)}`,
            icon: a.icon,
            color: a.color,
          }))}
          selectedId={
            openPicker === 'account'
              ? selectedAccountId
              : openPicker === 'fromAccount'
                ? selectedFromAccountId
                : toAccountId
          }
          onSelect={(id) => {
            if (openPicker === 'account') setAccountId(id)
            else if (openPicker === 'fromAccount') setFromAccountId(id)
            else setToAccountId(id)
            setOpenPicker(null)
          }}
          onClose={() => setOpenPicker(null)}
        />
      )}
    </div>
  )
}

interface FormRowProps {
  label: string
  value: string
  isPlaceholder: boolean
  onClick: () => void
}

function FormRow({ label, value, isPlaceholder, onClick }: FormRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-slate-100 py-4 text-left active:bg-slate-50"
    >
      <span className="text-slate-400">{label}</span>
      <span className={isPlaceholder ? 'text-slate-400' : 'text-slate-900'}>
        {value}
      </span>
    </button>
  )
}
