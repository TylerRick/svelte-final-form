<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../../common'
  export const exampleMeta = {
    title: 'Simple: with functional labels',
    description: marked(`
A variation of [Simple](/Simple) that shows how to use \`<label for={field.input.id}>\` so that clicking on label actually focuses the input.
`),
    compareTo: [
      {variantOf: 'Simple'},
    ],
  }
</script>

<script>
  import { Form, Field, Input } from "svelte-final-form"

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const onSubmit = async values => {
    await sleep(300)
    window.alert(JSON.stringify(values, 0, 2))
  }
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  {@html marked(`
By putting the label inside of \`<Field>\` we can easily reference the field's \`input.id\` and use that as the value of the label's \`for\` attribute so that they are guaranteed to match:
  
- Pass \`setIdToName\` if you want to use the name as the id
- Or pass a custom id to \`<Field>\`

Or you can just wrap the field in a \`<label>\` — but that triggers a svelte a11y warning, for some reason — and also happens to break this flex-based layout, which requires the label to be a sibling of the input rather than a parent.
  `)}

  <Form
    {onSubmit}
    initialValues={{ stooge: 'larry', employed: false }}
    let:form
    let:state
  >
    <form on:submit|preventDefault={form.submit}>
      <p>(This shows how you can pass an id to Field and reuse that in both the label and the Input:)</p>
      <div>
        <Field name="firstName" id="first_name" type="text" let:field >
          <label for={field.input.id}>First Name</label>
          <Input
            {field}
            placeholder="First Name"
          />
        </Field>
      </div>

      <p>(And this shows how you can use name as the id:)</p>
      <div>
        <Field name="lastName" setIdToName type="text" let:field >
          <label for={field.input.id}>Last Name</label>
          <Input
            {field}
            placeholder="Last Name"
          />
        </Field>
      </div>

      <div>
        <button type="submit" disabled={state.submitting}>Submit</button>
        <button type="button" disabled={state.pristine} on:click={() => form.reset()}>Reset</button>
      </div>
    </form>

    <FormStateDebugInfo {state} />
  </Form>
</article>
