import { readable, derived } from "svelte/store"
import { fieldSubscriptionItems } from 'final-form'
import getValue from './getValue'

import { getForm } from './context'
// TODO: import { addLazyFieldMetaState } from './getters'

export const all = fieldSubscriptionItems.reduce((result, key) => {
  result[key] = true
  return result
}, {})

export const defaultFormat = (value) => value === undefined ? '' : value
export const defaultParse = (value) => value === '' ? undefined : value

// const defaultIsEqual = (a, b) => a === b

/**
 * Caveat: you can't change config after you've subscribed to the field using useField.
 * If you need a dynamic validate behavior, you have to extract the dynamicness out to a function, and statically pass that same function as the initial and immutable value of validate.
 * Example:
 *   $: maybeRequired = (value) => isRequired && required(value)
 * TODO: does react-final-form's field-level validate have the same limitation? seems like it would because registerField only called once with the initial value for validate.
 * TODO: demonstrate in example
 * @param {*} name 
 * @param {*} config 
 */
const useField = (
  name,
  config = {},
) => {
  // Docs: https://final-form.org/docs/react-final-form/types/FieldProps
  const {
    // TODO: use all these options that react-final-form has:
    // afterSubmit,
    // allowNull,
    // component,
    // data,
    // defaultValue,
    format = defaultFormat,
    // formatOnBlur,
    // initialValue,
    multiple,
    parse = defaultParse,
    subscription = all,
    type,
    // validateFields,
    value: _value,

    validate,
  } = config

  const form = getForm()
  // process is not defined in browser environment
  // process.env.NODE_ENV !== "production" &&
  if (!form) {
    throw new Error(
      "Could not find svelte-final-form context value. Please ensure that your Field is inside the Form component.",
    )
  }

  const store = readable({}, set => {
    let unsubscribe

    const subscriber = (fieldState) => {
      // Docs: https://final-form.org/docs/final-form/types/FieldState
      const {
        blur,
        change,
        focus,
        // eslint-disable-next-line no-shadow
        name,
        value,
        ...meta
      } = fieldState
      // console.log(`useField: new fieldState for ${name}`, fieldState)

      const input = {
        name,
        value: format(value),
      }
      if (multiple) {
        input.multiple = multiple
      }
      if (type !== undefined) {
        input.type = type
      }

      const handlers = {
        onBlur: blur,
        onChange: (event) => {
          // eslint-disable-next-line no-shadow
          const value = event && event.target
            ? getValue(event, fieldState.value, _value)
            : event
          change(parse(value, name))
        },
        onFocus: focus,
      }
      set({
        input,
        handlers,
        meta,
      })
    }

    // Docs: https://final-form.org/docs/final-form/types/FormApi#registerfield
    // console.log('useField: form.registerField', name)
    unsubscribe = form.registerField(
      name,
      subscriber,
      subscription,
      // Docs: https://final-form.org/docs/final-form/types/FieldConfig
      {
        getValidator: () => {
          // console.log(`getValidator for ${name}:`, validate)
          return validate
        },
      },
    )

    return () => {
      unsubscribe()
    }
  })


  store.input = derived(store, $store => $store.input)
  store.handlers = derived(store, $store => $store.handlers)
  store.meta = derived(store, $store => $store.meta)
  // TODO: Return [input, meta] to be consistent with how useForm returns [form, state] ? But that's a bit different since form is not a store; only state is a store. So already we have it consistent in that they both return only a single store.
  return store
}

export default useField
