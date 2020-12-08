<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../common'
  export const exampleMeta = {
    title: 'Main — the main example from the Readme',
    description: marked(`
Demonstrates basic usage. Also, an example of integrating with [svelte-select](https://github.com/rob-balfre/svelte-select).
`),
    compareTo: [],
    tags: [
    ],
  }
</script>

<script>
  import InputGroup from '../common/InputGroup.svelte'
  // Copied from Readme:

  import { Form, Field } from "svelte-final-form";

  // Just for example
  import Select from "svelte-select";
  // Your custom form group adapter
  // import InputGroup from "components/InputGroup";

  const selectItems = ["Green", "Red", "Black"];

  const initialValues = {
    firstName: "Alexey",
    lastName: "Solilin",
    color: "Red",
  };

  const onSubmit = async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(JSON.stringify(values, undefined, 2));
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
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  {@html marked(`
Submit the form, then check the console to see what values were submitted.
  `)}

<Form {onSubmit} {validate} {initialValues} let:form let:state>
  <form on:submit|preventDefault={form.submit}>
    <Field name="firstName" let:field={{input, handlers, meta}}>
      <label for="firstName">First Name</label>
      <input
        name={input.name}
        value={input.value}
        on:blur={handlers.blur}
        on:focus={handlers.focus}
        on:input={(e) => handlers.change(e.target.value)}
        type="text"
        placeholder="First Name"
      />
      {#if meta.touched && meta.error}
        <div>{meta.error}</div>
      {/if}
    </Field>

    <!-- You can prepare you Form Group Adapter with Label, Input, Errors -->
    <Field name="lastName" let:field>
      <InputGroup label="Last Name" type="text" {field} />
    </Field>

    <!-- Example for svelte-select -->
    <Field name="color" let:field={{input, handlers}}>
      <Select
        items={selectItems}
        selectedValue={input.value}
        on:blur={handlers.blur}
        on:focus={handlers.focus}
        on:select={({ detail }) => handlers.change(detail.value)}
      />
    </Field>

    <button type="submit" disabled={state.submitting}>Submit</button>
    or
    <button type="button" disabled={state.pristine} on:click={() => form.reset()}>Reset</button>
  </form>
  <FormStateDebugInfo {state} />
</Form>
</article>
