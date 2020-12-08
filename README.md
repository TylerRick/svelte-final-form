# 🏁 Svelte Final Form

Svelte Final Form is a thin Svelte wrapper for [Final Form](https://final-form.org)

✅ Zero dependencies

✅ Only peer dependencies: Svelte and [🏁 Final Form](https://github.com/final-form/final-form#-final-form)

✅ Opt-in subscriptions - only update on the state you need!

---

Before we jump right into code, you might want to learn a little bit about the [philosophy](https://final-form.org/docs/react-final-form/philosophy) and origin story of Final Form.

## Installation

```bash
npm install --save final-form svelte-final-form
```

or

```bash
yarn add final-form svelte-final-form
```

## Architecture

Svelte Final Form is a thin Svelte wrapper for Final Form, which is a subscriptions-based form state management library that uses the Observer pattern.

By default, Svelte Final Form subscribes to all changes, but if you want to fine tune your form to optimized blazing-fast perfection, you may specify only the form state that you care about for rendering your gorgeous UI. You can think of it a little like GraphQL's feature of only fetching the data your component needs to render, and nothing else.

## Usage

```html
<script>
  import { Form, Field } from "svelte-final-form";

  // Just for example
  import Select from "svelte-select";
  // Your custom form group adapter
  import InputGroup from "components/InputGroup";

  const selectItems = ["Green", "Red", "Black"];

  const initialValues = {
    firstName: "Alexey",
    lastName: "Solilin",
    color: "Red",
  };

  const onSubmit = async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(JSON.stringify(values, undefined, 2));
  };

  const validate = (values) => {
    const errors = {};
    if (!values.firstName) {
      errors.firstName = "Required";
    }
    if (!values.lastName) {
      errors.lastName = "Required";
    }
    return errors;
  };
</script>

<Form {onSubmit} {validate} {initialValues} let:form let:state>
  <form on:submit|preventDefault={form.submit}>
    <Field name="firstName" let:field={{input, handlers, meta}}>
      <label for="firstName">First Name</label>
      <input
        {...input}
        on:blur={handlers.blur}
        on:focus={handlers.focus}
        on:input={handlers.change}
        type="text"
        placeholder="First Name"
      />
      {#if meta.touched && meta.error}
        <div>{meta.error}</div>
      {/if}
    </Field>

    <!-- You can prepare you Form Group Adapter with Label, Input, Errors -->
    <Field name="lastName" let:field>
      <InputGroup label="Last Name" type="text" {field} />
    </Field>

    <!-- Example for svelte-select -->
    <Field name="color" let:field={{input, handlers}}>
      <Select
        items={selectItems}
        selectedValue={input.value}
        on:blur={handlers.blur}
        on:focus={handlers.focus}
        on:select={({ detail }) => handlers.change(detail.value)}
      />
    </Field>

    <button type="submit" disabled={state.submitting}>Submit</button>
    or
    <button type="button" disabled={state.pristine} on:click={() => form.reset()}>Reset</button>
  </form>
</Form>
```

## `<Field component=…>` vs. passing children to `<Field>`

Conceptually, the main job of `<Field>` is to register the field and subscribe to changes. In other words, its main job is to handle the state management.

But it doesn't know how you want to _render_ the field. It is your job to tell it what you would like it to render for your field.

There are 2 main ways to tell `<Field>` what to render:

1. `<Field component=…>`

  This is the most concise way to tell it how to render. In fact, in the very simplest case, you can render a field with nothing more than a field name:

  ```
  <Field name="city" />
  ```

  You can declaratively tell it what to render using these 2 main props:
  1. `component`:
  1. `type` (if `component` is `'input'`):
  (and any other unrecognized props that you pass in will also get passed through to the input/etc. element)

  By default, it will use `component: 'input'` since that is the most common type of input.

  The downside of this option is that it is not very flexible. If you need more control over what gets rendered, then continue to read the next option:

2. Directly providing the children/HTML content for `<Field>`

  This is useful if you want to render several elements for each field, such as a label, an input, and any error messages for that field.

  You need to add `let:field` to your `Field`. From the `field` object, you can extract `input`, which in most cases you will want to spread on your `<input>` element, like this:

  ```
        <Field
          name="firstName"
          let:field={{input, handlers}}
        >
          <input
            {...input}
            …
          />
        </Field>
  ```

  That is a shorter way of doing this, and ensures that any other props that may be passed through via `input` are automatically passed through to the `input`:
  ```
        <Field
          name="firstName"
          let:field={{input, handlers}}
        >
          <input
            name={input.name}
            value={input.value}
            …
          />
        </Field>
  ```

  While you may be able to get away with not specifying a type at all (browsers seem to assume `type="text"` when no type specified),
  it is recommend to pass a type to `<Field>`.
  This allows it to know how to treat the field's value.
  This is especially important for checkboxes and multiple-selects.

  Also, even though you could pass `type` directly to the input _instead_ of passing it to the `<Field>`:
  ```
        <Field
          name="firstName"
          let:field={{input, handlers}}
        >
          <input
            {...input}
            type="text"
            on:blur={handlers.blur}
            on:focus={handlers.focus}
            on:input={handlers.change}
            placeholder="First Name"
          />
        </Field>
  ```
  it is recommended to pass it to the Field for the reason mentioned above (so that it knows how to treat the value). Since the type will get automatically passed through to the input via `{...input}`, you don't need to _also_ pass it explicitly to the input element:
  ```
        <Field
          name="firstName"
          type="text"
          let:field={{input, handlers}}
        >
          <input
            {...input}
            on:blur={handlers.blur}
            on:focus={handlers.focus}
            on:input={handlers.change}
            placeholder="First Name"
          />
        </Field>
  ```

## Lower-level API for creating form or subscribing to field changes

There are 2 main ways to use the svelte-final-form API: by wrapping with components like `<Form>` and `<Field>`, or by programmatically using the stores returned from `createForm` or `useField`.

One nice thing about <Form> and <Field> is that they auto-subscribes to the state store so you don't have to use $state within <Form let:state>.


While the provided `<Form>` and `<Field>` wrapper components work for most people's needs, if you want to use this library a bit more programmatically, you don't even need to use those components at all: you can use `createForm` and optionally `useField` directly from the script section of your component, which has the advantage of allowing you to use/reference form data directly from the script section, and making your template simpler/smaller!

[example...]

One important difference from `<Form>` and `<Field>` is that those components handle auto-subscribing to the state store. Otherwise you would have to use `$state` within your `<Form let:state>...<Form>`. `createForm` and `useField`

## API overview

This table summarizes and compares the main different pieces of the API:

svelte-final-form  | react-final-form equivalent | Description                                                     | Returns/provides |
-------------------|------------------|----------------------------------------------------------------------------|---------|
`createForm`         | `<Form>`<br/>(no direct equiv.) | Creates *and subscribes to* a final-form form.                             | [[`form`](https://final-form.org/docs/final-form/types/FormApi), [`stateStore`](https://final-form.org/docs/final-form/types/FormState)] |
`<Form>`             | [`<Form>`](https://final-form.org/docs/react-final-form/api/Form)           | Creates *and subscribes to* a final-form form. (Wrapper for createForm.)      | let:form let:state |
useFormState       | `useFormState`     | Gets *and subscribes to* a final-form form. (A form's state can have many listeners.) | [`stateStore`](https://final-form.org/docs/final-form/types/FormState) |
`<FormSpy>`          | `<FormSpy>`        | Gets *and subscribes to* a final-form form. (Wrapper for useFormState.)    | let:form let:state |
`getForm`            | `useForm`          | Gets the current form from context.                                        | []
`useField`           | `<Field>`          | Creates *and subscribes to* a final-form field.                            | [`fieldStore`](https://final-form.org/docs/react-final-form/types/FieldRenderProps) |
`<Field>`            | `<Field>`          | Creates *and subscribes to* a final-form field. (Wrapper for useField.)    | let:field |


## Examples

### To run examples locally

```
cd example
npm install
npm run dev
```


## TODO

- [ ] Write tests
- [ ] Final Form Arrays
- [ ] More docs and CodeSandbox examples for
  - [ ] Conditional Fields
  - [ ] Mutators
  - [x] Decorators
  - [ ] Validation
  - [ ] Custom Form Adapters
