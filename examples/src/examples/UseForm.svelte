<script context="module">
  import marked from 'marked'
  export const exampleMeta = {
    title: 'Using createForm directly instead of &lt;Form>',
    description: marked(`
This is an example of using createForm to create and subscribe to the form instead of wrapping your form in a &lt;Form> component.
`),
  }
</script>

<script>
  import { createForm, Field } from "svelte-final-form";
  import InputGroup from '../common/InputGroup.svelte'

  const initialValues = {
  };

  const onSubmit = async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('submitted:', JSON.stringify(values, undefined, 2));
  };

  const validate = (values) => {
    const errors = {};
    if (!values.firstName) {
      errors.firstName = "Required";
    }
    if (!values.lastName) {
      errors.lastName = "Required";
    }
    return errors;
  };


  const [form, state] = createForm({
    onSubmit,
    validate,
    initialValues,
  })
</script>

<article class="final-form-example">
  {@html marked(`
# ${exampleMeta.title}

${exampleMeta.description}
`)}

  <form on:submit|preventDefault={form.submit}>
    <Field name="firstName" let:field>
      <div>
        <InputGroup
          {field}
          type="text"
          label="First Name"
          placeholder="First Name"
        />
      </div>
    </Field>

    <Field name="lastName" let:field>
      <div>
        <InputGroup
          {field}
          type="text"
          label="Last Name"
          placeholder="Last Name"
        />
      </div>
    </Field>

    <button type="submit" disabled={$state.submitting}>Submit</button>
    or
    <button type="button" disabled={$state.pristine} on:click={() => form.reset()}>Reset</button>
  </form>

  <pre>$state.values: {JSON.stringify($state.values, null, 2)}</pre>
  <pre>$state: {JSON.stringify($state, null, 2)}</pre>
</article>
