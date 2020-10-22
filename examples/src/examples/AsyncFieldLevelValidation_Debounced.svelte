<script context="module">
  import marked from 'marked'
  export const exampleMeta = {
    title: 'AsyncFieldLevelValidation_Debounced',
    description: marked(`
Debounce input so it only triggers the async validation (remote request) after user pauses typing.
`),
    compareTo: [
      {variantOf: 'AsyncFieldLevelValidation'},
    ]
  }
</script>

<script>
  import debounce from 'debounce-promise'
  import { Form, Field, Input } from "svelte-final-form"
  import { ExampleHeader, FormStateDebugInfo, Spinner } from '../common'

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const onSubmit = async values => {
    await sleep(300)
    window.alert(JSON.stringify(values, undefined, 2))
  }

  const required = value => (value ? undefined : "Required")
  const mustBeNumber = value => (isNaN(value) ? "Must be a number" : undefined)
  const minValue = min => value =>
    isNaN(value) || value >= min ? undefined : `Should be greater than ${min}`
  const composeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || validator(value), undefined)

  const usernameAvailable = async value => {
    console.log('async checking username', value)
    await sleep(500)
    if (
      ~["john", "paul", "george", "ringo"].indexOf(value && value.toLowerCase())
    ) {
      return "Username taken!"
    }
  }
  const usernameAvailableDebounced = debounce(usernameAvailable, 500)
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  {@html marked(`
Usernames John, Paul, George or Ringo will fail async validation.
  `)}


  <!-- svelte-ignore a11y-label-has-associated-control -->
  <Form
    onSubmit={onSubmit}
    let:form
    let:state={{ handleSubmit, reset, submitting, pristine, values, errors }}
  >
    <form on:submit|preventDefault={form.submit}>
      <Field name="username" validate={composeValidators(required, usernameAvailableDebounced)} let:field>
        <div>
          <label>Username</label>
          <Input {field} type="text" placeholder="Username" />
          {#if field.meta.error && field.meta.touched}<span>{field.meta.error}</span>{/if}
          {#if field.meta.validating}<Spinner />{/if}
        </div>
        <pre>field.meta.error: {field.meta.error}</pre>
      </Field>
      <Field name="lastName" validate={required} let:field>
        <div>
          <label>Last Name</label>
          <Input {field} type="text" placeholder="Last Name" />
          {#if field.meta.error && field.meta.touched}<span>{field.meta.error}</span>{/if}
        </div>
      </Field>
      <Field
        name="age"
        validate={composeValidators(required, mustBeNumber, minValue(18))}
        let:field
      >
        <div>
          <label>Age</label>
          <Input {field} type="text" placeholder="Age" />
          {#if field.meta.error && field.meta.touched}<span>{field.meta.error}</span>{/if}
        </div>
      </Field>
      <div className="buttons">
        <button type="submit" disabled={submitting}>
          Submit
        </button>
        <button
          type="button"
          on:click={reset}
          disabled={submitting || pristine}
        >
          Reset
        </button>
      </div>
      <pre>{JSON.stringify(errors, 0, 2)}</pre>
      <pre>{JSON.stringify(values, 0, 2)}</pre>
    </form>
  </Form> 
</article>
