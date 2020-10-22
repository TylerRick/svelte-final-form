<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../../common'
  export const exampleMeta = {
    title: 'Field Warnings: using useFormState',
    description: marked(`
The same thing but using useFormState.
`),
    compareTo: [
      {variantOf: 'FieldWarnings'},
    ],
    tags: [
      'subscriptions ',
      'mutators',
      'warnings',
      'createForm',
      'useFormState',
    ],
  }
</script>

<script>
  import { createForm, useFormState, FormSpy, Field, Input } from "svelte-final-form"
  import setFieldData from "final-form-set-field-data"

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const onSubmit = async values => {
    await sleep(300)
    window.alert(JSON.stringify(values, 0, 2))
  }

  const [form, state] = createForm({
    onSubmit,
    mutators: { setFieldData },
  })
  const {submitting, pristine, values} = $state

  const warningStateStore = useFormState({
    // Unlike in the example this is based, subscribing to values is not enough, and the warning does not show up if you blur through the field.
    // Somehow subscribing to touched causes it to call this onChange, once for every field (as it is registered?):
    //   {}
    //   {firstName: false}
    //   {firstName: false, lastName: false}
    // Don't understand why subscribing to touched values doesn't *also* cause it to call this onChange once for every field as it is registered. But that might be why the original example warned:
    //   Note that the \`<WarningEngine/>\` component must be at the bottom of the form to guarantee that all the fields have registered.
    // Anyway, even though we don't use the value of touched in this function, subscribing to it, seems to be enough to get this to work as expected.
    subscription: { values: true, touched: true },
    onChange: ({ values, touched }) => {
      // console.log(values, touched)
      form.mutators.setFieldData("firstName", {
        warning: values.firstName ? undefined : "Recommended"
      })
      form.mutators.setFieldData("lastName", {
        warning: values.lastName ? undefined : "Recommended"
      })
    }
  })
  $: $warningStateStore
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  {@html marked(`
Demo instructions:
1. Tab through the fields without entering anything.
2. A warning, "Recommended", should show up by each field after you blur it.
  `)}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <form on:submit|preventDefault={form.submit}>
    <Field name="firstName" let:field>
      <div>
        <label>First Name</label>
        <Input {field} placeholder="First Name" />
        {#if field.meta.touched && field.meta.data.warning}
          <span>{field.meta.data.warning}</span>
        {/if}
      </div>
      <pre>{JSON.stringify({touched: field.meta.touched, data: field.meta.data}, 0, 2)}</pre>
    </Field>
    <Field name="lastName" let:field>
      <div>
        <label>Last Name</label>
        <Input {field} placeholder="Last Name" />
        {#if field.meta.touched && field.meta.data.warning}
          <span>{field.meta.data.warning}</span>
        {/if}
      </div>
      <pre>{JSON.stringify({touched: field.meta.touched, data: field.meta.data}, 0, 2)}</pre>
    </Field>
    <div className="buttons">
      <button type="submit" disabled={submitting}>
        Submit
      </button>
      <button
        type="button"
        onClick={form.reset}
        disabled={submitting || pristine}
      >
        Reset
      </button>
    </div>
    <pre>{JSON.stringify(values, 0, 2)}</pre>
  </form>
  <FormStateDebugInfo state={{submitting, pristine, values}} />
</article>
