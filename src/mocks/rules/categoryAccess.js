// Mirrors the server's CategoryAccessPolicy: which roles may buy which categories.
// Delete this file once the real API is in use.

const allowedCategoriesByRole = {
  Citizen: ['Basic'],
  Scout: ['Basic', 'Exploration'],
  Medic: ['Basic', 'Medical'],
  Security: ['Basic', 'Security'],
  MerchantAdmin: ['Basic', 'Exploration', 'Medical', 'Security'],
}

export function canRoleBuyCategory(role, categoryName) {
  const allowed = allowedCategoriesByRole[role] || []
  return allowed.includes(categoryName)
}
