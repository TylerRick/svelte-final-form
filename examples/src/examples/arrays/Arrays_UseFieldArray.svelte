<script>
  import { useForm, useFieldArray, Field } from 'svelte-final-form'
  import FormStateDebugInfo from '../../common/FormStateDebugInfo.svelte'

  import arrayMutators from 'final-form-arrays'

  const initialValues = {
    users: [
      {name: 'user 1'},
      {name: 'user 2'},
    ]
  };

  const onSubmit = async (values) => {
    console.log(JSON.stringify(values, undefined, 2));
  };
  const [form, state] = useForm({
    onSubmit,
    initialValues,
    mutators: {
      ...arrayMutators
    },
  })
  const {fields: usersFields, meta: usersMeta} = useFieldArray('users')
  $: console.log($usersFields.length)

  const addRow = () => $usersFields.push({ name: "", email: "" })
</script>

<article class="final-form-example">
  <p>Compared to <a href="/Arrays">Arrays.svelte</a>, this approach: 1. makes the HTML template section simpler: wastes less indentation levels on wrapper components like Form, 2. allows you to use form/fields state in script section</p>

  <form on:submit|preventDefault={form.submit}>
    {#each $usersFields.names() as name, i}
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

        <button type="button" on:click={$usersFields.remove(i)}>-</button>
      </div>
    {/each}

    <div class="button-group">
      <button type="button" on:click={addRow}>+ Add another</button>
    </div>

    <pre>meta: {JSON.stringify($usersMeta, null, 2)}</pre>

    <button type="submit" disabled={$state.submitting}>Submit</button>

    <FormStateDebugInfo state={$state} />
  </form>
</article>
