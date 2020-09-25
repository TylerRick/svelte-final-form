// Based on:
// - react-final-form/src/useFormState.js
// - react-final-form/src/ReactFinalForm.js
// Used by:
// - createForm
// - FormSpy

import { readable } from "svelte/store"
import { getForm, formAllSubscription } from '.'
import whenValueChanges from "./whenValueChanges"

/**
 * Returns a store containing the form state
 * @param {config} param0 
 */
const useFormState = ({
  onChange,
  subscription = formAllSubscription,
}) => {
  const form = getForm()
  const state = readable({}, set => {
    let unsubscribe

    const subscriber = (formState) => {
      // Docs: https://final-form.org/docs/final-form/types/FormState
      onChange && onChange(formState)
      set(formState)
    }

    // Docs: https://final-form.org/docs/final-form/types/FormApi#subscribe
    unsubscribe = form.subscribe(subscriber, subscription)

    const unsubscriptions = [
      unsubscribe,

    ]
    return () => {
      form.pauseValidation() // pause validation so we don't revalidate on every field deregistration
      unsubscriptions.reverse().forEach(unsubscribe => unsubscribe())
    }
  })

  // TODO:
  // const lazyState = {}
  // addLazyFormState(lazyState, state)

  return state
}

export default useFormState
