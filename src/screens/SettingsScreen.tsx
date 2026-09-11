import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState } from 'react'
import { db } from '../db/db'
import { exportToFile, importFromFile } from '../lib/backup'
import { clearAllOperations, seedTestData } from '../lib/testData'

export function SettingsScreen() {
  const [status, setStatus] = useState<string>()
  const [error, setError] = useState<string>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const operationsCount = useLiveQuery(() => db.operations.count(), [], 0)

  const handleExport = async () => {
    setError(undefined)
    const count = await exportToFile()
    setStatus(`Файл сохранён, операций внутри: ${count}.`)
  }

  const handleImport = async (file: File) => {
    setStatus(undefined)
    setError(undefined)

    const confirmed = window.confirm(
      'Загрузка заменит все текущие данные: операции, категории, счета, лимиты и цели. Продолжить?',
    )
    if (!confirmed) return

    try {
      const result = await importFromFile(file)
      setStatus(
        `Загружено: операций ${result.operations}, категорий ${result.categories}, счетов ${result.accounts}, лимитов ${result.limits}, целей ${result.goals}.`,
      )
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : 'Не удалось прочитать файл.',
      )
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <h1 className="text-xl font-semibold text-slate-900">Настройки</h1>
      <p className="mt-2 text-slate-500">
        Здесь будут управление категориями (добавление/редактирование/удаление,
        иконка и цвет), счета и тема оформления.
      </p>

      <section className="mt-8">
        <h2 className="font-medium text-slate-900">Данные</h2>
        <p className="mt-1 text-sm text-slate-500">
          Записи хранятся только в этом браузере и никуда не отправляются.
          Сохраняй файл время от времени — это единственный способ не потерять их
          при смене телефона или очистке браузера.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl bg-violet-600 px-4 py-3 text-white active:bg-violet-700"
          >
            Сохранить в файл
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700 active:bg-slate-100"
          >
            Загрузить из файла
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              // Сбрасываем значение, иначе повторный выбор того же файла
              // не вызовет событие change.
              event.target.value = ''
              if (file) handleImport(file)
            }}
          />
        </div>

        {status && <p className="mt-3 text-sm text-green-700">{status}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

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
            className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700 active:bg-slate-100"
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
