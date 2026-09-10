// Общая форма для категории и счёта: пикеру не нужно знать, что именно
// он показывает, поэтому один компонент используется в обоих случаях.
export interface PickerItem {
  id: number
  name: string
  icon: string
  color: string
}

interface PickerSheetProps {
  title: string
  items: PickerItem[]
  selectedId?: number
  onSelect: (id: number) => void
  onClose: () => void
}

export function PickerSheet({
  title,
  items,
  selectedId,
  onSelect,
  onClose,
}: PickerSheetProps) {
  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-white">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
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
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </header>

      <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left active:bg-slate-50"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: `${item.color}1a` }}
            >
              {item.icon}
            </span>
            <span className="flex-1 text-slate-900">{item.name}</span>
            {item.id === selectedId && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-violet-600"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
