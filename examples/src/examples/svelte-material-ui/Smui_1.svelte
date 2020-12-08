<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../../common'
  export const exampleMeta = {
    title: 'svelte-material-ui',
    description: marked(`
Demonstrates how to integrate with svelte-material-ui.

These techniques show how you could adapt to work with just about any custom component, and the different props and events that they may use.
`),
    tags: ['svelte-material-ui', 'text field', 'radio', 'checkbox', 'array'],
  }
</script>

<script>
  import { Form, Field } from 'svelte-final-form'
  import Textfield, { Textarea } from '@smui/textfield'
  import HelperText from '@smui/textfield/helper-text/index'
  import { required, FieldErrors, inputPropsForSmuiTextfield, inputPropsForSmuiRadio, inputPropsForSmuiCheckbox } from '../../common'
  import Radio from '@smui/radio'
  import Checkbox from '@smui/checkbox'
  import FormField from '@smui/form-field'
  import Button, { Label, Icon as ButtonIcon } from '@smui/button'

  const stoogeOptions = ['larry', 'curly', 'moe']
  const sauceOptions = ['ketchup', 'mustard', 'mayonnaise', 'guacamole']

  const fillIn = (form) => {
    form.initialize({})
    Object.entries({
      firstName: "Tyler",
      employedNative: true,
      employed: true,
      saucesNative: [
        "ketchup",
        "mustard"
      ],
      sauces: [
        "ketchup",
        "mustard"
      ],
      stoogeNative: "curly",
      stooge: "curly",
    }).forEach(([key, value]) => {
      form.change(key, value)
    })
  }

  const onSubmit = (values) => {
    window.alert(JSON.stringify(values, undefined, 2))
  }
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<article class="smui">
  <ExampleHeader {exampleMeta} />
  {@html marked(`
Tab through fields to see the "required" error show up for each of them.
  `)}

  <Form {onSubmit} initialValues={{}} let:form let:state>
    <div class="form-container-row">
      <form on:submit|preventDefault={form.submit}>
        {@html marked(`
---
## Text

        `)}
        <div>
          <Field name="firstName" type="text" validate={required} let:field>
            <Textfield
              variant="outlined"
              {...inputPropsForSmuiTextfield(field.input)}
              label="First name"
              on:blur={field.handlers.blur}
              on:focus={field.handlers.focus}
              on:input={field.handlers.change}
            />
            <HelperText id={inputPropsForSmuiTextfield(field.input)['input$aria-describedby']}>
              This is usually the name that your parents gave you when you were born.
            </HelperText>
            <FieldErrors {field} />
          </Field>

        {@html marked(`
---
## Radio

### Native input (for comparison)
        `)}

        <label>Best Stooge</label>
        <div>
          {#each stoogeOptions as stoogeOption}
            <Field name="stoogeNative" type="radio" value={stoogeOption} let:field>
              <label>
                <input
                  {...field.input}
                  on:blur={field.handlers.blur}
                  on:focus={field.handlers.focus}
                  on:input={field.handlers.change}
                />
                {stoogeOption}
              </label>
            </Field>
          {/each}
          <Field name="stoogeNative" validate={required} let:field>
            <FieldErrors {field} />
          </Field>
        </div>

        {@html marked(`
### svelte-material-ui
        `)}
        <label>Best Stooge</label>
        <div>
          {#each stoogeOptions as stoogeOption}
            <Field name="stooge" type="radio" value={stoogeOption} let:field>
              <div>
                <FormField>
                  <Radio
                    {...inputPropsForSmuiRadio(field)}
                    on:blur={field.handlers.blur}
                    on:focus={field.handlers.focus}
                    on:input={field.handlers.change}
                  />
                  <span slot="label">{stoogeOption}</span>
                </FormField>
              </div>
            </Field>
          {/each}
          <Field name="stooge" validate={required} let:field>
            <FieldErrors {field} />
          </Field>
        </div>

        {@html marked(`
---
## Checkboxes: Stand-alone (boolean value)

### Native input (for comparison)
        `)}

        <div>
          <Field name="employedNative" type="checkbox" validate={required} let:field>
            <label>
              <input
                {...field.input}
                on:blur={field.handlers.blur}
                on:focus={field.handlers.focus}
                on:input={field.handlers.change}
                value="1"
              />
              Employed?
            </label>
            <FieldErrors {field} />
          </Field>
        </div>

        {@html marked(`

### svelte-material-ui
        `)}
        <div>
          <Field name="employed" type="checkbox" validate={required} let:field>
            <div>
              <FormField>
                <Checkbox
                  {...inputPropsForSmuiCheckbox(field.input)}
                  on:blur={field.handlers.blur}
                  on:focus={field.handlers.focus}
                  on:input={field.handlers.change}
                  input$value="1"
                />
                <span slot="label">Employed?</span>
              </FormField>
            </div>
            <FieldErrors {field} />
          </Field>
        </div>

        {@html marked(`
---
## Checkboxes: Group (array value)

### Native input (for comparison)
        `)}

        <div>
          {#each sauceOptions as sauceOption}
            <Field name="saucesNative" type="checkbox" value={sauceOption} let:field>
              <label>
                <input
                  {...field.input}
                  on:blur={field.handlers.blur}
                  on:focus={field.handlers.focus}
                  on:input={field.handlers.change}
                />
                {sauceOption}
              </label>
            </Field>
          {/each}
          <Field name="saucesNative" validate={required} let:field>
            <FieldErrors {field} />
          </Field>
        </div>

        {@html marked(`

### svelte-material-ui
        `)}
        <div>
          {#each sauceOptions as sauceOption}
            <Field name="sauces" type="checkbox" value={sauceOption} let:field>
              <FormField>
                <Checkbox
                  {...inputPropsForSmuiCheckbox(field.input)}
                  on:blur={field.handlers.blur}
                  on:focus={field.handlers.focus}
                  on:input={field.handlers.change}
                  input$value="1"
                />
                <span slot="label">{sauceOption}</span>
              </FormField>
            </Field>
          {/each}
          <Field name="sauces" validate={required} let:field>
            <FieldErrors {field} />
          </Field>
        </div>

        <hr/>
        <div>
          <button type="submit" disabled={state.submitting}>Submit</button>
          <button type="button" on:click={() => fillIn(form)}>Fill in</button>
          <button type="button" disabled={state.pristine} on:click={() => form.reset()}>Reset</button>
        </div>
      </form>
      <FormStateDebugInfo {state} />
    </div>
  </Form>
</article>

<style>
</style>
