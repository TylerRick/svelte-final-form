// Creates *and subscribes to!!* a final-form form.
// This simply wraps the upstream (final-form) createForm and provides the created form via context
// NO: This is the equivalent of useForm from react-final-form.
// Yes: getForm is the equivalent of useForm from react-final-form.
//
// svelte-final-form  | react-final-form equivalent |
// useForm            | <Form>           | Creates *and subscribes to* a final-form form.
// <Field>            | <Field>          | Creates *and subscribes to* a final-form form. (Wrapper for useForm.)
// getForm            | useForm          | Gets the current form from context.
// useField           | <Field>          | Creates *and subscribes to* a final-form field.
// <Field>            | <Field>          | Creates *and subscribes to* a final-form field. (Wrapper for useField.)

// Actually, it's the equivalent of <Form>, which is basically just a giant wrapper around a React
// context Provider, and useForm was just a tiny function that consumed that context in a consumer
// component.
// So *like* react-final-form, this is just a wrapper around a Svelte setContext.
// But unlike react-final-form, which *forces* you to wrap your form in <Form> (you can only use
// useForm in components that are children of that outer <Form>), this
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


import { createForm, formSubscriptionItems } from "final-form"
import { readable } from "svelte/store"
import { setForm } from '.'

export const all = formSubscriptionItems.reduce((result, key) => {
  result[key] = true
  return result
}, {})

/**
 * One important difference from <Form> is that <Form> auto-subscribes to the state store so you don't have to use $state within <Form let:state>.
 * TODO: But maybe we should change it to simply pass through the state store as-is and use $state to be consistent. This would also make it clear that you are _subscribing_ to it.
 * @param {*} param0 
 * @returns [form, state]. state is a store.
 */
const useForm = ({
  subscription = all,
  initialValues,
  ...restProps
}) => {
  // Docs: https://final-form.org/docs/final-form/api#createform
  // Docs: https://final-form.org/docs/final-form/types/Config
  const form = createForm({
    initialValues,
    ...restProps
  })

  const state = readable({}, set => {
    let unsubscribe

    const subscriber = (formState) => {
      // Docs: https://final-form.org/docs/final-form/types/FormState
      set(formState)
    }

    // Docs: https://final-form.org/docs/final-form/types/FormApi#subscribe
    unsubscribe = form.subscribe(subscriber, subscription)

    return () => {
      unsubscribe()
    }
  })

  setForm(form)
  return [form, state]
}

export default useForm
