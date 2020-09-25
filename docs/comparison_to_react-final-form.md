# Comparison to react-final-form

# Differences due to Svelte

Most of the differences between the two libraries are due to the differences between React and Svelte:

## Slots vs. props

Just like react-final-form's Field calls your children/render function with an object containing everything you need to use or render that field, so too svelte-final-form's Field just provides a single object containing everything you need to use or render that field. The only difference is in how it is passed (and that handlers are separate from `input`). The default `Field` slot provides this field data via `let:field`.

You can destructure this, just the same as you would destructure the [render props](https://final-form.org/docs/react-final-form/types/FieldRenderProps) object in React:

  [React example?]

With svelte-final-form, it's very similar:

   let:field={{input, handlers, meta}}


## Render function becomes `let:field` + children for slot Lets

```jsx
<Field name="lastName" validate={required}>
  {({ input, meta }) => (
    …
  )}
</Field>
```

becomes:
```svelte
<Field name="lastName" validate={required} let:field={{ input, meta }}>
  … (children)
</Field>
```

# Migration guide: migrating from react-final-form

```jsx
<form onSubmit={handleSubmit}>
```
becomes
```svelte
<form on:submit|preventDefault={form.submit}>
```

## Providing a way to render the field

[examples/ComponentPropVsChildren](../examples/src/examples/ComponentPropVsChildren) illustrates the different ways of telling a Field how it should render itself.

Compare to: https://final-form.org/docs/react-final-form/api/Field#2-provide-a-way-to-render-the-field has these ways:
```
<Field component/>	'input' or 'select' or 'textarea
<Field component/>	Component
<Field render/>	Function
<Field children/>	Function
```

The first 2 of those options are supported in svelte-final-form.

But since the render prop/function  technique isn't even an option in Svelte...
Instead of using a children as render function technique...

we use slots to let you, the parent component, simply pass in whatever content you want to be renedered for each  field.


# Other differences

## `FormSpy`

react-final-form FormSpy's won't render anything if onChange is provided. This seemed like an arbitrary limitation, which svelte-final-form does not share.

- useField:
  - Pass type through as input.type
  - Pass through any restProps to field.input
  - Add optional getId/setIdToName props


## Naming

### `createForm` vs. `useForm`

react-final-form has a function `useForm` which does something much different from `useField`, yet is named in such a way that it looks like it would be very similar.

The name `useForm` is ambiguous, because it could _either_ refer to creating a new form _or_ to fetching/getting a form that has _already_ been created. The names `createForm` and `getForm`, on the other hand, make it extremely clear which of those functions they perform. Which of those functions should we have named `useForm`?

react-final-form doesn't even _provide_ a way to programmatic way to create a form in React; they _only_ provide a component for that. 
(you'd have to use the low-level `createForm` from `final-form` and duplicate a ton of work from `<Form>` if you want to use it programmatically in React); otherwise they might have realized their naming inconsistency and considered different names.

In react-final-form, they probably just used a "use" prefix for all of their functions because they are hooks, and that is the requirement/convention for hooks in React. But since this is Svelte, and they're not "hooks", we don't have to blindly follow that some convention.

As react-final-form is a mature library, they are less likely or able to rename an existing public API method since it is a breaking change. But svelte-final-form, being a newer library, has the opportunity to pick more consistent/clearer/unambiguous names from the start.

I think it would be more helful to users of this library to make a distinction between:
- which functions *create" a new object,
- which functions simply *fetch/get* an existing object,
- and which functions *subscribe* to the state of something.

The convention that was used is this:
- functions which *create" a new object: use a `create` prefix: `createForm`
- functions which simply fetch/get an existing object: use a `get` prefix: `getForm`
- functions which subscribe to the state of something: should use a verb like `subscribe` or `watch` or `listen`.
  But since it's harder to pick a good name for these functions, I just left them the same as their react-final-form counterparts and kept the same `use` prefix by default: `useFormState`, `useField`, `useFieldArray`.

We could probably make it even more consistent:
- Rename `useField` to `useFieldState` to be consistent with `useFormState`
- Since `createForm` and `useField` both "register" something new, we could have called them `registerForm` and `registerField` (useField is actually a wrapper for `registerField`)
- Since `createForm` and `useField` are both pretty much the counterpart for each other (between form and field), we could have given them the same prefix. In fact, `createForm` started out named `useForm`. That would be fine too. But since `createForm` actually sets/provides a context, for all children (and self) components to use, and field does not provide any context for children, there could also be some value in making a distinction between them.
