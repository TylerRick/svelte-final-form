<script>
  import { onDestroy, onMount } from "svelte";
  import { Form, Field, Input } from "svelte-final-form"
  import FormStateDebugInfo from '../common/FormStateDebugInfo.svelte'
  import marked from 'marked'

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const onSubmit = async values => {
    await sleep(300)
    window.alert(JSON.stringify(values, 0, 2))
  }
</script>

<article class="final-form-example">
  {@html marked(`
# Simple example with no validation

Uses the built-in DOM inputs: input, select, and textarea to build a form with no validation.

Compare to react-final-form:
[Example](https://final-form.org/docs/react-final-form/examples/simple)
([Sandbox](https://codesandbox.io/s/github/final-form/react-final-form/tree/master/examples/simple?file=/index.js))
`)}
  <Form
    {onSubmit}
    initialValues={{ stooge: 'larry', employed: false }}
    let:form
    let:state
  >
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <form on:submit|preventDefault={form.submit}>
      <div>
        <Field name="firstName" let:field >
          <label for={field.input.name}>First Name</label>
          <Input
            {field}
            type="text"
            placeholder="First Name"
          />
        </Field>
      </div>

      <div>
        <Field name="lastName" let:field >
          <label for={field.input.name}>Last Name</label>
          <Input
            {field}
            type="text"
            placeholder="Last Name"
          />
        </Field>
      </div>

      <div>
        <Field name="employed" let:field>
          <label for={field.input.name}>Employed</label>
          <Input {field} type="checkbox" />
        </Field>
      </div>
      <div>
        <label for="favoriteColor">Favorite Color</label>
        <Field name="favoriteColor" component="select">
          <option />
          <option value="#ff0000">❤️ Red</option>
          <option value="#00ff00">💚 Green</option>
          <option value="#0000ff">💙 Blue</option>
        </Field>
      </div>
      <div>
        <label for="toppings">Toppings</label>
        <Field name="toppings" component="select" multiple>
          <option value="chicken">🐓 Chicken</option>
          <option value="ham">🐷 Ham</option>
          <option value="mushrooms">🍄 Mushrooms</option>
          <option value="cheese">🧀 Cheese</option>
          <option value="tuna">🐟 Tuna</option>
          <option value="pineapple">🍍 Pineapple</option>
        </Field>
      </div>
      <div>
        <label>Sauces</label>
        <div>
          <label>
            <Field
              name="sauces"
              component="input"
              type="checkbox"
              value="ketchup"
            />{' '}
            Ketchup
          </label>
          <label>
            <Field
              name="sauces"
              component="input"
              type="checkbox"
              value="mustard"
            />{' '}
            Mustard
          </label>
          <label>
            <Field
              name="sauces"
              component="input"
              type="checkbox"
              value="mayonnaise"
            />{' '}
            Mayonnaise
          </label>
          <label>
            <Field
              name="sauces"
              component="input"
              type="checkbox"
              value="guacamole"
            />{' '}
            Guacamole 🥑
          </label>
        </div>
      </div>

      <div>
        <label>Best Stooge</label>
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
      <div>
        <label>Notes</label>
        <Field name="notes" component="textarea" placeholder="Notes" />
      </div>

      <div>
        <button type="submit" disabled={state.submitting}>Submit</button>
        <button type="button" disabled={state.pristine} on:click={() => form.reset()}>Reset</button>
      </div>
    </form>

    <FormStateDebugInfo {state} />
  </Form>
</article>
