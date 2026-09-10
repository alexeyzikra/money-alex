// Белорусский формат: пробел между тысячами, запятая перед копейками, суффикс Br.
export function formatMoney(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${formatted} Br`
}

// '−' здесь — типографский минус (U+2212), а не дефис: выглядит ровнее рядом с плюсом.
export function formatSignedMoney(amount: number): string {
  const sign = amount < 0 ? '−' : '+'
  return `${sign} ${formatMoney(amount)}`
}

// "Понедельник, 29 декабря 2025 г." — заголовок группы операций за день.
// Русская локаль сама дописывает "г." в конце, добавлять её вручную не нужно.
export function formatDateHeader(date: Date): string {
  const formatted = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}
