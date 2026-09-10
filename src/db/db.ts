import Dexie, { type EntityTable } from 'dexie'

export type OperationType = 'expense' | 'income'

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
  date: Date
  note?: string
}

// Лимит хранится по одной строке на категорию (без месяца в ключе) —
// значит "лимит на еду" всегда одно и то же число, пока ты сам его не поменяешь.
export interface CategoryLimit {
  id?: number
  categoryId: number
  amount: number
}

class MoneyDatabase extends Dexie {
  categories!: EntityTable<Category, 'id'>
  operations!: EntityTable<Operation, 'id'>
  limits!: EntityTable<CategoryLimit, 'id'>

  constructor() {
    super('money-alex')

    // После списка полей через запятую идут проиндексированные поля —
    // по ним можно быстро искать/фильтровать (без индекса пришлось бы
    // перебирать все записи). '++id' — автоинкрементный первичный ключ.
    // '&categoryId' в limits — уникальный индекс: не даст создать два
    // лимита для одной категории.
    this.version(1).stores({
      categories: '++id, type',
      operations: '++id, categoryId, date, type',
      limits: '++id, &categoryId',
    })

    this.on('populate', () => this.seedDefaultCategories())
  }

  // Срабатывает один раз — только когда база создаётся с нуля на устройстве.
  private async seedDefaultCategories() {
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
