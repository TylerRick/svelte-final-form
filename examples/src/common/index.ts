export { default as ExampleHeader } from './ExampleHeader.svelte'
export { default as InputGroup } from './InputGroup.svelte'
export { default as FieldErrors } from './FieldErrors.svelte'
export { default as FormStateDebugInfo } from './FormStateDebugInfo.svelte'
export { default as Spinner } from './Spinner.svelte'
export * from './filterProps'
export * from './svelte-material-ui'

// Validators

export const required = value => (value && (!Array.isArray(value) || value.length)  ? undefined : "is required")

export const composeValidators = (...validators) => value =>
  validators.reduce((error, validator) => error || validator(value), undefined)
