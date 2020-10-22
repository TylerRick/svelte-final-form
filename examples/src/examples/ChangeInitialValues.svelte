<script>
  import { Form, Field } from "svelte-final-form"
  import InputGroup from '../common/InputGroup.svelte'
  import FormStateDebugInfo from '../common/FormStateDebugInfo.svelte'

  let initialValues = {
    firstName: "Alexey",
    lastName: "Solilin",
  }
  let keepDirtyOnReinitialize = true

  const onSubmit = (values) => {
    console.log(JSON.stringify(values, undefined, 2))
  }
</script>

<article>
  <p>To verify that <a href="https://github.com/jetrockets/svelte-final-form/pull/3">Re-config when the initial values change</a> functionality continues to work.</p>
  <p>It seems to reset _all_ state.values if we change initialValues — unless we set keepDirtyOnReinitialize to true.<p>
  <p>To test:</p>
  <ul>
    <li>In main form, enter new last name</li>
    <li>Change initialValues.firstName</li>
    <li>Verify that main form first name is changed to initialValues.firstName, but last name stays the same (still shows new (dirty) last name).</li>
  </ul>
  <p>Note that form.reset() seems to have no effect when keepDirtyOnReinitialize is set. This may be a bug in final-form. But this seems to be consistent with <a href="https://codesandbox.io/s/nostalgic-wildflower-tdunh?file=/index.js">how it works in react-final-form</a>.</p>
  <p>It also may be a bug that pristine is relative to the _initial_ initialValues and not to the _new_ initialValues.</p>
  <p>(Note that you cannot use bind:value to directly mutate initialValues because then whenValueChanges would be comparing the same initialValues variable with itself and would not detect that it had changed.)</p>

  <fieldset>
    <div>initialValues:</div>
    <div>
      <!-- Can't use: bind:value={initialValues.firstName} -->
      <input
        value={initialValues.firstName}
        on:input={(event) => initialValues = {...initialValues, firstName: event.target.value}}
        placeholder="First Name"
      />
    </div>
    <div>
      <input
        value={initialValues.lastName}
        on:input={(event) => initialValues = {...initialValues, lastName: event.target.value}}
        placeholder="Last Name"
      />
    </div>

    <label>
      <input
        type="checkbox"
        bind:checked={keepDirtyOnReinitialize}
      />
      keepDirtyOnReinitialize
    </label>
  </fieldset>

  <fieldset>
    <div>Main form:</div>
    <Form {onSubmit} {initialValues} keepDirtyOnReinitialize={keepDirtyOnReinitialize} let:form let:state>
      <form on:submit|preventDefault={form.submit}>
        <Field name="firstName" let:field>
          <div>
            <InputGroup
              {field}
              type="text"
              label="First Name"
              placeholder="First Name"
            />
          </div>
        </Field>
        <Field name="lastName" let:field>
          <div>
            <InputGroup
              {field}
              type="text"
              label="Last Name"
              placeholder="Last Name"
            />
          </div>
        </Field>

        <div>
          <button type="submit" disabled={state.submitting}>Submit</button>
          <button type="button" disabled={state.pristine} on:click={() => form.reset()}>Reset</button>
        </div>

        <pre>state.pristine: {JSON.stringify(state.pristine, null, 2)}</pre>
        <pre>state.values: {JSON.stringify(state.values, null, 2)}</pre>
        <pre>state: {JSON.stringify(state, null, 2)}</pre>

      </form>
    </Form>
  </fieldset>
</article>
