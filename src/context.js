import { getContext, setContext } from "svelte";

export const key = {}

// Simple setter/getter

export const setForm = context => {
  setContext(key, context)
}

// Just a simple wrapper for getContext(key), in order to provide a single, easy [entrypoint] for any component/consumer needing to get this context value
// TODO: ... in order to provide an API matching react-final-form
// for those migrating from it.
// react-final-form is inconsistent:
// - createForm (which simply gets) is very unlike useField (which subscribes); therefore we rename it to getForm in this library to be internally consistent
// - Field is simply a trivial wrapper for useField
// - but Form is not simply a wrapper for createForm!!! in this library, it is!
// Also: useWhatever seems to be a svelte convention for returning a "whatever" store that you can subscribe to
export const getForm = () => {
  const form = getContext(key)

  if (!form) {
    throw new Error(
      "Could not find svelte-final-form context value. Please ensure that your Field is inside the Form component (or that you have used createForm directly).",
    )
  }

  return form
}
