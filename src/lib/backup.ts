import {
  db,
  type Account,
  type Category,
  type CategoryLimit,
  type Goal,
  type Operation,
  type Transfer,
} from '../db/db'

// Номер версии формата файла. Если структура данных когда-нибудь изменится,
// по нему можно будет понять, как читать старые выгрузки.
const BACKUP_VERSION = 1

interface BackupFile {
  version: number
  exportedAt: string
  accounts: Account[]
  categories: Category[]
  operations: Operation[]
  transfers: Transfer[]
  limits: CategoryLimit[]
  goals: Goal[]
}

export async function exportToFile() {
  const [accounts, categories, operations, transfers, limits, goals] =
    await Promise.all([
      db.accounts.toArray(),
      db.categories.toArray(),
      db.operations.toArray(),
      db.transfers.toArray(),
      db.limits.toArray(),
      db.goals.toArray(),
    ])

  const backup: BackupFile = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    accounts,
    categories,
    operations,
    transfers,
    limits,
    goals,
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `money-alex-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)

  return operations.length
}

export interface ImportResult {
  accounts: number
  categories: number
  operations: number
  transfers: number
  limits: number
  goals: number
}

export async function importFromFile(file: File): Promise<ImportResult> {
  const backup = parseBackup(await file.text())

  // JSON не умеет хранить даты, они приезжают строками — возвращаем их в Date,
  // иначе сортировка и фильтры по периоду сломаются.
  const operations = backup.operations.map((op) => ({
    ...op,
    date: new Date(op.date),
  }))
  const transfers = backup.transfers.map((transfer) => ({
    ...transfer,
    date: new Date(transfer.date),
  }))

  // Всё заменяется целиком и в одной транзакции: либо загрузились все таблицы,
  // либо не изменилось ничего. Иначе при сбое посреди импорта остались бы
  // операции, ссылающиеся на несуществующие категории.
  await db.transaction(
    'rw',
    [db.accounts, db.categories, db.operations, db.transfers, db.limits, db.goals],
    async () => {
      await Promise.all([
        db.accounts.clear(),
        db.categories.clear(),
        db.operations.clear(),
        db.transfers.clear(),
        db.limits.clear(),
        db.goals.clear(),
      ])
      await Promise.all([
        db.accounts.bulkAdd(backup.accounts),
        db.categories.bulkAdd(backup.categories),
        db.operations.bulkAdd(operations),
        db.transfers.bulkAdd(transfers),
        db.limits.bulkAdd(backup.limits),
        db.goals.bulkAdd(backup.goals),
      ])
    },
  )

  return {
    accounts: backup.accounts.length,
    categories: backup.categories.length,
    operations: operations.length,
    transfers: transfers.length,
    limits: backup.limits.length,
    goals: backup.goals.length,
  }
}

// Файл выбирает человек, и там может оказаться что угодно — проверяем,
// что это действительно наша выгрузка, до того как стирать текущие данные.
function parseBackup(text: string): BackupFile {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Это не файл с данными: не удалось прочитать JSON.')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Это не файл с данными приложения.')
  }

  const backup = parsed as Partial<BackupFile>
  const tables = [
    'accounts',
    'categories',
    'operations',
    'transfers',
    'limits',
    'goals',
  ] as const

  for (const table of tables) {
    if (!Array.isArray(backup[table])) {
      throw new Error(`Это не файл с данными приложения: нет раздела "${table}".`)
    }
  }

  if (backup.version !== BACKUP_VERSION) {
    throw new Error(
      `Файл сделан другой версией приложения (формат ${backup.version}, нужен ${BACKUP_VERSION}).`,
    )
  }

  return backup as BackupFile
}
