// Just a simple wrapper for getFormContext, in order to provide an API matching react-final-form
// for those migrating from it.

import { getFormContext } from './context'

const useForm = () => {
  const form = getFormContext()

  // process is not defined in browser environment
  // process.env.NODE_ENV !== "production" &&
  if (!form) {
    throw new Error(
      "Could not find svelte-final-form context value. Please ensure that your Field is inside the Form component.",
    )
  }

  return form
}

export default useForm
