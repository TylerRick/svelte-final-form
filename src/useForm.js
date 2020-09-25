// Just a simple wrapper for getFormContext, in order to provide an API matching react-final-form
// for those migrating from it.

import { getFormContext } from './context'

const useForm = () => {
  const form = getFormContext()

  if (process.env.NODE_ENV !== "production" && !form) {
    throw new Error(
      "Could not find svelte-final-form context value. Please ensure that your Field is inside the Form component.",
    )
  }

  return form
}

export default useForm
