<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../common'
  export const exampleMeta = {
    title: 'Event handlers',
    description: marked(`
svelte-final-form provides event handlers for focus, blur, and input, which update the final-form state with things like which field is currently active and which fields have been touched or changed.

This demo shows how to use these handlers and how to and attach them to the input.
`),
    compareTo: [
    ],
    tags: [
      'field-level validation',
      'synchronous',
      'useHandlers',
    ],
  }
</script>

<script>
  import { Form, Field, useHandlers } from "svelte-final-form"
  import { required, composeValidators } from '../common'
  import InputGroup from '../common/InputGroup.svelte'

  const onSubmit = async (values) => {
    console.log('submitted:', JSON.stringify(values, undefined, 2))
  };
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  {@html marked(`
How to test if handlers are working:
- focus: check that state.active shows the name of the active field
- blur: check that state.active no longer shows the name of the previously active field; if you left field blank, check that validation error now appears.
- input: check that the new value now appears in state.values
  `)}

  <Form
    {onSubmit}
    let:form
    let:state
  >
    <div class="form-container-row">
      <form on:submit|preventDefault={form.submit}>

        <p>If attaching handlers manually, you need to attach focus, blur, and input.</p>
        <Field name="firstName" validate={required} let:field={{input, handlers, meta}}>
          <div>
          <label for="firstName">First Name</label>
          <input
            name={input.name}
            value={input.value}
            on:blur={handlers.blur}
            on:focus={handlers.focus}
            on:input={handlers.change}
            type="text"
            placeholder="First Name"
          />
          {#if meta.touched && meta.error}
            <div>{meta.error}</div>
          {/if}
          </div>
        </Field>

        {@html marked(`
To attach all handlers at once, concisely, you can use the \`useHandlers\` action. (But only on native elements; Svelte doesn't let you use actions on components, unfortunately.)

By default (to keep with react-final-form naming convention for \`change\` handler), this binds the \`change\` handler to the \`change\` event, but you are free to bind this to the
[\`input\` event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event) instead if you want \`state.values\` to be updated more immediately (while the user is typing, for example).
        `)}
        <Field name="firstName" validate={required} let:field={{input, handlers, meta}}>
          <div>
          <label for="firstName">First Name</label>
          <input
            name={input.name}
            value={input.value}
            use:useHandlers={{...handlers, input: handlers.change, change: null}}
            type="text"
            placeholder="First Name"
          />
          {#if meta.touched && meta.error}
            <div>{meta.error}</div>
          {/if}
          </div>
        </Field>

        <p>The provided `change` handler can be passed either the change event itself or a strang value. For regular  
          {@html marked.parseInline(`\`<input>\``)}s (including text/radio/checkbox), it knows how to extract the string value from the event target.
          For custom/3rd-party input/select components, you may have to extract the value yourself and pass just the value to the `change` handler.
        </p>
        <Field name="firstName" validate={required} let:field={{input, handlers, meta}}>
          <div>
          <label for="firstName">First Name</label>
          <input
            name={input.name}
            value={input.value}
            on:blur={handlers.blur}
            on:focus={handlers.focus}
            on:input={(e) => handlers.change(e.target.value)}
            type="text"
            placeholder="First Name"
          />
          {#if meta.touched && meta.error}
            <div>{meta.error}</div>
          {/if}
          </div>
        </Field>

        <p>If using InputGroup, it will automatically attach the event handlers for you.</p>
        <Field name="firstName" validate={required} let:field>
          <div>
            <InputGroup
              {field}
              type="text"
              label="First Name"
              placeholder="First Name"
            />
          </div>
        </Field>

        <div>
          <button type="submit" disabled={state.submitting}>Submit</button>
        </div>
      </form>

      <FormStateDebugInfo {state} />
    </div>
  </Form>
</article>
