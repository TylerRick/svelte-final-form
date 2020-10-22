<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../common'
  export const exampleMeta = {
    title: 'Asynchronous Field-Level Validation',
    description: marked(`
Triggers an async validation (remote request) to check if a field is valid.
`),
    compareTo: [
      // Listed on https://final-form.org/docs/react-final-form/examples but doesn't have first-class example page (https://final-form.org/docs/react-final-form/examples/async-field-level-validation)
      {'react-final-form': {
        sourceURL: 'https://github.com/final-form/react-final-form/tree/master/examples/async-field-level-validation',
        // (old sandbox URL: https://codesandbox.io/s/wy7z7q5zx5)
      }},
    ]
  }
</script>

<script>
  import { Form, Field, Input } from "svelte-final-form"
  import { Spinner } from '../common'

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const onSubmit = async values => {
    await sleep(300);
    window.alert(JSON.stringify(values, undefined, 2));
  };

  const required = value => (value ? undefined : "Required");
  const mustBeNumber = value => (isNaN(value) ? "Must be a number" : undefined);
  const minValue = min => value =>
    isNaN(value) || value >= min ? undefined : `Should be greater than ${min}`;
  const composeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || validator(value), undefined);

  const simpleMemoize = fn => {
    let lastArg;
    let lastResult;
    return arg => {
      if (arg !== lastArg) {
        lastArg = arg;
        lastResult = fn(arg);
      }
      return lastResult;
    };
  };

  // 
  const usernameAvailable = simpleMemoize(async value => {
    // console.log('checking username', value)
    if (!value) {
      return "Required";
    }
    await sleep(500);
    if (
      ~["john", "paul", "george", "ringo"].indexOf(value && value.toLowerCase())
    ) {
      return "Username taken!";
    }
  });

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
      <Field name="username" validate={usernameAvailable} let:field>
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
