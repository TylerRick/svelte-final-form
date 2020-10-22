<script context="module">
  import marked from 'marked'
  export const exampleMeta = {
    title: 'Field Arrays',
    description: marked(`
Demonstrates how to use the \`<FieldArray/>\` component to render an array of inputs, as well as use \`push\`, \`pop\`, and \`remove\` mutations.
`),
    basedOnSourceCodeUrl: 'https://github.com/final-form/react-final-form/tree/master/examples/field-arrays',
  }
</script>

<script>
  import { Form, Field, FieldArray, Input } from 'svelte-final-form'
  import arrayMutators from 'final-form-arrays'
  import FormStateDebugInfo from '../../common/FormStateDebugInfo.svelte'

  const onSubmit = async (values) => {
    await sleep(300)
    window.alert(JSON.stringify(values, undefined, 2))
  }
</script>

<article class="final-form-example">
  {@html marked(`
# ${exampleMeta.title}

${exampleMeta.description}

Compare to react-final-form:
([Sandbox](${exampleMeta.basedOnSourceCodeUrl.replace('https://github.com/', 'https://codesandbox.io/s/github/')}))
  `)}

  <Form
    {onSubmit}
    mutators={{
      ...arrayMutators
    }}
    let:form
    let:state
  >
    <form on:submit|preventDefault={form.submit}>

      <div>
        <label for="company">Company</label>
        <Field name="company" component="input" />
      </div>
      <div class="buttons">
        <button
          type="button"
          on:click={() => form.mutators.push('customers', undefined)}
        >
          Add Customer
        </button>
        <button type="button" on:click={() => form.mutators.pop('customers')}>
          Remove Customer
        </button>
      </div>

      <FieldArray name="customers" let:fields let:meta>
        {#each fields.names() as name, index (name)}
          <div>
            <label for={`${name}.firstName`}>Cust. #{index + 1}</label>
            <Field
              name={`${name}.firstName`}
              component="input"
              placeholder="First Name"
            />
            <Field
              name={`${name}.lastName`}
              component="input"
              placeholder="Last Name"
            />
            <span on:click={() => fields.remove(index)} >
              ❌
            </span>
          </div>
        {/each}

        <pre>FieldArray meta: {JSON.stringify(meta, null, 2)}</pre>
      </FieldArray>

      <div class="buttons">
        <button type="submit" disabled={state.submitting || state.pristine}>
          Submit
        </button>
        <button
          type="button"
          onClick={form.reset}
          disabled={state.submitting || state.pristine}
        >
          Reset
        </button>
      </div>

      <FormStateDebugInfo {state} />
    </form>
  </Form>
</article>

<style>
form {
  max-width: 600px;
}
div > span {
  cursor: pointer;
}
.buttons {
  justify-content: center;
}
</style>
