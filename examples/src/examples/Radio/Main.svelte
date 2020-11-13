<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../../common'
  export const exampleMeta = {
    title: 'Radio buttons',
    description: marked(`
How to use radio fields.    
`),
    compareTo: [
    ],
    tags: [
      'radio',
    ],
  }
</script>

<script>
  import { Form, Field } from "svelte-final-form"
  import { FieldErrors } from '../../common'

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const onSubmit = async values => {
    await sleep(300)
    window.alert(JSON.stringify(values, 0, 2))
  }
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  {@html marked(`
- When \`type="radio"\`, you _must_ supply a \`value\` so that the Field knows when to set the \`checked\` property. 
- The value must be a string for it to match the internal value (which gets converted to a string) and correctly show it as checked.
`)}
  <Form
    {onSubmit}
    let:form
    let:state
  >
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <form on:submit|preventDefault={form.submit}>
      <div>
        <label>Basic</label>
        <div>
          <label>
            <Field
              name="stooge"
              component="input"
              type="radio"
              value="larry"
            />{' '}
            Larry
          </label>
          <label>
            <Field
              name="stooge"
              component="input"
              type="radio"
              value="moe"
            />{' '}
            Moe
          </label>
          <label>
            <Field
              name="stooge"
              component="input"
              type="radio"
              value="curly"
            />{' '}
            Curly
          </label>
        </div>
      </div>

      {@html marked(`
- If you need to get/show meta about the field group (all of the concrete fields that share the same name), then you can wrap it in a new Field _without_ any \`component\`, \`type\`, or value \`value\` props.
- You can put the \`validate\` on any of the fields for the same name.
      `)}
      <div>
        <label>Validation</label>
        <div>
          <label>
            <Field
              name="color"
              component="input"
              type="radio"
              value="Blue"
            />{' '}
            Blue
          </label>
          <label>
            <Field
              name="color"
              component="input"
              type="radio"
              value="Green"
            />{' '}
            Green
          </label>
          <label>
            <Field
              name="color"
              component="input"
              type="radio"
              value="Purple"
            />{' '}
            Purple
          </label>
          <Field name="color"
            validate={(value) => (value == 'Blue') ? "Blue is not the correct answer." : undefined}
            let:field
          >
            <FieldErrors {field} />
          </Field>
        </div>
      </div>

      {@html marked(`
What if you want it to "blur" the field as soon as you select an option? (For example, so that it immediately shows any errors, since the error showing may depend on field.meta.touched.) You can do that with on:input. Or just change your error-showing logic to show this error unconditionally (without checking for touched)
      `)}
      <div>
        <label>Validation</label>
        <div>
          <label>
            <Field
              name="color2"
              component="input"
              type="radio"
              value="Blue"
              on:input={({detail}) => {
                console.log(detail)
                // TODO: fix bubbling event; event.target is null
                // TODO: form.blur(field.input.name)
              }}
            />{' '}
            Blue
          </label>
          <label>
            <Field
              name="color2"
              component="input"
              type="radio"
              value="Green"
              on:input={({detail}) => {
                console.log(detail)
              }}
            />{' '}
            Green
          </label>
          <label>
            <Field
              name="color2"
              component="input"
              type="radio"
              value="Purple"
              on:input={({detail}) => {
                console.log(detail)
              }}
            />{' '}
            Purple
          </label>
          <Field name="color2"
            validate={(value) => `${value} is not the correct answer.`}
            let:field
          >
            <FieldErrors {field} />
          </Field>
        </div>
      </div>
    </form>

    <FormStateDebugInfo {state} />
  </Form>
</article>
