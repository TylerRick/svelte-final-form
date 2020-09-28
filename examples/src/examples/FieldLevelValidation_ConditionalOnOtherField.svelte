<script>
  import { onDestroy, onMount } from "svelte";
  import { Form, Field } from "svelte-final-form"
  import { required, composeValidators } from '../common'
  import FormGroup from '../common/FormGroup.svelte'
  import FormStateDebugInfo from '../common/FormStateDebugInfo.svelte'

  const onSubmit = (values) => {
    console.log('submitted:', JSON.stringify(values, undefined, 2))
  }
  const requiredIf = (condition) => {
    console.log('returning validator with condition:', (condition ?? '').length, !!condition)
    return (value) => {
      console.log('validating lastName:', (condition ?? '').length, !!condition, required(value))
      return !!condition && required(value)
    }
  }

  let firstName
</script>

<article class="final-form-example">
  <p>Shows how one field's validator can depend on another field's value.</p>
  <p>Warning: Updating the validate prop of a Field from its initial value has no effect. There's no way to change the getValidator config of a field after registered with registerField.</p>
  <p>Warning: If you try to reference state.values, directly in a validator function, to check another field's value, the value will be out of date.</p>
  <p>A workaround is to use bind:value to get an immediately-updated copy of the value that is not out of date.</p>
  <p>interesting: even though requiredIf returns the new validator function with correct condition, the
function that is actually evaluated (_before_ the new one is returned) is the stale one with the previous condition.</p>
  <p>I think this problem might be resolved if we change Field to resubscribe to/re-register field with the new validate function if its validate prop changes to a new function.</p>

  <Form
    {onSubmit}
    let:form
    let:state
  >
    <form on:submit|preventDefault={form.submit}>
      <Field name="firstName"
        let:field
      >
        <div>
          <FormGroup
            {field}
            type="text"
            label="First Name"
            placeholder="First Name"
            bind:value={firstName}
          />
        </div>
      </Field>
      <div>firstName: {firstName}</div>
      <div>state.values.firstName: {state.values.firstName}</div>
      <hr/>

      <Field name="lastName"
        data-validate={requiredIf(firstName)}
        validate={(value) => {
          // If you update firstName, then at the time this validate function is called, state.values.firstName will still return the old value.
          // console.log('validating lastName:', (state.values.firstName ?? '').length, !!state.values.firstName, required(value))
          console.log('validating lastName:', (state.values.firstName ?? '').length, (firstName ?? '').length, !!firstName, required(value))
          // return !!state.values.firstName && required(value)
          return !!firstName && required(value)
        }}
        let:field
      >
        <div>
          <FormGroup
            {field}
            type="text"
            label="Last Name"
            placeholder="Last Name (required if first name entered)"
          />
        </div>
        <div>Error on lastName (should show up immediately without waiting for lastName to be touched): {field.meta.error}</div>
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
