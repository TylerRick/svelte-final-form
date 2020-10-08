import { readable } from "svelte/store"

import { fieldSubscriptionItems } from 'final-form'

// import getValue from './getValue'
import useForm from './useForm'
// import { addLazyFieldMetaState } from './getters'

export const all = fieldSubscriptionItems.reduce((result, key) => {
  result[key] = true
  return result
}, {})

export const defaultFormat = (value) => value === undefined ? '' : value
export const defaultParse = (value) => value === '' ? undefined : value

// const defaultIsEqual = (a, b) => a === b

const useField = (
  name,
  config = {},
) => {
  // Docs: https://final-form.org/docs/react-final-form/types/FieldProps
  const {
    afterSubmit,
    allowNull,
    component,
    data,
    defaultValue,
    format = defaultFormat,
    formatOnBlur,
    initialValue,
    multiple,
    parse = defaultParse,
    subscription = all,
    type,
    validateFields,
    value: _value,

    validate,
  } = config

  const form = useForm()
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
        onBlur: blur,
        onChange: (val) => {
          change(parse(val, name))
        },
        onFocus: focus,
        value: format(value),
      }
      set({
        input,
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
        getValidator: () => validate,
      },
    )

    return () => {
      unsubscribe()
    }
  })

  return store
}

export default useField
