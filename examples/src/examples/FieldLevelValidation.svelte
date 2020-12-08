<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../common'
  export const exampleMeta = {
    title: 'Field-level validation',
    description: marked(`
A simple example with field-level validation.
`),
    compareTo: [
      {'react-final-form': {
        demoPage: 'https://final-form.org/docs/react-final-form/examples/field-level-validation',
        sourceURL: 'https://github.com/final-form/react-final-form/tree/master/examples/field-level-validation',
        directAdaptation: true,
      }}
    ],
    tags: [
      'field-level validation',
      'synchronous',
    ],
  }
</script>

<script>
  import { Form, Field } from "svelte-final-form"
  import { required, composeValidators } from '../common'
  import InputGroup from '../common/InputGroup.svelte'

  const onSubmit = async (values) => {
    console.log('submitted:', JSON.stringify(values, undefined, 2))
  };
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />

  <Form
    {onSubmit}
    let:form
    let:state
  >
    <form on:submit|preventDefault={form.submit}>

      <Field name="firstName" validate={required} let:field>
        <div>
          <InputGroup
            {field}
            type="text"
            label="First Name"
            placeholder="First Name"
          />
        </div>
      </Field>

      <Field name="lastName" validate={required} let:field>
        <div>
          <InputGroup
            {field}
            type="text"
            label="Last Name"
            placeholder="Last Name"
          />
        </div>
      </Field>


      <div>
        <button type="submit" disabled={state.submitting}>Submit</button>
        <button type="button" disabled={state.pristine} on:click={() => form.reset()}>Reset</button>
      </div>
    </form>

    <FormStateDebugInfo {state} />
  </Form>
</article>
