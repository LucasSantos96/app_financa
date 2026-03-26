export function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "")

  if (!digits) {
    return ""
  }

  const amount = Number(digits) / 100

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function parseCurrencyInput(value: string) {
  const cleaned = value.replace(/\s/g, "").replace(/[^\d,.-]/g, "")
  const normalized = cleaned.replace(/\./g, "").replace(",", ".")

  return Number.parseFloat(normalized)
}

export function formatNumberToCurrencyInput(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
