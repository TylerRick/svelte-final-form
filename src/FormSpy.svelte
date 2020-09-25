<script>
  import { getForm } from "./context"
  import useFormState from "./useFormState"
  import whenValueChanges from "./whenValueChanges"
  import shallowEqual from "./shallowEqual"

  export let subscription = undefined
  export let initialValues = undefined
  export let initialValuesEqual = shallowEqual
  export let keepDirtyOnReinitialize = undefined

  const form = getForm()
  const state = useFormState({
    subscription,
    initialValues,
    keepDirtyOnReinitialize,
    ...$$restProps
  })

  // TODO: Add more whenValueChanges calls for all config options like in react-final-form/src/ReactFinalForm.js
  const whenInitialValuesChanges = whenValueChanges(
    initialValues,
    () => form.setConfig("initialValues", initialValues),
    initialValuesEqual,
  )
  $: whenInitialValuesChanges(initialValues)

  const whenKeepDirtyOnReinitializeChanges = whenValueChanges(
    keepDirtyOnReinitialize,
    () => form.setConfig("keepDirtyOnReinitialize", keepDirtyOnReinitialize),
  )
  $: whenKeepDirtyOnReinitializeChanges(keepDirtyOnReinitialize)
</script>

<slot {form} state={$state} />
