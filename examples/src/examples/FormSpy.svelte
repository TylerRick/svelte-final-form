<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../common'
  export const exampleMeta = {
    title: '<FormSpy/>',
    description: marked(`
A simple example of \`<FormSpy/>\`
`),
  }
</script>

<script>
  import { Form, FormSpy, Field, Input } from "svelte-final-form"

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const onSubmit = async values => {
    await sleep(300)
    window.alert(JSON.stringify(values, 0, 2))
  }
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  {@html marked(`

https://final-form.org/docs/react-final-form/api/FormSpy

The useFormState() hook takes one optional parameter, which matches the exact shape of FormSpyProps (except without the render props). It returns a FormSpyRenderProps.

useFormState() is used internally inside \`<FormSpy/>\`.

2. Pass an onChange callback
<FormSpy/> can sometimes be useful to execute code when a particular part of form state changes. This is what the onChange callback is for.

The field equivalent (that subscribes to the state of the field) to \`FormSpy\` is just \`Field\`. (There is no need for a separate "\`FieldSpy\`" component.)
  `)}

  <Form
    {onSubmit}
    let:form
    let:state
  >
    <form on:submit|preventDefault={form.submit}>

      <FormSpy
        subscription={{ values: true }}
        let:state
      >
        From FormSpy: values: {JSON.stringify(state.values, null, 0)}
      </FormSpy>
      <div>
        <Field name="firstName" id="first_name" type="text" let:field >
          <label for={field.input.id}>First Name</label>
          <Input
            {field}
            placeholder="First Name"
          />
        </Field>
      </div>
      <div>
        <Field name="firstName" let:field >
          Field for {field.input.name}: value: {JSON.stringify(field.input.value, null, 2)}
        </Field>
      </div>

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
