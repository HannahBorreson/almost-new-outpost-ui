// Small helpers so handlers read like controller actions:
//   return ok(products)      return problem(404, 'Product not found.')

export function ok(data) {
  return { status: 200, data }
}

export function created(data) {
  return { status: 201, data }
}

export function noContent() {
  return { status: 204, data: undefined }
}

// RFC 7807 ProblemDetails, the error shape ASP.NET Core returns.
// errors: { fieldName: ['message', ...] } for validation problems.
export function problem(status, title, errors) {
  const body = { type: `https://httpstatuses.io/${status}`, title, status }
  if (errors) body.errors = errors
  return { status, data: body }
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
