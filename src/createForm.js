// Creates *and subscribes to!!* a final-form form.
// This simply wraps the upstream (final-form) createForm and provides the created form via context


// Actually, it's the equivalent of <Form>, which is basically just a giant wrapper around a React
// context Provider, and createForm was just a tiny function that consumed that context in a consumer
// component.
// So *like* react-final-form, this is just a wrapper around a Svelte setContext.
// But unlike react-final-form, which *forces* you to wrap your form in <Form> (you can only use
// createForm in components that are children of that outer <Form>), this
// provides you with the choice to either create a form programmatically (with this
// createFormContext) *or* use the provided <Form> wrapper component.
//
// This does as much as possible that <Form> does, including call onMount and onDestroy. There are only 2
// things that must be done from the scope of a component:
// - onUpdateState
// - whenInitialValuesChanges


// Was in createFormContext
// This simply wraps the upstream (final-form) createForm and provides the created form via context
// (and also as the return value so you can use it immediately).
//
// Analogous to initClient in urql/packages/svelte-urql/src/context.ts
//
// Useful when you want to go bare-metal and need the form object available in the script section of
// your component and therefore can't simply wrap your template contents in <Form>.
//
// This also allows an easier migration path for those coming from svelt-forms-lib, etc. where they
// are already used to calling createForm in the <script> section of their component.


import { readable } from "svelte/store"
import { createForm as FinalForm_createForm, formSubscriptionItems } from "final-form"
import { setForm } from '.'
import useFormState from "./useFormState"

export const all = formSubscriptionItems.reduce((result, key) => {
  result[key] = true
  return result
}, {})

/**
 * @param {*} param0 
 * @returns [form, state]. state is a store.
 */
const createForm = ({
  decorators = [],
  subscription = all,
  initialValues,
  ...restProps
}) => {
  // Docs: https://final-form.org/docs/final-form/api#createform
  // Docs: https://final-form.org/docs/final-form/types/Config
  const form = FinalForm_createForm({
    initialValues,
    ...restProps
  })
  setForm(form)

  // Subscribe to form's state
  const stateStore = useFormState(subscription)

  // Wrap the state store so that we can use its unsubscribe callback to unsubscribe all decorators.
  const state = readable(undefined, set => {
    const unsubscriptions = [
      // Pass through the main state store
      stateStore.subscribe(value => set(value)),

      ...decorators.map(decorator =>
        decorator(form)
      )
    ]

    return () => {
      form.pauseValidation() // Pause validation so we don't revalidate on every field deregistration
      unsubscriptions.reverse().forEach(unsubscribe => unsubscribe())
    }
  })

  return [form, state]
}

export default createForm
