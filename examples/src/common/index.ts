export { default as FormGroup } from './FormGroup.svelte'
export { default as ErrorMessages } from './ErrorMessages.svelte'
export * from './filterProps'

// Validators

export const required = value => (value ? undefined : "is required")

export const composeValidators = (...validators) => value =>
  validators.reduce((error, validator) => error || validator(value), undefined)
