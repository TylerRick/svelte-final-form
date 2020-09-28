<script context="module">
  export const description = `
    <p>This is an example of using useForm to create and subscribe to the form instead of wrapping your form in a &lt;Form> tag</p>
  `
</script>

<script>
  import { onDestroy, onMount } from "svelte";
  import { useForm, Field } from "svelte-final-form";
  import FormGroup from '../common/FormGroup.svelte'

  const initialValues = {
    // firstName: "Alexey",
    // lastName: "Solilin",
    // color: "Red",
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


  const [form, state] = useForm({
    onSubmit,
    validate,
    initialValues,
  })
</script>

<article class="final-form-example">
  {@html description}

  <form on:submit|preventDefault={form.submit}>
    <Field name="firstName" let:field>
      <div>
        <FormGroup
          {field}
          type="text"
          label="First Name"
          placeholder="First Name"
        />
      </div>
    </Field>

    <Field name="lastName" let:field>
      <div>
        <FormGroup
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
