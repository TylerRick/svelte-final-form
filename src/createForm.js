// This is the equivalent of useForm from react-final-form.
// Actually, it's the equivalent of <Form>, which is basically just a giant wrapper around a React
// context Provider, and useForm was just a tiny function that consumed that context in a consumer
// component.
// So *like* react-final-form, this is just a wrapper around a Svelte setContext.
// But unlike react-final-form, which *forces* you to wrap your form in <Form> (you can only use
// useForm in components that are children of that outer <Form>), this
// provides you with the choice to either create a form programmatically (with this
// createFormContext) *or* use the provided <Form> wrapper component.
//
// This does as much as possible that <Form>, including call onMount and onDestroy. There are only 2
// things that must be done from the scope of a component:
// - onUpdateState
// - whenInitialValuesChanges

import { onDestroy, onMount, setContext } from "svelte"
import { createForm, formSubscriptionItems } from "final-form"

import { setFormContext } from './context'
import whenValueChanges from "./whenValueChanges"
import shallowEqual from "./shallowEqual"

// TODO rename to just all like useField
export const allSubscription = () => {
  return formSubscriptionItems.reduce((result, key) => {
    result[key] = true
    return result
  }, {})
}
export const all = allSubscription

function useForm({
  subscription = allSubscription(),
  initialValues,
  ...restProps
}, onUpdateState) {

  let state = {}
  let unsubscribe

  const form = createForm({
    initialValues,
    ...restProps
  })

  setFormContext(form)

  onMount(() => {
    unsubscribe = form.subscribe(onUpdateState, subscription)
  })

  onDestroy(() => {
    unsubscribe && unsubscribe()
  })

  return [form, state]
}

export default useForm
