<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../../common'
  export const exampleMeta = {
    title: marked(`\`<Field component=…>\` vs. passing children to \`<Field>\``),
    description: marked(`
There are a few different ways you can tell a \`<Field>\` what to render. This illustrates all of those different ways.
`),
    tags: [
      '<Field>',
    ],
  }
</script>

<script>
  import { Form, Field, Input } from "svelte-final-form"
  import { required, InputGroup } from '../../common'

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const onSubmit = async values => {
    await sleep(300)
    window.alert(JSON.stringify(values, 0, 2))
  }
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  <Form
    {onSubmit}
    let:form
    let:state
  >
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <form on:submit|preventDefault={form.submit}>
      {@html marked(`
## Minimal possible example

\`\`\`
<Field name="firstName" />
\`\`\`
      `)}
      <div>
        <label>First Name</label>
        <Field name="firstName" />
      </div>

      {@html marked(`
## Passing \`component='input'\`

\`\`\`
<Field
  name="firstName"
  component="input"
  type="text"
  placeholder="First Name"
/>
\`\`\`
      `)}
      <div>
        <label>First Name</label>
        <Field
          name="firstName"
          component="input"
          type="text"
          placeholder="First Name"
        />
      </div>

      {@html marked(`
## Passing \`component={Component}\`

\`\`\`
<Field
  component={InputGroup}
  name="firstName"
  label="First Name"
  placeholder="First Name"
  validate={required}
/>
\`\`\`
      `)}
      <div>
        <Field
          component={InputGroup}
          name="firstName"
          label="First Name"
          placeholder="First Name"
          validate={required}
        />
      </div>

      {@html marked(`
## Passing children directly: \`<Input>\`

\`\`\`
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
  />
</Field>
\`\`\`
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
          />
        </Field>
      </div>

      {@html marked(`
## Passing children directly: long-hand

\`\`\`
<Field
  name="firstName"
  type="text"
  let:field={{input, handlers}}
>
  <label for={input.id}>First Name</label>
  <input
    {...input}
    on:blur={handlers.onBlur}
    on:focus={handlers.onFocus}
    on:input={handlers.onChange}
    placeholder="First Name"
  />
</Field>
\`\`\`
      `)}
      <div>
        <Field
          name="firstName"
          type="text"
          let:field={{input, handlers}}
        >
          <label for={input.id}>First Name</label>
          <input
            {...input}
            on:blur={handlers.onBlur}
            on:focus={handlers.onFocus}
            on:input={handlers.onChange}
            placeholder="First Name"
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
