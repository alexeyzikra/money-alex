import Dexie, { type EntityTable } from 'dexie'

export type OperationType = 'expense' | 'income'

// Счёт — наличные, карта, банковский счёт и т.п. Каждая операция
// (доход/расход) и перевод привязаны к конкретному счёту.
export interface Account {
  id?: number
  name: string
  icon: string
  color: string
  startingBalance: number // сколько было на счету на момент его создания в приложении;
  // текущий остаток = startingBalance + сумма доходов − сумма расходов − переводы с этого счёта + переводы на этот счёт
}

// Категория — одновременно и статья расхода, и источник дохода
// (для дохода "категория" и есть "источник": Зарплата, Инвестиции, Подарки...).
export interface Category {
  id?: number
  name: string
  type: OperationType
  icon: string // эмодзи-заглушка, потом можно заменить на нормальные иконки
  color: string // hex-цвет для графиков и бейджей
}

export interface Operation {
  id?: number
  type: OperationType
  amount: number // в целых Br с копейками как обычное число, без разделения на минимальные единицы —
  // для личного трекера с не миллионами операций погрешность плавающей точки не накопится заметно
  categoryId: number
  accountId: number
  date: Date
  note?: string
}

// Перевод между своими счетами (например, снял наличку с карты) — не доход
// и не расход, поэтому хранится отдельно от Operation и не попадает
// в статистику доходов/расходов, только меняет остатки по счетам.
export interface Transfer {
  id?: number
  amount: number
  fromAccountId: number
  toAccountId: number
  date: Date
  note?: string
}

// Лимит хранится по одной строке на категорию (без месяца в ключе) —
// значит "лимит на еду" всегда одно и то же число, пока ты сам его не поменяешь.
// Названия у лимита нет: его роль играет название категории.
export interface CategoryLimit {
  id?: number
  categoryId: number
  amount: number
}

// Цель накопления. Под каждую цель создаётся своя категория расхода —
// откладывая деньги, ты записываешь расход в неё, и цель заполняется.
// Название, иконка и цвет живут на этой категории, здесь их дублировать не нужно.
export interface Goal {
  id?: number
  categoryId: number
  targetAmount: number
}

class MoneyDatabase extends Dexie {
  accounts!: EntityTable<Account, 'id'>
  categories!: EntityTable<Category, 'id'>
  operations!: EntityTable<Operation, 'id'>
  transfers!: EntityTable<Transfer, 'id'>
  limits!: EntityTable<CategoryLimit, 'id'>
  goals!: EntityTable<Goal, 'id'>

  constructor() {
    super('money-alex')

    // После списка полей через запятую идут проиндексированные поля —
    // по ним можно быстро искать/фильтровать (без индекса пришлось бы
    // перебирать все записи). '++id' — автоинкрементный первичный ключ.
    // '&categoryId' в limits — уникальный индекс: не даст создать два
    // лимита для одной категории.
    //
    // Реальных пользовательских данных ещё ни у кого нет (проект в самом
    // начале разработки), поэтому просто меняем version(1) напрямую.
    // Когда приложением кто-то уже пользуется, для изменений схемы нужно
    // добавлять version(2), version(3)... — иначе Dexie не поймёт, как
    // переложить уже сохранённые на устройстве данные в новую структуру.
    this.version(1).stores({
      accounts: '++id',
      categories: '++id, type',
      operations: '++id, accountId, categoryId, date, type',
      transfers: '++id, fromAccountId, toAccountId, date',
      limits: '++id, &categoryId',
      goals: '++id, &categoryId',
    })

    this.on('populate', () => this.seedDefaults())
  }

  // Срабатывает один раз — только когда база создаётся с нуля на устройстве.
  private async seedDefaults() {
    const defaultAccounts: Account[] = [
      { name: 'Наличные', icon: '💵', color: '#22c55e', startingBalance: 0 },
      { name: 'Карта', icon: '💳', color: '#3b82f6', startingBalance: 0 },
    ]
    await this.accounts.bulkAdd(defaultAccounts)

    const defaultCategories: Category[] = [
      { name: 'Еда', type: 'expense', icon: '🍔', color: '#f97316' },
      { name: 'Кафе и рестораны', type: 'expense', icon: '☕', color: '#d97706' },
      { name: 'Транспорт', type: 'expense', icon: '🚌', color: '#0ea5e9' },
      { name: 'Покупки', type: 'expense', icon: '🛍️', color: '#ec4899' },
      { name: 'Развлечения', type: 'expense', icon: '🎬', color: '#8b5cf6' },
      { name: 'Здоровье', type: 'expense', icon: '💊', color: '#10b981' },
      { name: 'Подписки', type: 'expense', icon: '🔁', color: '#6366f1' },
      { name: 'Алкоголь', type: 'expense', icon: '🍷', color: '#be123c' },
      { name: 'Прочее', type: 'expense', icon: '📦', color: '#64748b' },
      { name: 'Зарплата', type: 'income', icon: '💼', color: '#16a34a' },
      { name: 'Инвестиции', type: 'income', icon: '📈', color: '#059669' },
      { name: 'Подарки', type: 'income', icon: '🎁', color: '#e11d48' },
      { name: 'Прочее', type: 'income', icon: '💰', color: '#65a30d' },
    ]
    await this.categories.bulkAdd(defaultCategories)
  }
}

export const db = new MoneyDatabase()
