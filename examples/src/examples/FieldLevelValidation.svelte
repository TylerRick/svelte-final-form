<script>
  import { onDestroy, onMount } from "svelte";
  import { Form, Field } from "svelte-final-form"
  import { required, composeValidators } from '../common'
  import FormGroup from '../common/FormGroup.svelte'
  import FormStateDebugInfo from '../common/FormStateDebugInfo.svelte'

  const onSubmit = async (values) => {
    console.log('submitted:', JSON.stringify(values, undefined, 2))
  };
</script>

<article class="final-form-example">
  <p>A simple example with field-level validation.</p>
  <p>Compare to: https://final-form.org/docs/react-final-form/examples/field-level-validation</p>

  <Form
    {onSubmit}
    let:form
    let:state
  >
    <form on:submit|preventDefault={form.submit}>

      <Field name="firstName" validate={required} let:field>
        <div>
          <FormGroup
            {field}
            type="text"
            label="First Name"
            placeholder="First Name"
          />
        </div>
      </Field>

      <Field name="lastName" validate={required} let:field>
        <div>
          <FormGroup
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

    <pre>state.values: {JSON.stringify(state.values, null, 2)}</pre>
    <pre>state: {JSON.stringify(state, null, 2)}</pre>
  </Form>
</article>
