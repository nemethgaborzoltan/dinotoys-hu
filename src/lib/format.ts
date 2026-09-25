export const money = (value: number) =>
  new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0,
  }).format(value)

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)
