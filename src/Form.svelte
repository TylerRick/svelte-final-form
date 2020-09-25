<script>
  import { onDestroy, onMount } from "svelte"
  import { formSubscriptionItems } from "final-form"

  import createForm from "./createForm"
  import whenValueChanges from "./whenValueChanges"
  import shallowEqual from "./shallowEqual"

  export let subscription = undefined
  export let initialValues
  export let initialValuesEqual

  let state = {}

  const form = createForm(
    {
      subscription,
      initialValues,
      ...$$restProps
    },
    (newState) => {
      state = newState
    }
  )

  const whenInitialValuesChanges = whenValueChanges(
    initialValues,
    () => form.setConfig("initialValues", initialValues),
    initialValuesEqual || shallowEqual,
  )

  $: whenInitialValuesChanges(initialValues)
</script>

<slot {form} {state} />
