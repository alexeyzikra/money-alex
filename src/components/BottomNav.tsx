import type { ReactNode } from 'react'

// Список экранов приложения. Строковый union-тип (не enum — в TS так принято)
// не даёт передать "operation" вместо "operations" и т.п.
export type TabId = 'operations' | 'statistics' | 'plan' | 'settings'

interface Tab {
  id: TabId
  label: string
  icon: ReactNode
}

const tabs: Tab[] = [
  { id: 'operations', label: 'Операции', icon: <ListIcon /> },
  { id: 'statistics', label: 'Статистика', icon: <ChartIcon /> },
  { id: 'plan', label: 'План', icon: <TargetIcon /> },
  { id: 'settings', label: 'Настройки', icon: <SettingsIcon /> },
]

interface BottomNavProps {
  activeTab: TabId
  onChange: (tab: TabId) => void
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="flex shrink-0 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
              isActive ? 'text-violet-600' : 'text-slate-400'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

// Иконки — временные простые заглушки (одна и та же обводка currentColor,
// чтобы подхватывать цвет активной/неактивной вкладки). Заменим их,
// когда дойдём до проработки дизайна по твоим референсам.

function ListIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="14" y2="18" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="10" width="4" height="8" rx="1" />
      <rect x="10" y="5" width="4" height="13" rx="1" />
      <rect x="16" y="13" width="4" height="5" rx="1" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="15" cy="6" r="2" fill="white" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="9" cy="12" r="2" fill="white" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="17" cy="18" r="2" fill="white" />
    </svg>
  )
}
