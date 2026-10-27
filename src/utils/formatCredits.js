// 1250 -> "1,250 credits"
export function formatCredits(amount) {
  const number = Number(amount) || 0
  return `${number.toLocaleString()} ${number === 1 ? 'credit' : 'credits'}`
}
