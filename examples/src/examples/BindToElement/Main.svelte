<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../../common'
  export const exampleMeta = {
    title: marked(` \`bind:element\``),
    description: marked(`
Shows how you can use bind:element on \`<Field>\` or \`<Input>\`
`),
    tags: [
      '<Field>',
    ],
  }
</script>

<script>
  import { Form, Field, Input } from "svelte-final-form"
  import { required, InputGroup } from '../../common'

  let input_1
  let input_2
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  <Form
    onSubmit={() => {}}
    let:form
    let:state
  >
    <form on:submit|preventDefault={form.submit}>
      {@html marked(`
## \`<Field bind:element>\`
      `)}
      <div>
        <label>First Name</label>
        <Field name="firstName" bind:element={input_1} />
      </div>
      <div>
        <button type="button" on:click={() => input_1.focus()}>Focus element</button>
      </div>

      {@html marked(`
## \`<Input bind:element>\`
      `)}
      <div>
        <Field
          name="firstName"
          id="firstName"
          type="text"
          let:field
        >
          <label for={field.input.id}>First Name</label>
          <Input
            {field}
            placeholder="First Name"
            bind:element={input_2}
          />
        </Field>
      </div>
      <div>
        <button type="button" on:click={() => input_2.focus()}>Focus element</button>
      </div>

    </form>

    <FormStateDebugInfo {state} />
  </Form>
</article>
