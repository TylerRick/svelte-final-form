<script>
  import { Form, FormSpy, Field } from "svelte-final-form";

  export let mutators
  const { setFieldData } = mutators
</script>

<FormSpy
  subscription={{ values: true }}
  onChange={({ values }) => {
    setFieldData("firstName", {
      warning: values.firstName ? undefined : "Recommended"
    });
    setFieldData("lastName", {
      warning: values.lastName ? undefined : "Recommended"
    });
  }}
/>
