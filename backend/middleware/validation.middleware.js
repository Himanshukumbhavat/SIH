export function validateBody(validator) {
  return (body) => validator(body)
}
