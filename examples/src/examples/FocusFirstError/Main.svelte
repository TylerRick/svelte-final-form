<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../../common'
  export const exampleMeta = {
    title: 'Focus On First Error',
    description: marked(`
Demonstrates how to use the [🏁 Final Form Focus 🧐](https://github.com/final-form/final-form-focus) library as a pluggable 🏁 Final Form decorator to provide "focus on first error" functionality.
Notice that when you click the Submit button, the focus is placed on the first field with an error.
`),
    compareTo: [
      {'react-final-form': {
        // Auto Sandbox supersedes this original Sandbox: https://codesandbox.io/s/6174kqr403
        sourceURL: 'https://github.com/final-form/react-final-form/tree/master/examples/focus-first-error',
      }},
    ],
    tags: [
      'decorators',
    ],
  }
</script>

<script>
  import { Form, Field } from "svelte-final-form"
  import InputRow from './InputRow.svelte'
  import create_focusOnError from 'final-form-focus'
  const focusOnError = create_focusOnError()
  import validate from './validate'

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const onSubmit = async values => {
    await sleep(300)
    window.alert(JSON.stringify(values, 0, 2))
  }
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  {@html marked(`
  `)}

  <Form
    {onSubmit}
    decorators={[focusOnError]}
    validate={validate}
    let:form
    let:state
  >
    <!-- render={({ handleSubmit, form, submitting, pristine, values }) => ( -->
    <form on:submit|preventDefault={form.submit}>
      <Field
        name="firstName"
        label="First Name"
        type="text"
        component={InputRow}
      />
      <Field
        name="lastName"
        label="Last Name"
        type="text"
        component={InputRow}
      />
      <Field
        name="street"
        label="Street"
        type="text"
        component={InputRow}
      />
      <Field name="age" label="Age" type="number" component={InputRow} />
      <div class="buttons">
        <button type="submit" disabled={state.submitting}>Submit</button>
        <button type="button" disabled={state.submitting || state.pristine} on:click={() => form.reset()}>Reset</button>
      </div>
    </form>
    <FormStateDebugInfo {state} />
  </Form>
</article>
