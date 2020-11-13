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
    allowNull,
    component,
    // data,
    // defaultValue,
    format = defaultFormat,
    formatOnBlur,
    // initialValue,
    multiple,
    parse = defaultParse,
    subscription = all,
    type,
    // validateFields,
    value: _value,  // Static value used for 'checkbox' and 'radio'

    validate,

    // TODO: rename to idFromName (boolean or function)
    setIdToName,
    // TODO: rename to idFrom
    // eslint-disable-next-line no-shadow
    getId = setIdToName ? ({ name }) => name : undefined,
    ...restProps  // Passed through to field.input
  } = config

  if (!name) {
    throw new Error('useField: name cannot be undefined')
  }
  if (type === 'radio' && _value === undefined) {
    throw new Error('useField: for type="radio", value cannot be undefined')
  }

  const form = getForm()

  let store = readable({}, set => {
    let unsubscribe

    const subscriber = (state) => {
      // Docs: https://final-form.org/docs/final-form/types/FieldState
      const {
        blur,
        change,
        focus,
        // eslint-disable-next-line no-shadow
        name,
        value,
        ...meta
      } = state
      // console.log(`useField: new state for ${name}`, state)

      // This allows us to more easily pass <label for={id}> so that we don't have to do extra work or disable this warning:
      //   <!-- svelte-ignore a11y-label-has-associated-control -->
      const id = restProps.id !== undefined
        ? restProps.id
        : getId ? getId(state) : undefined

      const input = {
        ...restProps,
        name,
        id,
        get value() {
          let formattedValue = value
          if (formatOnBlur) {
            if (component === 'input') {
              formattedValue = defaultFormat(formattedValue, name)
            }
          } else {
            formattedValue = format(formattedValue, name)
          }
          if (formattedValue === null && !allowNull) {
            formattedValue = ''
          }
          if (type === 'checkbox' || type === 'radio') {
            return _value
          } else if (component === 'select' && multiple) {
            return formattedValue || []
          }
          return formattedValue
        },
        get checked() {
          if (type === 'checkbox') {
            if (_value === undefined) {
              return !!state.value
            } else {
              return !!(Array.isArray(state.value) && ~state.value.indexOf(_value))
            }
          } else if (type === 'radio') {
            return state.value === _value
          }
          return undefined
        },
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
            ? getValue(event, state.value, _value)
            : event
          change(parse(value, name))
        },
        onFocus: focus,
      }
      set({
        input,
        handlers,
        meta,
        state,
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


  store = Object.assign(store, {
    input: derived(store, $store => $store.input),
    handlers: derived(store, $store => $store.handlers),
    meta: derived(store, $store => $store.meta),
    state: derived(store, $store => $store.state),
  })
  return store
}

export default useField
