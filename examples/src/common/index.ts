export { default as ExampleHeader } from './ExampleHeader.svelte'
export { default as InputGroup } from './InputGroup.svelte'
export { default as ErrorMessages } from './ErrorMessages.svelte'
export { default as FormStateDebugInfo } from './FormStateDebugInfo.svelte'
export { default as Spinner } from './Spinner.svelte'
export * from './filterProps'

// Validators

export const required = value => (value ? undefined : "is required")

export const composeValidators = (...validators) => value =>
  validators.reduce((error, validator) => error || validator(value), undefined)
