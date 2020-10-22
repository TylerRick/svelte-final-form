<script context="module">
  import marked from 'marked'
  export const exampleMeta = {
    title: 'Field Arrays: using useFieldArray',
    description: marked(`
A variation of [Arrays](/Arrays) that uses createForm and useFieldArray in the \`<script>\` instead of wrapping template with \`<Form>\`> and \`<FieldArray>\`>.
`),
    basedOnSourceCodeUrl: 'https://github.com/final-form/react-final-form/tree/master/examples/field-arrays',
  }
</script>


<script>
  import { createForm, useFieldArray, Field } from 'svelte-final-form'
  import arrayMutators from 'final-form-arrays'
  import FormStateDebugInfo from '../../common/FormStateDebugInfo.svelte'

  const onSubmit = async (values) => {
    console.log(JSON.stringify(values, undefined, 2));
  };
  const [form, stateStore] = createForm({
    onSubmit,
    mutators: {
      ...arrayMutators
    },
  })
  $: state = $stateStore

  const {fields: fieldsStore, meta: metaStore} = useFieldArray('customers')
  let fields, meta
  $: [fields, meta] = [$fieldsStore, $metaStore]
  // TODO: Why is meta.length undefined on first render? Is it that way in react-final-form too?

  // Examples of referencing fields state from script section:
  const addRow = () => fields.push({})
  const removeRow = (i = undefined) => typeof i === 'number' ? fields.remove(i) : fields.pop()
  $: countMessage = `There are now ${fields.length} customers.`
</script>

<article class="final-form-example">
  {@html marked(`
# ${exampleMeta.title}

${exampleMeta.description}

Compared to [Arrays](/Arrays), the advantages of this approach include:
1. allows you to move more of your logic to the script section: you can reference form/fields state in the script section
1. makes the HTML template section simpler: wastes fewer indentation levels on wrapper components like Form,
  `)}

  <form on:submit|preventDefault={form.submit}>
    <div>
      <label for="company">Company</label>
      <Field name="company" component="input" />
    </div>
    <div class="buttons">
      <button
        type="button"
        on:click={addRow}
      >
        Add Customer
      </button>
      <button type="button" on:click={removeRow}>
        Remove Customer
      </button>
    </div>

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
        <span on:click={() => removeRow(index)} >
          ❌
        </span>
      </div>
    {/each}

    <p>{countMessage}</p>
    <pre>useFieldArray meta: {JSON.stringify(meta, null, 2)}</pre>

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
