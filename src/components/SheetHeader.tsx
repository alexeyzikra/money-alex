interface SheetHeaderProps {
  title: string
  canSave: boolean
  onSave: () => void
  onClose: () => void
}

export function SheetHeader({
  title,
  canSave,
  onSave,
  onClose,
}: SheetHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
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

      <h2 className="flex-1 text-center text-base font-medium text-slate-900">
        {title}
      </h2>

      <button
        type="button"
        onClick={onSave}
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
  )
}
