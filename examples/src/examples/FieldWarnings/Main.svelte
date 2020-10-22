<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../../common'
  export const exampleMeta = {
    title: 'Field Warnings',
    description: marked(`
Demonstrates how the power of subscriptions and mutators can be used to build a warning engine: logic to display a message next to each field that is _not_ an error (thus it does _not_ prevent form submission).
`),
    compareTo: [
      // Listed on https://final-form.org/docs/react-final-form/examples but doesn't have first-class example page
      {'react-final-form': {
        sourceURL: 'https://github.com/final-form/react-final-form/tree/master/examples/field-warnings',
        // Should be superseded by: https://codesandbox.io/s/github/final-form/react-final-form/tree/master/examples/field-warnings but that version has error:
        //   Cannot read property 'mutators' of undefined
        sandboxURL: 'https://codesandbox.io/s/m5qwxpr6o8',
      }},
    ],
    tags: [
      'subscriptions ',
      'mutators',
      'warnings',
    ],
  }
</script>

<script>
  import { Form, FormSpy, Field, Input } from "svelte-final-form"
  import setFieldData from "final-form-set-field-data";
  import WarningEngine from './WarningEngine.svelte'

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const onSubmit = async values => {
    await sleep(300);
    window.alert(JSON.stringify(values, 0, 2));
  };
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  {@html marked(`
Warnings, in this example, are defined as: suggestions to the user, like validation errors, but that do not prevent submission.

Note that the \`<WarningEngine/>\` component must be at the bottom of the form to guarantee that all the fields have registered.

Demo instructions:
1. Tab through the fields without entering anything.
2. A warning, "Recommended", should show up by each field after you blur it.
  `)}
  <Form
    {onSubmit}
    mutators={{ setFieldData }}
    let:form
    let:state={{submitting, pristine, values}}
  >
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <form on:submit|preventDefault={form.submit}>
      <WarningEngine mutators={form.mutators} />
      <Field name="firstName" let:field>
        <div>
          <label>First Name</label>
          <Input {field} placeholder="First Name" />
          {#if field.meta.touched && field.meta.data.warning}
            <span>{field.meta.data.warning}</span>
          {/if}
        </div>
        <pre>{JSON.stringify({touched: field.meta.touched, data: field.meta.data}, 0, 2)}</pre>
      </Field>
      <Field name="lastName" let:field>
        <div>
          <label>Last Name</label>
          <Input {field} placeholder="Last Name" />
          {#if field.meta.touched && field.meta.data.warning}
            <span>{field.meta.data.warning}</span>
          {/if}
        </div>
        <pre>{JSON.stringify({touched: field.meta.touched, data: field.meta.data}, 0, 2)}</pre>
      </Field>
      <div className="buttons">
        <button type="submit" disabled={submitting}>
          Submit
        </button>
        <button
          type="button"
          onClick={form.reset}
          disabled={submitting || pristine}
        >
          Reset
        </button>
      </div>
      <pre>{JSON.stringify(values, 0, 2)}</pre>
    </form>
    <FormSpy let:state>
      <FormStateDebugInfo {state} />
    </FormSpy>
  </Form>
</article>
