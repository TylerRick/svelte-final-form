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
import { setFormContext } from './context'

function createFormContext({
  initialValues,
  ...restProps
}) {
  const form = createForm({ initialValues, ...restProps })

  setFormContext(form)

  return form
}

export default createFormContext
