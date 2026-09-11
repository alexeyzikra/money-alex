import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { clearAllOperations, seedTestData } from '../lib/testData'

export function SettingsScreen() {
  const operationsCount = useLiveQuery(() => db.operations.count(), [], 0)

  return (
    <div className="h-full overflow-y-auto p-4">
      <h1 className="text-xl font-semibold text-slate-900">Настройки</h1>
      <p className="mt-2 text-slate-500">
        Здесь будут управление категориями (добавление/редактирование/удаление,
        иконка и цвет), счета и тема оформления.
      </p>

      <section className="mt-8 rounded-2xl border border-dashed border-slate-300 p-4">
        <h2 className="font-medium text-slate-900">Тестовые данные</h2>
        <p className="mt-1 text-sm text-slate-500">
          Временный блок для разработки. Сейчас в базе операций:{' '}
          {operationsCount}.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => seedTestData()}
            className="rounded-xl bg-violet-600 px-4 py-3 text-white active:bg-violet-700"
          >
            Заполнить тестовыми данными
          </button>
          <button
            type="button"
            onClick={() => clearAllOperations()}
            className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700 active:bg-slate-100"
          >
            Удалить все операции
          </button>
        </div>
      </section>
    </div>
  )
}
