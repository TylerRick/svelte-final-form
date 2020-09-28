<script>
  import { Form, Field, FieldArray } from 'svelte-final-form'
  import FormStateDebugInfo from '../../common/FormStateDebugInfo.svelte'

  import arrayMutators from 'final-form-arrays'

  const initialValues = {
    users: [
      {name: 'user 1'},
      {name: 'user 2'},
    ]
  }

  const onSubmit = async (values) => {
    console.log(JSON.stringify(values, undefined, 2))
  }
</script>

<article class="final-form-example">
  <p>Compare to:
    https://github.com/final-form/react-final-form/tree/master/examples/field-arrays
    https://codesandbox.io/s/github/final-form/react-final-form/tree/master/examples/field-arrays
  </p>
  <Form
    {onSubmit}
    {initialValues}
    mutators={{
      ...arrayMutators
    }}
    let:form
    let:state
  >
    <form on:submit|preventDefault={form.submit}>
      <FieldArray name="users" let:fields let:meta>
        {console.log(fields.length)}
        {#each fields.names() as name, i}
          <div>
            <Field name="{name}.name" let:field>
              <label for="{name}.name">Name</label>
              <input
                name={input.name}
                on:blur={input.onBlur}
                on:focus={input.onFocus}
                on:input={(e) => input.onChange(e.target.value)}
                type="text"
                value={input.value} />
            </Field>

            <button type="button" on:click={fields.remove(i)}>-</button>
          </div>
        {/each}

        <div class="button-group">
          <button type="button" on:click={() => fields.push({ name: "", email: "" })}>+</button>
        </div>

        <pre>meta: {JSON.stringify(meta, null, 2)}</pre>
      </FieldArray>

      <button type="submit" disabled={state.submitting}>Submit</button>

      <FormStateDebugInfo {state} />
    </form>
  </Form>
</article>
