import { db } from '../db/db'

// Временный генератор данных для разработки — чтобы было на чём смотреть
// графики, пока приложение не используется по-настоящему. Удалим, когда
// начнёшь вести реальный учёт.

interface CategoryPlan {
  name: string
  minAmount: number
  maxAmount: number
  perMonth: number
}

const expensePlans: CategoryPlan[] = [
  { name: 'Еда', minAmount: 15, maxAmount: 70, perMonth: 8 },
  { name: 'Кафе и рестораны', minAmount: 8, maxAmount: 45, perMonth: 6 },
  { name: 'Транспорт', minAmount: 1, maxAmount: 12, perMonth: 12 },
  { name: 'Покупки', minAmount: 20, maxAmount: 180, perMonth: 2 },
  { name: 'Развлечения', minAmount: 10, maxAmount: 60, perMonth: 3 },
  { name: 'Здоровье', minAmount: 12, maxAmount: 90, perMonth: 1 },
  { name: 'Подписки', minAmount: 5, maxAmount: 20, perMonth: 3 },
  { name: 'Алкоголь', minAmount: 10, maxAmount: 40, perMonth: 2 },
  { name: 'Прочее', minAmount: 5, maxAmount: 35, perMonth: 2 },
]

const incomePlans: CategoryPlan[] = [
  { name: 'Зарплата', minAmount: 900, maxAmount: 1400, perMonth: 1 },
  { name: 'Инвестиции', minAmount: 20, maxAmount: 120, perMonth: 1 },
  { name: 'Подарки', minAmount: 30, maxAmount: 200, perMonth: 1 },
  { name: 'Прочее', minAmount: 25, maxAmount: 90, perMonth: 1 },
]

const MONTHS_BACK = 4

function randomBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100
}

function randomDateInMonth(monthsAgo: number): Date {
  const now = new Date()
  const month = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate()
  // В текущем месяце не выходим за сегодняшний день, чтобы не было операций из будущего.
  const maxDay = monthsAgo === 0 ? now.getDate() : daysInMonth
  const day = 1 + Math.floor(Math.random() * maxDay)
  return new Date(month.getFullYear(), month.getMonth(), day, 12, 0)
}

export async function seedTestData() {
  const categories = await db.categories.toArray()
  const accounts = await db.accounts.toArray()
  if (accounts.length === 0) return

  const operations = []
  for (const [type, plans] of [
    ['expense', expensePlans],
    ['income', incomePlans],
  ] as const) {
    for (const plan of plans) {
      const category = categories.find(
        (c) => c.name === plan.name && c.type === type,
      )
      if (!category) continue

      for (let monthsAgo = 0; monthsAgo < MONTHS_BACK; monthsAgo++) {
        for (let i = 0; i < plan.perMonth; i++) {
          operations.push({
            type,
            amount: randomBetween(plan.minAmount, plan.maxAmount),
            categoryId: category.id!,
            accountId: accounts[i % accounts.length].id!,
            date: randomDateInMonth(monthsAgo),
          })
        }
      }
    }
  }

  await db.operations.bulkAdd(operations)
}

export async function clearAllOperations() {
  await db.operations.clear()
  await db.transfers.clear()
}
