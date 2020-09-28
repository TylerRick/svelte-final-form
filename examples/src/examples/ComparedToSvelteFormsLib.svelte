<script>
  import { Form, Field } from "svelte-final-form";

  // Just for example
  import Select from "svelte-select";
  // Your custom form group adapter
  import FormGroup from 'svelte_common/form/svelte-final-form/FormGroup.svelte'
  import ErrorMessagesIndependent from 'svelte_common/form/svelte-final-form/ErrorMessagesIndependent.svelte'
  import FieldSpy from 'svelte_common/form/svelte-final-form/FieldSpy.svelte'

  const selectItems = ["Green", "Red", "Black"];

  const initialValues = {
    // firstName: "Alexey",
    // lastName: "Solilin",
    // color: "Red",
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


  const getOptionLabel = (option, filterText) => {
    return option.isCreator ? `Add \"${filterText}\"` : option.label;
  };
</script>

<Form {onSubmit} {validate} {initialValues} let:form let:state>
  <form on:submit|preventDefault={form.submit}>
    <div>
      <Field name="firstName" let:field>
        <label for="firstName">First Name</label>
        <input
          name={input.name}
          on:blur={input.onBlur}
          on:focus={input.onFocus}
          on:input={(e) => { console.log('on:input', e.target.value); input.onChange(e.target.value) } }
          type="text"
          placeholder="First Name"
          value={input.value} />
        {#if false && meta.touched && meta.error}
          <div>{meta.error}</div>
        {/if}
      </Field>
      <!-- <FieldSpy name="firstName" /> -->
      <ErrorMessagesIndependent name="firstName" />
    </div>

    <!-- You can prepare your Form Group Adapter with Label, Input, Errors -->
    <Field name="lastName" let:field>
      <div>
        <FormGroup
          {input}
          {meta}
          label="Last Name"
          type="text"
          placeholder="Last Name"
        />
      </div>
    </Field>

    <!-- Example for svelte-select -->
    <Field name="color" let:field>
        <!-- on:blur={input.onBlur} -->
        <!-- on:focus={input.onFocus} -->
      <Select
        items={selectItems}
        on:select={({ detail }) => input.onChange(detail.value)}
        selectedValue={input.value}
        name="color"
        />
    </Field>
        <!-- isCreatable
        getOptionLabel -->

    <button type="submit" disabled={state.submitting}>Submit</button>
    or
    <button type="button" disabled={state.pristine} on:click={() => form.reset()}>Reset</button>
  </form>

  <pre>state.values: {JSON.stringify(state.values, null, 2)}</pre>
  <pre>state: {JSON.stringify(state, null, 2)}</pre>
</Form>
