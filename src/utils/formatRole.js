// "MerchantAdmin" -> "Merchant Admin"
export function formatRole(role) {
  return (role || '').replace(/([a-z])([A-Z])/g, '$1 $2')
}
