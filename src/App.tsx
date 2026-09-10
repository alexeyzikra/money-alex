import { useState } from 'react'
import { BottomNav, type TabId } from './components/BottomNav'
import { OperationsScreen } from './screens/OperationsScreen'
import { PlanScreen } from './screens/PlanScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { StatisticsScreen } from './screens/StatisticsScreen'

function App() {
  // Простое переключение вкладок через состояние компонента, без роутера:
  // экранов немного и глубоких ссылок (типа "/operations/42") пока не нужно.
  // Если это изменится — добавим react-router.
  const [activeTab, setActiveTab] = useState<TabId>('operations')

  return (
    <div className="flex h-dvh flex-col bg-slate-50">
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'operations' && <OperationsScreen />}
        {activeTab === 'statistics' && <StatisticsScreen />}
        {activeTab === 'plan' && <PlanScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default App
